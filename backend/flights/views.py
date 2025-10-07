import re
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from django.conf import settings
import isodate
DUFFEL_BASE = "https://api.duffel.com"
from django.http import JsonResponse
from .services import duffel_service
from .serializers import (
    PaymentIntentCreateSerializer,
    PaymentIntentConfirmSerializer,
    HoldOrderPaymentSerializer
)
import logging
logger = logging.getLogger(__name__)
from .models import Order, Passenger, Payment, OrderPassenger , FlightPaymentTransaction
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from datetime import datetime, date
import re
import phonenumbers
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt  # since you are using csrf_exempt

from rest_framework.permissions import AllowAny

def _fmt_dt(dt_string):
    """Format datetime string to readable format"""
    if not dt_string:
        return "N/A"
    try:
        dt = datetime.fromisoformat(dt_string.replace('Z', '+00:00'))
        return dt.strftime("%I:%M %p").lstrip('0')
    except:
        return "N/A"



def parse_iso(dt: Optional[str]) -> Optional[datetime]:
    if not dt:
        return None
    # handle trailing Z
    try:
        if dt.endswith("Z"):
            dt = dt.replace("Z", "+00:00")
        return datetime.fromisoformat(dt)
    except Exception:
        return None



def parse_iso_duration_to_minutes(iso_dur: Optional[str]) -> Optional[int]:
    if not iso_dur:
        return None
    m = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?", iso_dur)
    if not m:
        return None
    hours = int(m.group(1) or 0)
    mins = int(m.group(2) or 0)
    return hours * 60 + mins



def normalize_baggage(raw: Any) -> Dict[str, Any]:
    if not raw:
        return {}
    # raw could be dict like {"pieces":1, "weight":{"value":7,"unit":"kg"}} or strings
    out = {}
    if isinstance(raw, dict):
        if "pieces" in raw:
            out["pieces"] = raw.get("pieces")
        # try common weight patterns
        if "weight" in raw:
            w = raw["weight"]
            if isinstance(w, dict) and "value" in w and "unit" in w:
                out["weight"] = f"{w['value']} {w['unit']}"
            else:
                out["weight"] = str(w)
        # fallback keys
        if "max_weight" in raw:
            out["weight"] = raw.get("max_weight")
        if "allowance" in raw:
            out["raw_allowance"] = raw.get("allowance")
    else:
        # if it's a string like "7 kg / 1 piece"
        out["raw"] = str(raw)
    return out


def parse_iso(dt_str):
    try:
        return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    except:
        return None





class LocationSearchView(APIView):
    def get(self, request):
        query = request.query_params.get("query")
        if not query:
            return Response({"error": "Query is required"}, status=status.HTTP_400_BAD_REQUEST)

        url = f"https://api.duffel.com/places/suggestions?query={query}"
        headers = {
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Duffel-Version": "v2"
        }

        r = requests.get(url, headers=headers)
        if r.status_code != 200:
            return Response(
                {"error": "Duffel API error", "details": r.json()},
                status=r.status_code
            )

        data = r.json()

        results = [
            {
                "id": place.get("id"),
                "name": place.get("name"),
                "iata_code": place.get("iata_code"),
                "type": place.get("type"),
                "city": place.get("city_name"),
                "country": place.get("country_name"),
            }
            for place in data.get("data", [])
        ]

        return Response({"results": results}, status=status.HTTP_200_OK)


# views.py - Complete FlightListView
class FlightListView(APIView):
    def post(self, request):
        try:
            # Get flight type from request data or default to one_way
            flight_type = request.data.get("flight_type", "one_way").lower()
            
            # Build slices based on flight type
            if flight_type == "multi_city":
                flights_data = request.data.get("flights", [])
                if not flights_data or len(flights_data) < 2:
                    return JsonResponse({
                        "status": "error",
                        "message": "Multi-city requires at least 2 flights"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                slices = []
                for flight in flights_data:
                    slices.append({
                        "origin": flight.get("from", "").upper(),
                        "destination": flight.get("to", "").upper(),
                        "departure_date": flight.get("departure_date")
                    })
                    
            elif flight_type == "round_trip":
                origin = request.data.get("origin", "").upper()
                destination = request.data.get("destination", "").upper()
                departure_date = request.data.get("departure_date")
                return_date = request.data.get("return_date")
                
                if not all([origin, destination, departure_date, return_date]):
                    return JsonResponse({
                        "status": "error",
                        "message": "Missing required fields for round-trip"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                slices = [
                    {
                        "origin": origin,
                        "destination": destination,
                        "departure_date": departure_date
                    },
                    {
                        "origin": destination,
                        "destination": origin,
                        "departure_date": return_date
                    }
                ]
                
            else:  # one_way
                origin = request.data.get("origin", "").upper()
                destination = request.data.get("destination", "").upper()
                departure_date = request.data.get("departure_date")
                
                if not all([origin, destination, departure_date]):
                    return JsonResponse({
                        "status": "error",
                        "message": "Missing required fields for one-way flight"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                slices = [{
                    "origin": origin,
                    "destination": destination,
                    "departure_date": departure_date
                }]

            # Validate slices
            for slice_obj in slices:
                if not all([slice_obj["origin"], slice_obj["destination"], slice_obj["departure_date"]]):
                    return JsonResponse({
                        "status": "error",
                        "message": "Each flight segment must have origin, destination, and departure_date"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                if len(slice_obj["origin"]) != 3 or not slice_obj["origin"].isalpha():
                    return JsonResponse({
                        "status": "error",
                        "message": f"Invalid origin IATA code: {slice_obj['origin']}"
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
                if len(slice_obj["destination"]) != 3 or not slice_obj["destination"].isalpha():
                    return JsonResponse({
                        "status": "error",
                        "message": f"Invalid destination IATA code: {slice_obj['destination']}"
                    }, status=status.HTTP_400_BAD_REQUEST)

            # Build passengers
            passengers = []
            travelers = request.data.get("travelers", {})
            adults_count = travelers.get("adults", 1)
            children_count = travelers.get("children", 0)
            infants_count = travelers.get("infants", 0)

            for _ in range(adults_count):
                passengers.append({"type": "adult"})
            for _ in range(children_count):
                passengers.append({"type": "child"})
            for _ in range(infants_count):
                passengers.append({"type": "infant"})

            if not passengers:
                return JsonResponse({
                    "status": "error",
                    "message": "At least one passenger is required"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Validate cabin class
            valid_cabins = ["economy", "premium_economy", "business", "first"]
            cabin_class = request.data.get("cabin_class", "economy").lower()
            if cabin_class not in valid_cabins:
                cabin_class = "economy"

            # Build Duffel request
            search_data = {
                "data": {
                    "slices": slices,
                    "passengers": passengers,
                    "cabin_class": cabin_class
                }
            }

            print("Sending to Duffel API:", search_data)

            # Duffel API request
            url = "https://api.duffel.com/air/offer_requests"
            headers = {
                "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Duffel-Version": "v2"
            }

            response = requests.post(url, json=search_data, headers=headers, timeout=30)

            if response.status_code != 201:
                error_msg = self._extract_error_message(response)
                return JsonResponse({
                    "status": "error",
                    "message": "Flight search failed",
                    "error": error_msg
                }, status=response.status_code)

            # Transform response
            data = response.json()
            all_offers = data.get("data", {}).get("offers", [])
            
            itineraries = self._transform_offers(all_offers, passengers, request.data)
            
            return JsonResponse({
                "status": "success",
                "message": f"Found {len(itineraries)} flight options",
                "flight_type": flight_type,
                "search": self._build_search_summary(request.data, slices, passengers, flight_type),
                "results": {
                    "total": len(itineraries),
                    "itineraries": itineraries
                },
                "filters": self._build_filters(itineraries),
                "metadata": {
                    "searchId": data.get("data", {}).get("id", ""),
                    "timestamp": datetime.now().isoformat()
                }
            }, status=status.HTTP_200_OK)

        except requests.exceptions.Timeout:
            return JsonResponse({
                "status": "error",
                "message": "Flight search timeout",
                "error": "Request to flight provider timed out"
            }, status=status.HTTP_504_GATEWAY_TIMEOUT)

        except Exception as e:
            logger.error(f"Flight search error: {str(e)}")
            return JsonResponse({
                "status": "error",
                "message": "Failed to search flights",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _extract_error_message(self, response):
        try:
            error_data = response.json()
            return error_data.get("errors", [{}])[0].get("title", "Unknown error")
        except:
            return response.text

    def _build_search_summary(self, request_data, slices, passengers, flight_type):
        travelers = request_data.get("travelers", {})
        
        search_summary = {
            "flight_type": flight_type,
            "route": [{"from": s["origin"], "to": s["destination"], "date": s["departure_date"]} for s in slices],
            "travelers": {
                "adults": travelers.get("adults", 1),
                "children": travelers.get("children", 0),
                "infants": travelers.get("infants", 0),
                "total": len(passengers)
            },
            "preferences": {
                "cabinClass": request_data.get("cabin_class", "economy").title(),
            }
        }
        
        # Add specific data based on flight type
        if flight_type == "round_trip":
            search_summary["dates"] = {
                "departure": request_data.get("departure_date"),
                "return": request_data.get("return_date")
            }
        elif flight_type == "one_way":
            search_summary["dates"] = {
                "departure": request_data.get("departure_date")
            }
        elif flight_type == "multi_city":
            search_summary["flights"] = request_data.get("flights", [])
            
        return search_summary

    def _transform_offers(self, offers, passengers, request_data):
        itineraries = []
        for offer in offers:
            try:
                offer_id = offer.get("id")
                total_amount = float(offer.get("total_amount", 0))
                total_currency = offer.get("total_currency", "GBP")
                slices = offer.get("slices", [])
                if not slices:
                    continue

                segments = []
                total_duration_minutes = 0
                for slice_obj in slices:
                    slice_segments = slice_obj.get("segments", [])
                    for segment in slice_segments:
                        duration_str = self._calculate_duration(segment.get("duration"))
                        duration_minutes = self._parse_duration_to_minutes(segment.get("duration"))
                        total_duration_minutes += duration_minutes
                        dep_time = self._format_time(segment.get("departing_at"))
                        arr_time = self._format_time(segment.get("arriving_at"))
                        operating_carrier = segment.get("operating_carrier", {})
                        marketing_carrier = segment.get("marketing_carrier", {})
                        airline_name = operating_carrier.get("name") or marketing_carrier.get("name") or "Unknown Airline"
                        flight_number = f"{marketing_carrier.get('iata_code', '')}{segment.get('marketing_carrier_flight_number', '')}"
                        # ✅ Add airline logo
                        airline_logo = operating_carrier.get("logo_lockup_url") or marketing_carrier.get("logo_lockup_url") or ""

                        segments.append({
                            "airline": airline_name,
                            "flightNumber": flight_number,
                            "duration": duration_str,
                            "stops": "Non-stop",
                            "departure": {
                                "time": dep_time,
                                "airportCode": segment.get("origin", {}).get("iata_code", ""),
                                "airportName": segment.get("origin", {}).get("name", "")
                            },
                            "arrival": {
                                "time": arr_time,
                                "airportCode": segment.get("destination", {}).get("iata_code", ""),
                                "airportName": segment.get("destination", {}).get("name", "")
                            },
                            "layover": False,
                            "airlineLogo": airline_logo  # 👈 Added field
                        })

                total_duration = self._minutes_to_duration_string(total_duration_minutes)
                summary = self._build_itinerary_summary(segments, total_duration)
                airlines = list(set(seg['airline'] for seg in segments))
                duffel_passengers = offer.get("passengers", [])
                itinerary = {
                    "id": offer_id,
                    "totalPrice": f"{total_currency} {total_amount:.0f}",
                    "priceAmount": total_amount,
                    "totalDuration": total_duration,
                    "airlines": airlines,
                    "tripType": "Round-trip" if len(slices) == 2 else ("One-way" if len(slices) == 1 else "Multi-city"),
                    "summary": summary,
                    "segments": segments,
                    "travelers": len(passengers),
                    "cabinClass": request_data.get("cabin_class", "economy").title(),
                    "fareType": request_data.get("fare_type", "regular").title(),
                    "passengers": duffel_passengers,
                    "offerDetails": {
                        "base_amount": offer.get("base_amount"),
                        "base_currency": offer.get("base_currency"),
                        "tax_amount": offer.get("tax_amount"),
                        "tax_currency": offer.get("tax_currency"),
                        "expires_at": offer.get("expires_at"),
                        "payment_requirements": offer.get("payment_requirements", {}),
                        "passenger_identity_documents_required": offer.get("passenger_identity_documents_required", False),
                        "conditions": offer.get("conditions", {}),
                        "available_services": offer.get("available_services"),
                    }
                }
                itineraries.append(itinerary)
            except Exception as e:
                logger.error(f"Error processing offer {offer.get('id')}: {str(e)}")
                continue
        itineraries.sort(key=lambda x: x.get("priceAmount", 0))
        return itineraries

    def _calculate_duration(self, duration_str):
        if not duration_str:
            return "N/A"
        try:
            if duration_str.startswith('PT'):
                hours = 0
                minutes = 0
                if 'H' in duration_str:
                    hours = int(duration_str.split('H')[0].replace('PT',''))
                if 'M' in duration_str:
                    min_part = duration_str.split('H')[1] if 'H' in duration_str else duration_str.replace('PT','')
                    minutes = int(min_part.replace('M',''))
                return f"{hours}h {minutes}m"
            else:
                total_minutes = int(float(duration_str))
                return f"{total_minutes//60}h {total_minutes%60}m"
        except:
            return "N/A"

    def _parse_duration_to_minutes(self, duration_str):
        if not duration_str:
            return 0
        try:
            if duration_str.startswith('PT'):
                hours = 0
                minutes = 0
                if 'H' in duration_str:
                    hours = int(duration_str.split('H')[0].replace('PT',''))
                if 'M' in duration_str:
                    min_part = duration_str.split('H')[1] if 'H' in duration_str else duration_str.replace('PT','')
                    minutes = int(min_part.replace('M',''))
                return hours*60 + minutes
            else:
                return int(float(duration_str))
        except:
            return 0

    def _minutes_to_duration_string(self, total_minutes):
        if total_minutes <= 0:
            return "N/A"
        return f"{total_minutes//60}h {total_minutes%60}m"

    def _format_time(self, iso_time):
        if not iso_time:
            return "N/A"
        try:
            dt = datetime.fromisoformat(iso_time.replace('Z','+00:00'))
            return dt.strftime("%I:%M %p").lstrip('0')
        except:
            return "N/A"

    def _build_itinerary_summary(self, segments, total_duration):
        if not segments:
            return ""
        first_segment = segments[0]
        last_segment = segments[-1]
        stops = len(segments)-1
        stops_text = "0 stops" if stops==0 else f"{stops} stop{'s' if stops>1 else ''}"
        return f"{first_segment['departure']['time']} {first_segment['departure']['airportCode']} → {last_segment['arrival']['time']} {last_segment['arrival']['airportCode']} • {total_duration} • {stops_text}"

    def _build_filters(self, itineraries):
        if not itineraries:
            return {
                "priceRange": {"min": 0, "max": 0, "currency": "GBP"},
                "airlines": [],
                "departureTimes": ["morning", "afternoon", "evening", "night"],
                "stops": ["non_stop", "1_stop", "2_plus_stops"],
                "durations": ["short", "medium", "long"]
            }
        
        # Price range
        prices = [itinerary["priceAmount"] for itinerary in itineraries]
        currency = itineraries[0]["totalPrice"].split(" ")[0] if itineraries else "GBP"
        
        # Airlines
        airlines = set()
        for itinerary in itineraries:
            for airline in itinerary["airlines"]:
                airlines.add(airline)
        
        # Departure times analysis
        departure_times = []
        for itinerary in itineraries:
            for segment in itinerary.get("segments", []):
                dep_time = segment["departure"]["time"]
                if dep_time != "N/A":
                    # Convert to hour for categorization
                    try:
                        hour = int(dep_time.split(':')[0])
                        if 'PM' in dep_time and hour != 12:
                            hour += 12
                        if hour >= 6 and hour < 12:
                            departure_times.append("morning")
                        elif hour >= 12 and hour < 18:
                            departure_times.append("afternoon")
                        elif hour >= 18 and hour < 24:
                            departure_times.append("evening")
                        else:
                            departure_times.append("night")
                    except:
                        continue
        
        return {
            "priceRange": {
                "min": min(prices),
                "max": max(prices),
                "currency": currency
            },
            "airlines": list(airlines),
            "departureTimes": list(set(departure_times)),
            "stops": ["non_stop", "1_stop", "2_plus_stops"],
            "durations": ["short", "medium", "long"]
        }



class FlightDetailsView(APIView):
    """
    GET -> Enriched flight details by offer_id (offers + offer_requests + airlines + aircraft + seat_maps)
    """

    def get(self, request, offer_id: str):
        headers = {
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
            "Accept": "application/json",
            "Duffel-Version": "v2",
        }

        try:
            # 1) Fetch Offer
            offer_res = requests.get(f"{DUFFEL_BASE}/air/offers/{offer_id}", headers=headers, timeout=10)
            offer_res.raise_for_status()
            offer = offer_res.json().get("data") or {}

            if not offer:
                return JsonResponse({"error": "offer not found"}, status=status.HTTP_404_NOT_FOUND)

            # 2) Slices and segments safely
            slices = offer.get("slices") or []
            if not slices:
                return JsonResponse({"error": "offer has no slices"}, status=status.HTTP_404_NOT_FOUND)

            slice0 = slices[0]
            segments = slice0.get("segments") or []
            if not segments:
                return JsonResponse({"error": "no segments found for this slice"}, status=status.HTTP_404_NOT_FOUND)

            segment = segments[0]

            # 3) Flight times and duration
            dep_dt = parse_iso(segment.get("departing_at"))
            arr_dt = parse_iso(segment.get("arriving_at"))
            duration_minutes = None
            if dep_dt and arr_dt:
                duration_minutes = int((arr_dt - dep_dt).total_seconds() // 60)
            else:
                duration_minutes = parse_iso_duration_to_minutes(slice0.get("duration") or segment.get("duration"))

            # 4) Offer Request for cabin, fare brand, baggage
            offer_request_id = offer.get("offer_request") or offer.get("offer_request_id")
            req = {}
            cabin_class = None
            fare_brand = None
            baggage_cabin = {}
            baggage_checked = {}

            if offer_request_id:
                try:
                    req_res = requests.get(f"{DUFFEL_BASE}/air/offer_requests/{offer_request_id}", headers=headers, timeout=8)
                    if req_res.status_code == 200:
                        req = req_res.json().get("data") or {}
                        cabin_class = req.get("cabin_class") or req.get("cabin_class_marketing_name")
                        fare_brand = req.get("cabin_class_marketing_name") or req.get("fare_brand_name")
                        passengers = req.get("passengers") or []
                        if passengers:
                            p0 = passengers[0]
                            baggage_cabin = normalize_baggage(p0.get("cabin_baggage") or p0.get("baggage_allowances") or p0.get("baggages") or {})
                            baggage_checked = normalize_baggage(p0.get("checked_baggage") or p0.get("baggage_allowances") or p0.get("baggages") or {})
                except Exception:
                    pass

            # fallback to conditions
            conditions = offer.get("conditions") or {}
            if not baggage_cabin:
                baggage_cabin = normalize_baggage(conditions.get("cabin_baggage") or {})
            if not baggage_checked:
                baggage_checked = normalize_baggage(conditions.get("checked_baggage") or {})

            # 5) Airline info
            airline_code = (segment.get("operating_carrier") or {}).get("iata_code")
            airline = {}
            if airline_code:
                try:
                    a_res = requests.get(f"{DUFFEL_BASE}/air/airlines/{airline_code}", headers=headers, timeout=6)
                    if a_res.status_code == 200:
                        airline = a_res.json().get("data") or {}
                except Exception:
                    pass

            # 6) Aircraft info
            aircraft_code = (segment.get("aircraft") or {}).get("iata_code") or (offer.get("aircraft") or {}).get("iata_code")
            aircraft = {}
            if aircraft_code:
                try:
                    ac_res = requests.get(f"{DUFFEL_BASE}/air/aircraft/{aircraft_code}", headers=headers, timeout=6)
                    if ac_res.status_code == 200:
                        aircraft = ac_res.json().get("data") or {}
                except Exception:
                    pass

            # 7) Seat map
            seat_map_summary = {"layout": None, "available_seats": None, "seat_pitch": None, "details": None}
            try:
                sm_res = requests.get(f"{DUFFEL_BASE}/air/seat_maps?offer_id={offer_id}", headers=headers, timeout=8)
                if sm_res.status_code == 200:
                    sm_data = sm_res.json().get("data") or []
                    if sm_data:
                        seat_map_summary["details"] = sm_data[0]
                        # available seats
                        seats = sm_data[0].get("seats") or sm_data[0].get("seat_map", {}).get("seats") or []
                        seat_map_summary["available_seats"] = sum(1 for s in seats if s.get("available") is True) if seats else "Limited"
                        seat_map_summary["seat_pitch"] = sm_data[0].get("seat_pitch") or (sm_data[0].get("seat_map") or {}).get("seat_pitch")
            except Exception:
                pass

            # 8) Amenities
            services = segment.get("services") or offer.get("services") or slice0.get("services") or []
            meal_included = False
            wifi_available = False
            cabin_crew = None
            if isinstance(services, list):
                for s in services:
                    t = (s.get("type") or "").lower()
                    if "meal" in t or "food" in t:
                        meal_included = True
                    if "wifi" in t:
                        wifi_available = True
            elif isinstance(services, dict):
                s_str = str(services).lower()
                meal_included = "meal" in s_str or "food" in s_str
                wifi_available = "wifi" in s_str

            # fallback flags
            meal_included = meal_included or bool(conditions.get("meal_included") or conditions.get("meals_included"))
            wifi_available = wifi_available or bool(airline.get("wifi") or airline.get("has_wifi") or airline.get("inflight_wifi"))
            cabin_crew = (segment.get("cabin_crew") or segment.get("crew_count")) or None

            # check-in
            checkin_close = None
            if dep_dt:
                checkin_close = (dep_dt - timedelta(minutes=45)).isoformat()

            # pricing
            pricing = {
                "total_amount": offer.get("total_amount"),
                "currency": offer.get("total_currency"),
                "base_amount": offer.get("base_amount"),
                "tax_amount": offer.get("tax_amount"),
            }

            # excess baggage
            excess_fee = conditions.get("excess_baggage_fee") or conditions.get("excess_baggage_charge") or None

            flight_data = {
                "airline": {
                    "name": airline.get("name") or (segment.get("operating_carrier") or {}).get("name"),
                    "code": airline.get("iata_code") or (segment.get("operating_carrier") or {}).get("iata_code"),
                    "logo": airline.get("logo_symbol_url") or None
                },
                "flightNumber": segment.get("marketing_carrier_flight_number") or segment.get("operating_carrier_flight_number") or "",
                "display": {
                    "duration_str": f"{duration_minutes // 60}h {duration_minutes % 60}m" if duration_minutes else None,
                    "non_stop": len(segments) == 1
                },
                "duration_minutes": duration_minutes,
                "stops": len(segments) - 1,
                "departure": {
                    "time": segment.get("departing_at"),
                    "airport": (segment.get("origin") or {}).get("name"),
                    "code": (segment.get("origin") or {}).get("iata_code"),
                    "terminal": (segment.get("origin") or {}).get("terminal") or "N/A",
                    "checkin_closes_at": checkin_close
                },
                "arrival": {
                    "time": segment.get("arriving_at"),
                    "airport": (segment.get("destination") or {}).get("name"),
                    "code": (segment.get("destination") or {}).get("iata_code"),
                    "terminal": (segment.get("destination") or {}).get("terminal") or "N/A",
                },
                "itinerary": {
                    "seat_pitch": seat_map_summary.get("seat_pitch"),
                    "aircraft": aircraft.get("name") or (segment.get("aircraft") or {}).get("name"),
                    "cabin_crew_count": cabin_crew,
                    "wifi_available": wifi_available,
                    "meal_included": meal_included
                },
                "cabin_class": cabin_class or segment.get("cabin_class") or "N/A",
                "fare_brand": fare_brand or offer.get("fare_brand_name") or "N/A",
                "baggage": {
                    "cabin": baggage_cabin or {},
                    "checked": baggage_checked or {}
                },
                "pricing": pricing,
                "policies": {
                    "change_before_departure": conditions.get("change_before_departure"),
                    "refund_before_departure": conditions.get("refund_before_departure"),
                    "excess_baggage_fee": excess_fee
                },
                "seat_map": seat_map_summary,
            }

            return JsonResponse(flight_data, status=status.HTTP_200_OK)

        except requests.exceptions.HTTPError as e:
            details = {}
            try:
                details = offer_res.json()
            except Exception:
                details = {"msg": "no json body"}
            return JsonResponse({"error": "Duffel HTTPError", "details": details}, status=getattr(offer_res, "status_code", 502))

        except requests.exceptions.RequestException as e:
            return JsonResponse({"error": "Duffel request failed", "details": str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        except Exception as e:
            return JsonResponse({"error": "internal server error", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class DuffelAPIClient:
    """Centralized Duffel API client for multiple endpoints"""
    
    def __init__(self):
        self.base_url = "https://api.duffel.com"
        self.headers = {
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
            "Accept": "application/json",
            "Duffel-Version": "v2",
            "User-Agent": "FlightBooking/1.0",
            "Accept-Encoding": "gzip"
        }
        self.timeout = 30
    
    def _make_request(self, method: str, endpoint: str, params: Dict = None, json_data: Dict = None) -> Dict:
        """Make HTTP request to Duffel API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                params=params,
                json=json_data,
                timeout=self.timeout
            )
            
            logger.info(f"Duffel API {method} {endpoint}: {response.status_code}")
            
            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                logger.warning(f"Resource not found: {endpoint}")
                return None
            else:
                logger.error(f"API error {response.status_code}: {response.text}")
                response.raise_for_status()
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed for {endpoint}: {str(e)}")
            raise
    
    def get_offer(self, offer_id: str) -> Dict:
        """Get single offer with available services"""
        return self._make_request(
            "GET", 
            f"/air/offers/{offer_id}",
            params={"return_available_services": "true"}
        )
    
    def get_available_services(self, offer_request_id: str) -> Dict:
        """Get available services for offer request"""
        return self._make_request(
            "GET",
            f"/air/offer_requests/{offer_request_id}/available_services"
        )
    
    def get_seat_maps(self, offer_id: str = None, slice_id: str = None) -> Dict:
        """Get seat maps for offer or slice"""
        params = {}
        if offer_id:
            params["offer_id"] = offer_id
        if slice_id:
            params["slice_id"] = slice_id
            
        return self._make_request("GET", "/air/seat_maps", params=params)
    
    def confirm_offer(self, offer_id: str) -> Dict:
        """Confirm offer to check real-time availability"""
        return self._make_request(
            "POST",
            f"/air/offers/{offer_id}/actions/confirm"
        )



class FlightOfferView(APIView):
    """
    Flight Offer View with integrated Duffel APIs

    Uses:
    - Offers API: Base offer details
    - Available Services API: Add-ons (baggage/services)
    - Seat Maps API: Seat availability
    - Offer Confirm API: Real-time validation
    """

    def __init__(self):
        super().__init__()
        self.duffel_client = DuffelAPIClient()

    # -------------------------------
    # Helpers
    # -------------------------------

    def _extract_route_info(self, slices: List[Dict]) -> Dict[str, Any]:
        """Extract full route info including flight numbers, duration, times"""
        if not slices:
            return {
                "route": "N/A",
                "time_range": "N/A",
                "flight_numbers": [],
                "total_duration_minutes": 0,
                "departure_time": None,
                "arrival_time": None,
                "slice_ids": []
            }

        route_parts, all_flight_numbers = [], set()
        total_duration_minutes, departure_times, arrival_times, slice_ids = 0, [], [], []

        for slice_data in slices:
            slice_ids.append(slice_data.get("id"))
            segments = slice_data.get("segments", [])
            if not segments:
                continue

            # Origin & Destination
            first_segment, last_segment = segments[0], segments[-1]
            origin = first_segment.get("origin", {})
            destination = last_segment.get("destination", {})

            origin_name = origin.get("city_name") or origin.get("iata_city_code") or origin.get("name", "Unknown")
            dest_name = destination.get("city_name") or destination.get("iata_city_code") or destination.get("name", "Unknown")

            route_parts.append(f"{origin_name} → {dest_name}")

            # Departure / Arrival
            if first_segment.get("departing_at"):
                departure_times.append(first_segment["departing_at"])
            if last_segment.get("arriving_at"):
                arrival_times.append(last_segment["arriving_at"])

            # Flight numbers & durations
            for segment in segments:
                flight_num = segment.get("operating_carrier_flight_number") or segment.get("marketing_carrier_flight_number")
                if flight_num:
                    all_flight_numbers.add(str(flight_num))

                duration_str = segment.get("duration")
                if duration_str:
                    try:
                        duration = isodate.parse_duration(duration_str)
                        total_duration_minutes += int(duration.total_seconds() / 60)
                    except Exception as e:
                        logger.debug(f"Failed to parse segment duration {duration_str}: {e}")

        # Time range
        earliest_dep = min(departure_times) if departure_times else None
        latest_arr = max(arrival_times) if arrival_times else None
        time_range = f"{_fmt_dt(earliest_dep)} - {_fmt_dt(latest_arr)}" if earliest_dep and latest_arr else "N/A"

        return {
            "route": " | ".join(route_parts) if route_parts else "N/A",
            "time_range": time_range,
            "flight_numbers": sorted(list(all_flight_numbers)),
            "total_duration_minutes": total_duration_minutes,
            "departure_time": earliest_dep,
            "arrival_time": latest_arr,
            "slice_ids": slice_ids
        }

    def _extract_baggage_from_services(self, available_services: List[Dict], passenger_id: str) -> Dict[str, str]:
        """Extract baggage safely, default to airline policy if missing"""
        baggage_info = {"cabin": "As per Airlines Policy", "checked": "As per Airlines Policy"}

        if not available_services:
            return baggage_info

        for service in available_services:
            if service.get("type") != "baggage":
                continue
            if passenger_id not in service.get("passenger_ids", []) and service.get("passenger_ids"):
                continue

            metadata = service.get("metadata", {})
            baggage_type = (metadata.get("type") or "").lower()
            weight = metadata.get("maximum_weight_kg") or metadata.get("weight_kg")

            if "cabin" in baggage_type or "carry" in baggage_type:
                baggage_info["cabin"] = f"{weight} KG /Adult" if weight else baggage_info["cabin"]
            elif "checked" in baggage_type:
                baggage_info["checked"] = f"{weight} KG /Adult" if weight else baggage_info["checked"]

        return baggage_info

    def _extract_seat_availability(self, seat_maps: List[Dict], cabin_class: str) -> str:
        """Count available seats, fallback Limited/N/A"""
        if not seat_maps:
            return "N/A"

        total_available = 0
        for seat_map in seat_maps:
            for cabin in seat_map.get("cabins", []):
                if cabin_class.lower() not in (cabin.get("cabin_class") or "").lower():
                    continue
                for row in cabin.get("rows", []):
                    for seat in row.get("seats", []):
                        if seat.get("available", False) or seat.get("available_services"):
                            total_available += 1

        return str(total_available) if total_available else "Limited"

    # -------------------------------
    # Core Fetchers
    # -------------------------------

    def _fetch_comprehensive_offer_data(self, offer_id: str) -> Dict[str, Any]:
        """Fetches base offer, services, seat maps, confirm availability"""
        offer_response = self.duffel_client.get_offer(offer_id)
        if not offer_response or not offer_response.get("data"):
            raise ValueError("No offer data returned from API")

        base_offer = offer_response["data"]
        offer_request_id = base_offer.get("offer_request_id") or base_offer.get("offer_request", {}).get("id")

        # Route
        route_info = self._extract_route_info(base_offer.get("slices", []))

        # Services
        available_services = []
        if offer_request_id:
            try:
                resp = self.duffel_client.get_available_services(offer_request_id)
                available_services = resp.get("data", []) if resp else []
            except Exception as e:
                logger.warning(f"Available services fetch failed: {e}")

        # Seat maps
        seat_availability = "N/A"
        try:
            seat_maps_resp = self.duffel_client.get_seat_maps(offer_id=offer_id)
            if seat_maps_resp and seat_maps_resp.get("data"):
                cabin_class = "Economy"
                slices = base_offer.get("slices", [])
                if slices:
                    segments = slices[0].get("segments", [])
                    if segments and segments[0].get("passengers"):
                        first_passenger = segments[0]["passengers"][0]
                        cabin_class = (first_passenger.get("cabin_class_marketing_name") or
                                       first_passenger.get("cabin_class", "economy")).title()
                seat_availability = self._extract_seat_availability(seat_maps_resp["data"], cabin_class)
        except Exception as e:
            logger.warning(f"Seat maps fetch failed: {e}")

        # Offer confirm
        offer_confirmed = False
        try:
            confirm_resp = self.duffel_client.confirm_offer(offer_id)
            offer_confirmed = bool(confirm_resp.get("data"))
        except Exception as e:
            logger.warning(f"Offer confirm failed: {e}")

        return {
            "base_offer": base_offer,
            "available_services": available_services,
            "seat_availability": seat_availability,
            "route_info": route_info,
            "offer_confirmed": offer_confirmed
        }

    # -------------------------------
    # Fare Packages
    # -------------------------------

    def _create_fare_packages(self, base_offer: Dict, available_services: List[Dict], seat_availability: str) -> List[Dict]:
        """Generate fare packages (Saver/Value/Flex) with baggage rules"""
        base_price = float(base_offer.get("total_amount", "0"))
        currency = base_offer.get("total_currency", "GBP")

        passengers = base_offer.get("passengers", [])
        first_passenger_id = passengers[0].get("id") if passengers else "passenger_0"

        # Cabin class & baggage defaults
        slices, cabin_class = base_offer.get("slices", []), "Economy"
        base_baggage = {"cabin": "As per Airlines Policy", "checked": "As per Airlines Policy"}

        if slices:
            segments = slices[0].get("segments", [])
            if segments:
                segment_passengers = segments[0].get("passengers", [])
                if segment_passengers:
                    first_passenger = segment_passengers[0]
                    cabin_class = (first_passenger.get("cabin_class_marketing_name") or
                                   first_passenger.get("cabin_class", "economy")).title()

                    for baggage in first_passenger.get("baggages", []):
                        btype, qty = baggage.get("type", ""), baggage.get("quantity", 0)
                        if btype in ["carry_on", "cabin"] and qty > 0:
                            base_baggage["cabin"] = f"{qty} KG /Adult"
                        elif btype == "checked" and qty > 0:
                            base_baggage["checked"] = f"{qty} KG /Adult"

        enhanced_baggage = self._extract_baggage_from_services(available_services, first_passenger_id)
        final_baggage = {
            "cabin": enhanced_baggage["cabin"] if enhanced_baggage["cabin"] != "As per Airlines Policy" else base_baggage["cabin"],
            "checked": enhanced_baggage["checked"] if enhanced_baggage["checked"] != "As per Airlines Policy" else base_baggage["checked"]
        }

        # Fare variants
        variants = []
        if cabin_class.lower() == "economy":
            variants = [
                {"name": "Economy Saver", "desc": "Essential travel with carry-on included", "mult": 1.0, "cabin_bonus": 0, "checked_bonus": 0},
                {"name": "Economy Value", "desc": "More flexibility and comfort", "mult": 1.29, "cabin_bonus": 0, "checked_bonus": 5},
                {"name": "Economy Flex", "desc": "Maximum flexibility and benefits", "mult": 1.59, "cabin_bonus": 3, "checked_bonus": 10}
            ]
        elif cabin_class.lower() == "business":
            variants = [
                {"name": "Business Classic", "desc": "Business class comfort", "mult": 1.0, "cabin_bonus": 0, "checked_bonus": 0},
                {"name": "Business Flex", "desc": "Premium service & flexibility", "mult": 1.25, "cabin_bonus": 5, "checked_bonus": 10}
            ]
        else:
            variants = [{"name": f"{cabin_class} Standard", "desc": "Standard service", "mult": 1.0, "cabin_bonus": 0, "checked_bonus": 0}]

        # Build packages
        fares = []
        for v in variants:
            price = base_price * v["mult"]
            baggage = final_baggage.copy()

            for bt in ["cabin", "checked"]:
                if "KG" in baggage[bt] and v[f"{bt}_bonus"] > 0:
                    try:
                        weight = int(baggage[bt].split(" ")[0]) + v[f"{bt}_bonus"]
                        baggage[bt] = f"{weight} KG /Adult"
                    except Exception:
                        pass

            fares.append({
                "name": v["name"],
                "description": v["desc"],
                "price": f"{currency} {price:.2f}",
                "baggage": baggage,
                "available_seats": seat_availability,
                "continue": True
            })
        return fares

    # -------------------------------
    # Response Composer
    # -------------------------------

    def _compose_comprehensive_ui(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Compose clean UI response with all integrated data"""
        base_offer, services, seat_avail, route_info, confirmed = (
            data["base_offer"], data["available_services"], data["seat_availability"], data["route_info"], data["offer_confirmed"]
        )

        owner, passengers = base_offer.get("owner", {}), base_offer.get("passengers", [])

        # Duration format
        duration_str = "N/A"
        if route_info["total_duration_minutes"] > 0:
            h, m = divmod(route_info["total_duration_minutes"], 60)
            duration_str = f"{h}h {m}m" if h and m else f"{h}h" if h else f"{m}m"

        # Fares
        fares = self._create_fare_packages(base_offer, services, seat_avail)

        # Cabin class
        cabin_class = "Economy"
        slices = base_offer.get("slices", [])
        if slices:
            segs = slices[0].get("segments", [])
            if segs and segs[0].get("passengers"):
                first_p = segs[0]["passengers"][0]
                cabin_class = (first_p.get("cabin_class_marketing_name") or first_p.get("cabin_class", "economy")).title()

        return {
            "airline_title": owner.get("name", "Unknown Airline"),
            "airline_subtitle": owner.get("name", "Unknown Airline"),
            "time_range": route_info["time_range"],
            "route": route_info["route"],
            "flight_number": ", ".join(route_info["flight_numbers"]) or "N/A",
            "duration": duration_str,
            "total_passengers": len(passengers),
            "cabin_class": cabin_class,
            "available_seats": seat_avail,
            "fares": fares,
            "raw_offer_data": {
                "id": base_offer.get("id"),
                "created_at": base_offer.get("created_at"),
                "expires_at": base_offer.get("expires_at"),
                "total_amount": base_offer.get("total_amount"),
                "total_currency": base_offer.get("total_currency"),
                "live_mode": base_offer.get("live_mode"),
                "partial": base_offer.get("partial")
            },
            "api_data_sources": {
                "offers_api": True,
                "available_services_api": bool(services),
                "seat_maps_api": seat_avail != "N/A",
                "offer_confirm_api": confirmed
            }
        }

    # -------------------------------
    # Views
    # -------------------------------

    def get(self, request, offer_id: Optional[str] = None):
        if not offer_id:
            offer_id = request.query_params.get("offer_id")
        if not offer_id:
            return JsonResponse({"error": "Missing offer_id"}, status=status.HTTP_400_BAD_REQUEST)
        if not offer_id.startswith("off_"):
            return JsonResponse({"error": "Invalid offer ID format"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if not getattr(settings, "DUFFEL_ACCESS_TOKEN", None):
                raise ValueError("Server configuration error - missing API token")

            data = self._fetch_comprehensive_offer_data(offer_id.strip())
            ui_data = self._compose_comprehensive_ui(data)
            return JsonResponse(ui_data, status=status.HTTP_200_OK)

        except requests.exceptions.HTTPError as e:
            code = getattr(e.response, "status_code", 502) if e.response else 502
            if code == 404:
                return JsonResponse({"error": "Offer not found or expired"}, status=404)
            if code == 401:
                return JsonResponse({"error": "Authentication failed"}, status=502)
            return JsonResponse({"error": f"Flight provider error: {code}"}, status=502)

        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {e}")
            return JsonResponse({"error": "Unable to connect to provider"}, status=502)

        except ValueError as e:
            return JsonResponse({"error": str(e)}, status=400 if "configuration" not in str(e) else 500)

        except Exception as e:
            logger.error(f"Unexpected error: {e}", exc_info=True)
            return JsonResponse({"error": "Internal server error"}, status=500)

    def post(self, request, *args, **kwargs):
        try:
            offer_id = kwargs.get("offer_id") or request.data.get("offer_id", "").strip()
            if not offer_id:
                return JsonResponse({"error": "Missing offer_id"}, status=400)
            return self.get(request, offer_id)
        except Exception as e:
            logger.error(f"POST error: {e}")
            return JsonResponse({"error": "Invalid request body"}, status=400)



class SelectPackageView(APIView):
    """
    POST -> User selects a fare package from pre-generated fare variants
    """

    def fetch_offer(self, offer_id):
        headers = {
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
            "Accept": "application/json",
            "Duffel-Version": "v2",
        }
        res = requests.get(f"{DUFFEL_BASE}/air/offers/{offer_id}", headers=headers, timeout=10)
        res.raise_for_status()
        return res.json().get("data")

    def post(self, request):
        offer_id = request.data.get("offer_id")
        fare_name = request.data.get("fare_name")

        if not offer_id or not fare_name:
            return JsonResponse({"error": "offer_id and fare_name are required"},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            # Fetch base offer from Duffel
            base_offer = self.fetch_offer(offer_id)
            if not base_offer:
                return JsonResponse({"error": "Offer not found"}, status=status.HTTP_404_NOT_FOUND)

            # Generate your fare packages like in FlightOfferView
            fare_packages = self.generate_fare_packages(base_offer)

            # Find the selected package
            selected_fare = next((f for f in fare_packages if f["name"] == fare_name), None)
            if not selected_fare:
                return JsonResponse({
                    "error": f"Fare '{fare_name}' not found in this offer",
                    "available_fares": [f["name"] for f in fare_packages]
                }, status=status.HTTP_404_NOT_FOUND)

            # Compose flight summary
            slice0 = base_offer.get("slices", [{}])[0]
            segment = slice0.get("segments", [{}])[0]
            dep_dt = parse_iso(segment.get("departing_at"))
            arr_dt = parse_iso(segment.get("arriving_at"))
            duration_minutes = int((arr_dt - dep_dt).total_seconds() // 60) if dep_dt and arr_dt else None

            flight_summary = {
                "offer_id": offer_id,
                "fare_selected": fare_name,
                "airline": segment.get("operating_carrier", {}).get("name") or "Unknown",
                "flight_number": segment.get("marketing_carrier_flight_number") or segment.get("operating_carrier_flight_number"),
                "departure": segment.get("origin", {}).get("iata_code"),
                "arrival": segment.get("destination", {}).get("iata_code"),
                "departure_time": segment.get("departing_at"),
                "arrival_time": segment.get("arriving_at"),
                "duration": f"{duration_minutes // 60}h {duration_minutes % 60}m" if duration_minutes else "N/A",
                "cabin_class": segment.get("cabin_class") or "Economy",
                "price": selected_fare.get("price"),
                "baggage": selected_fare.get("baggage"),
                "available_seats": selected_fare.get("available_seats"),
            }

            return JsonResponse(flight_summary, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            logger.error(f"Duffel request failed: {str(e)}")
            return JsonResponse({"error": "Duffel request failed", "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)
        except Exception as e:
            logger.error(f"Internal server error: {str(e)}")
            return JsonResponse({"error": "Internal server error", "details": str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def generate_fare_packages(self, base_offer):
        """
        Reproduce your FlightOfferView fare package generation logic
        Returns a list of packages with name, price, baggage, and seats
        """
        base_price = float(base_offer.get("total_amount", 0))
        currency = base_offer.get("total_currency", "GBP")
        slices = base_offer.get("slices", [])
        cabin_class = "Economy"
        baggage_default = {"cabin": "As per Airlines Policy", "checked": "As per Airlines Policy"}

        if slices:
            segments = slices[0].get("segments", [])
            if segments:
                segment_passengers = segments[0].get("passengers", [])
                if segment_passengers:
                    first_passenger = segment_passengers[0]
                    cabin_class = (first_passenger.get("cabin_class_marketing_name") or
                                   first_passenger.get("cabin_class", "economy")).title()
                    baggages = first_passenger.get("baggages", [])
                    for b in baggages:
                        b_type = b.get("type", "")
                        qty = b.get("quantity", 0)
                        if b_type in ["carry_on", "cabin"] and qty > 0:
                            baggage_default["cabin"] = f"{qty} KG /Adult"
                        elif b_type == "checked" and qty > 0:
                            baggage_default["checked"] = f"{qty} KG /Adult"

        # Define fare variants
        if cabin_class.lower() == "economy":
            variants = [
                {"name": "Economy Saver", "multiplier": 1.0, "cabin_bonus": 0, "checked_bonus": 0},
                {"name": "Economy Value", "multiplier": 1.29, "cabin_bonus": 0, "checked_bonus": 5},
                {"name": "Economy Flex", "multiplier": 1.59, "cabin_bonus": 3, "checked_bonus": 10},
            ]
        else:
            variants = [{"name": f"{cabin_class} Standard", "multiplier": 1.0, "cabin_bonus": 0, "checked_bonus": 0}]

        fares = []
        for v in variants:
            price = base_price * v["multiplier"]
            baggage = baggage_default.copy()
            for k, bonus in [("cabin", v["cabin_bonus"]), ("checked", v["checked_bonus"])]:
                if "KG" in baggage[k] and bonus:
                    try:
                        w = int(baggage[k].split(" ")[0])
                        baggage[k] = f"{w + bonus} KG /Adult"
                    except:
                        pass
            fares.append({
                "name": v["name"],
                "price": f"{currency} {price:.2f}",
                "baggage": baggage,
                "available_seats": "Limited",
            })
        return fares


















# flights/views/payments.py
import uuid
import json
import requests
from decimal import Decimal
from datetime import datetime, date

from django.conf import settings
from django.shortcuts import redirect
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import FlightPaymentTransaction, Order, Passenger, OrderPassenger, Payment
  # your Duffel wrapper used in OrderCreationView

# Helper to return ssl url
def ssl_url(sandbox=True):
    return "https://sandbox.sslcommerz.com/gwprocess/v4/api.php" if sandbox else "https://securepay.sslcommerz.com/gwprocess/v4/api.php"

# Helper for Duffel headers (same as you used)
def duffel_headers():
    return {
        "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Duffel-Version": "v2"
    }
class InitiateFlightPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("🔵 [START] InitiateFlightPaymentView")
        data = request.data
        print("📩 Incoming data:", dict(data))

        # Required at initiation
        required = ["total_amount", "currency", "offer_id", "passenger_ids"]
        missing = [f for f in required if not data.get(f)]
        if missing:
            print("❌ Missing fields at initiation:", missing)
            return Response({"success": False, "error": f"Missing fields: {', '.join(missing)}"}, status=400)

        # Parse total_amount
        try:
            total_amount = Decimal(str(data["total_amount"]))
        except Exception as e:
            return Response({"success": False, "error": f"Invalid total_amount: {str(e)}"}, status=400)

        # Transaction ID
        tran_id = f"TXN_{uuid.uuid4().hex[:10].upper()}"
        print(f"🆔 Transaction ID: {tran_id}")

        passenger_ids = data.get("passenger_ids", [])
        passengers_detail = data.get("passengers", [])

        # Persist checkout_data for success callback
        checkout_payload = {
            "offer_id": data.get("offer_id"),
            "passenger_ids": passenger_ids,
            "passengers_detail": passengers_detail,   # <-- renamed for consistency
            "total_amount": str(total_amount),
            "currency": data.get("currency"),
            "cus_name": data.get("cus_name"),
            "email": data.get("email"),
            "cus_phone": data.get("cus_phone"),
            "cus_add1": data.get("cus_add1"),
            "cus_city": data.get("cus_city"),
            "cus_state": data.get("cus_state"),
            "cus_postcode": data.get("cus_postcode"),
            "cus_country": data.get("cus_country"),
        }

        # SSLCommerz payload
        payload = {
            "store_id": settings.SSL_STORE_ID,
            "store_passwd": settings.SSL_STORE_PASS,
            "total_amount": f"{total_amount:.2f}",
            "currency": data.get("currency", "BDT"),
            "tran_id": tran_id,
            "success_url": request.build_absolute_uri("/api/flights/payments/success/"),
            "fail_url": request.build_absolute_uri("/api/flights/payments/fail/"),
            "cancel_url": request.build_absolute_uri("/api/flights/payments/cancel/"),
            "ipn_url": request.build_absolute_uri("/api/flights/payments/ipn/"),
            "cus_name": data.get("cus_name", "Guest"),
            "cus_email": data.get("email", ""),
            "cus_phone": data.get("cus_phone", ""),
            "cus_add1": data.get("cus_add1", ""),
            "cus_city": data.get("cus_city", ""),
            "cus_state": data.get("cus_state", ""),
            "cus_postcode": data.get("cus_postcode", ""),
            "cus_country": data.get("cus_country", ""),
            "product_name": "Flight Booking",
            "product_category": "Travel",
            "product_profile": "service",
            "shipping_method": "NO"
        }

        try:
            r = requests.post(ssl_url(getattr(settings, "SSL_SANDBOX", True)), data=payload, timeout=20)
            r_data = r.json()
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=502)

        if r_data.get("status") != "SUCCESS":
            return Response({"success": False, "error": r_data.get("failedreason", "SSL init failed")}, status=400)

        # Save transaction
        tx = FlightPaymentTransaction.objects.create(
            tran_id=tran_id,
            amount=total_amount,
            currency=data.get("currency"),
            status="initiated",
            checkout_data=checkout_payload,
            initiation_response=r_data
        )
        print("💾 Saved FlightPaymentTransaction:", tx.id)

        return Response({
            "success": True,
            "tran_id": tran_id,
            "offer_id": data.get("offer_id"),
            "passenger_ids": passenger_ids,
            "payment_url": r_data.get("GatewayPageURL"),
            "passengers_detail": passengers_detail
        })



# flights/views/payment_success.py
from django.conf import settings
from django.shortcuts import redirect
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
import json

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.shortcuts import redirect
from django.utils import timezone
from django.conf import settings
import json

from .models import FlightPaymentTransaction

class FlightPaymentSuccessView(APIView):
    permission_classes = [AllowAny]

    def handle_success_payment(self, data):
        print("🔵 [START] handle_success_payment")
        print("📩 Callback data:", dict(data))

        tran_id = data.get("tran_id")
        if isinstance(tran_id, list):
            tran_id = tran_id[0] if tran_id else None

        frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        if not tran_id:
            return redirect(f"{frontend_url}/payment/fail?error=no_tran")

        # Fetch transaction
        try:
            tx = FlightPaymentTransaction.objects.get(tran_id=tran_id)
        except FlightPaymentTransaction.DoesNotExist:
            return redirect(f"{frontend_url}/payment/fail?error=not_found")

        # Update transaction with SSL redirect data
        tx.redirect_data = dict(data)
        tx.redirect_received_at = timezone.now()
        tx.status = "ssl_success"  # Mark SSL payment as successful
        tx.val_id = data.get("val_id") or tx.val_id
        tx.save()

        checkout = tx.checkout_data or {}
        original_offer_id = checkout.get("offer_id")
        passenger_ids = checkout.get("passenger_ids", [])
        passengers_detail = checkout.get("passengers_detail", [])

        if not original_offer_id:
            return redirect(f"{frontend_url}/payment/fail?tran_id={tran_id}&error=missing_offer")

        duffel_manager = DuffelOrderManager()
        
        # Try to use original offer
        current_offer_id = original_offer_id
        offer_data = None
        
        try:
            print(f"🔄 Fetching original offer: {original_offer_id}")
            offer_resp = duffel_manager.get_offer_details(original_offer_id)
            offer_data = offer_resp.get("data", {})
            print("✅ Original offer is still valid")
        except Exception as e:
            print(f"❌ Original offer failed: {str(e)}")
            # Offer is expired - handle this specific case
            print("💰 Payment was successful but offer expired")
            
            # Update transaction to reflect this specific error
            tx.status = "payment_success_offer_expired"
            tx.save()
            
            # Redirect to special offer-expired page
            return redirect(
                f"{frontend_url}/payment/offer-expired?"
                f"tran_id={tran_id}&"
                f"payment_status=success&"
                f"offer_status=expired&"
                f"amount={data.get('amount', [''])[0]}&"
                f"currency={data.get('currency', [''])[0]}"
            )

        if not offer_data:
            return redirect(f"{frontend_url}/payment/fail?tran_id={tran_id}&error=invalid_offer_data")

        # Get the exact amount from the offer
        offer_total_amount = offer_data.get("total_amount")
        offer_total_currency = offer_data.get("total_currency")
        
        if not offer_total_amount:
            print("❌ No total_amount in offer data")
            return redirect(f"{frontend_url}/payment/fail?tran_id={tran_id}&error=invalid_offer_amount")

        print(f"💰 Using offer amount: {offer_total_amount} {offer_total_currency}")

        # Build validated passengers payload
        passengers_payload = []
        for idx, p in enumerate(passengers_detail):
            passenger_id = passenger_ids[idx] if idx < len(passenger_ids) else f"pas_{uuid.uuid4().hex[:10]}"
            
            # Validate passenger data
            required_fields = ['given_name', 'family_name', 'born_on', 'email']
            for field in required_fields:
                if not p.get(field):
                    return redirect(f"{frontend_url}/payment/fail?tran_id={tran_id}&error=missing_passenger_data")

            cleaned_docs = self.clean_identity_documents(p.get("identity_documents", []))
            cleaned_phone = self.clean_phone_number(p.get("phone_number"))

            passengers_payload.append({
                "id": passenger_id,
                "title": p.get("title", "mr").lower(),
                "given_name": p.get("given_name"),
                "family_name": p.get("family_name"),
                "born_on": p.get("born_on"),
                "gender": (p.get("gender") or "").lower()[:1],
                "email": p.get("email"),
                "phone_number": cleaned_phone,
                "identity_documents": cleaned_docs
            })

        # Build order with current offer
        order_body = {
            "data": {
                "type": "instant",
                "selected_offers": [current_offer_id],
                "passengers": passengers_payload,
                "payments": [{
                    "type": "balance",
                    "amount": str(offer_total_amount),
                    "currency": offer_total_currency
                }]
            }
        }

        print("🧾 Sending Duffel order payload:")
        print(json.dumps(order_body, indent=2))

        # Create Duffel order
        try:
            duffel_resp = duffel_manager._make_request("POST", "/air/orders", order_body)
            duffel_data = duffel_resp.get("data") or {}
            print("✅ Duffel order created:", duffel_data.get("id"))
            
            # Save local order
            try:
                order_creator = OrderCreationView()
                saved_order = order_creator._save_order_to_database(
                    duffel_data, passengers_detail or [], checkout.get("metadata", {})
                )
                print("💾 Local order saved:", saved_order.id)
            except Exception as e:
                print("⚠️ Local order save failed:", e)
                # Still proceed since Duffel order was created successfully

            # Link transaction → order and mark as complete success
            tx.order_id = duffel_data.get("id")
            tx.duffel_offer_id = current_offer_id
            tx.status = "complete_success"
            tx.save()

            return redirect(f"{frontend_url}/payment/success?tran_id={tran_id}&order_id={tx.order_id}&paid=true&booking_type=flight")

        except Exception as e:
            print("❌ Duffel order creation failed:", str(e))
            # Mark transaction as payment success but order failed
            tx.status = "payment_success_order_failed"
            tx.save()
            
            error_msg = str(e).lower()
            if "expired" in error_msg or "no longer available" in error_msg:
                return redirect(
                    f"{frontend_url}/payment/offer-expired?"
                    f"tran_id={tran_id}&"
                    f"payment_status=success&"
                    f"offer_status=expired&"
                    f"amount={data.get('amount', [''])[0]}&"
                    f"currency={data.get('currency', [''])[0]}"
                )
            else:
                return redirect(f"{frontend_url}/payment/fail?tran_id={tran_id}&error=order_creation_failed")

    def clean_identity_documents(self, docs):
        """Ensure Duffel identity_documents meet validation rules."""
        cleaned = []
        for doc in docs:
            new_doc = dict(doc)
            uid = str(new_doc.get("unique_identifier", "")).strip()
            if len(uid) > 15:
                print(f"⚠️ Trimming long unique_identifier '{uid}' → '{uid[:15]}'")
                new_doc["unique_identifier"] = uid[:15]
            cleaned.append(new_doc)
        return cleaned

    def clean_phone_number(self, phone):
        """Duffel requires E.164 format (+countrycode...)."""
        if not phone:
            return None
        phone = str(phone).strip()
        if not phone.startswith("+"):
            print(f"⚠️ Invalid phone '{phone}', auto-correcting...")
            digits = "".join([c for c in phone if c.isdigit()])
            phone = f"+{digits}"
        return phone[:20]

    def post(self, request):
        print("🟢 POST: Payment success callback received")
        return self.handle_success_payment(request.data)

    def get(self, request):
        print("🟢 GET: Payment success redirect received")
        return self.handle_success_payment(request.GET)



class DuffelOrderManager:
    """Centralized manager for Duffel order operations"""
    
    def __init__(self):
        self.base_url = "https://api.duffel.com"
        self.headers = {
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Duffel-Version": "v2",
            "User-Agent": "FlightBooking/1.0"
        }
        self.timeout = 130  # Important for order creation as per Duffel docs
    def get_offer_details(self, offer_id: str) -> Dict:
        """
        Fetch offer details from Duffel API.
        """
        try:
            endpoint = f"/air/offers/{offer_id}"
            result = self._make_request("GET", endpoint)
            print(f"[DEBUG] Fetched offer details: {result}")
            return result
        except Exception as e:
            print(f"[ERROR] Failed to get offer details: {str(e)}")
            return {}
    def _make_request(self, method: str, endpoint: str, data: Dict = None) -> Dict:
        """Make authenticated request to Duffel API"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=self.headers, timeout=self.timeout)
            else:  # POST, PUT, etc.
                response = requests.request(
                    method=method,
                    url=url,
                    headers=self.headers,
                    json=data,  # pass data directly, no {"data": data}
                    timeout=self.timeout
                )

            logger.info(f"Duffel API {method} {endpoint}: {response.status_code}")

            if response.status_code in [200, 201]:
                return response.json()  # Duffel returns the object directly, no need for .get("data")
            else:
                logger.error(f"API error {response.status_code}: {response.text}")
                response.raise_for_status()

        except requests.exceptions.Timeout:
            logger.error(f"Request timeout for {endpoint}")
            raise Exception("Request timeout - airline systems may be slow")
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed for {endpoint}: {str(e)}")
            raise

    
    def validate_passenger_data(self, passenger: Dict) -> List[str]:
        """Validate passenger data according to Duffel requirements"""
        errors = []
        
        required_fields = ['given_name', 'family_name', 'born_on', 'email']
        for field in required_fields:
            if not passenger.get(field):
                errors.append(f"Missing required passenger field: {field}")
        
        # Email validation
        if passenger.get('email') and '@' not in passenger['email']:
            errors.append("Invalid email format")
        
        # Date validation
        if passenger.get('born_on'):
            try:
                datetime.strptime(passenger['born_on'], '%Y-%m-%d')
            except ValueError:
                errors.append("Invalid date format for born_on (use YYYY-MM-DD)")
        
        # Phone validation (if provided)
        if passenger.get('phone_number') and not passenger['phone_number'].startswith('+'):
            errors.append("Phone number should include country code (e.g., +44)")
        
        return errors
    
    def validate_payment_data(self, payment: Dict) -> List[str]:
        """Validate payment data"""
        errors = []
        
        if payment.get('type') not in ['balance', 'arc_bsp_cash', 'card']:
            errors.append("Invalid payment type")
        
        if not payment.get('currency'):
            errors.append("Payment currency is required")
        
        if not payment.get('amount'):
            errors.append("Payment amount is required")
        
        return errors




class OrderCreationView(APIView):
    """Creates order in Duffel and saves to local database with validation"""

    def __init__(self):
        super().__init__()
        self.order_manager = DuffelOrderManager()
        print("🔹 OrderCreationView initialized")

    def post(self, request): 
        try:
            payload = request.data.get("data")
            print("📩 Received payload:", payload)

            if not payload:
                print("⚠️ Payload missing 'data'")
                return Response(
                    {"status": "error", "message": "Missing 'data'", "error_code": "MISSING_FIELD"},
                    status=400
                )

            # Validate all data before processing
            validation_result = self._validate_order_data(payload)
            print("🔍 Validation result:", validation_result)
            if not validation_result["is_valid"]:
                return Response(
                    {
                        "status": "error", 
                        "message": "Validation failed", 
                        "errors": validation_result["errors"],
                        "error_code": "VALIDATION_ERROR"
                    },
                    status=400
                )

            selected_offers = payload.get("selected_offers")
            passengers = payload.get("passengers", [])
            metadata = payload.get("metadata", {})
            order_type = payload.get("type", "instant")

            print(f"✈️ Selected offers: {selected_offers}, passengers: {len(passengers)}, order_type: {order_type}")

            if not selected_offers or not passengers:
                print("⚠️ Missing selected_offers or passengers")
                return Response(
                    {"status": "error", "message": "Missing selected_offers or passengers", "error_code": "MISSING_FIELD"},
                    status=400
                )

            offer_id = selected_offers[0]
            print(f"🆔 Fetching offer details for offer_id: {offer_id}")

            # Fetch offer details from Duffel
            offer_details = self.order_manager._make_request("GET", f"/air/offers/{offer_id}")
            print("📦 Offer details fetched:", offer_details)
            offer_data = offer_details.get("data", {})
            slice_passengers = offer_data.get("slices", [])[0].get("segments", [])[0].get("passengers", [])
            print(f"👥 Slice passengers from Duffel: {slice_passengers}")

            # Build passenger payload for Duffel API
            passenger_payloads = []
            for idx, p in enumerate(passengers):
                p_data = {
                    "title": p["title"],
                    "given_name": p["given_name"].strip(),
                    "family_name": p["family_name"].strip(),
                    "born_on": p["born_on"],
                    "gender": p["gender"],
                    "email": p.get("email", "").strip(),
                    "phone_number": p.get("phone_number", "").strip(),
                    "identity_documents": self._prepare_identity_documents(p.get("identity_documents", []))
                }
                if idx < len(slice_passengers):
                    p_data["id"] = slice_passengers[idx]["passenger_id"]
                passenger_payloads.append(p_data)
                print(f"👤 Prepared passenger payload {idx}:", p_data)

            # Build order data for Duffel API
            order_data = {
                "selected_offers": selected_offers,
                "passengers": passenger_payloads,
                "type": order_type
            }
            if metadata:
                order_data["metadata"] = metadata
            if order_type == "instant":
                order_data["payments"] = [{
                    "type": "balance",
                    "amount": offer_data.get("total_amount"),
                    "currency": offer_data.get("total_currency")
                }]

            print("🛠️ Final order data to send to Duffel:", order_data)

            # Create order in Duffel
            duffel_result = self.order_manager._make_request("POST", "/air/orders", {"data": order_data})
            duffel_order_data = duffel_result.get("data", {})
            print("✅ Duffel order created successfully:", duffel_order_data.get("id"))

            # Save to local database
            saved_order = self._save_order_to_database(duffel_order_data, passengers, metadata)
            print("💾 Order saved to local DB:", saved_order.id)

            return Response({
                "status": "success",
                "message": "Order created successfully",
                "duffel_order": duffel_result,
                "local_order": {
                    "id": saved_order.id,
                    "type": saved_order.type,
                    "total_amount": str(saved_order.total_amount),
                    "total_currency": saved_order.total_currency,
                    "booking_reference": saved_order.booking_reference,
                    "created_at": saved_order.created_at.isoformat(),
                    "passenger_count": saved_order.passengers.count()
                }
            }, status=200)

        except Exception as e:
            logger.error(f"Order creation failed: {str(e)}", exc_info=True)
            print("❌ Order creation failed:", str(e))
            return Response(
                {"status": "error", "message": "Internal server error", "error": str(e)}, 
                status=500
            )

    # Add prints inside _validate_order_data, _validate_passenger, _validate_identity_document, _prepare_identity_documents, and _save_order_to_database as needed




class OrderRetrievalView(APIView):
    """Retrieve and manage existing orders"""
    
    def __init__(self):
        super().__init__()
        self.order_manager = DuffelOrderManager()
    
    def get(self, request, order_id=None):
        """Get order details by ID"""
        if not order_id:
            return Response({
                "status": "error",
                "message": "Order ID is required"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            order_data = self.order_manager._make_request(
                "GET", 
                f"/air/orders/{order_id}"
            )
            
            return Response({
                "status": "success",
                "data": order_data
            }, status=status.HTTP_200_OK)
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                return Response({
                    "status": "error",
                    "message": "Order not found"
                }, status=status.HTTP_404_NOT_FOUND)
            raise



class OrderServicesView(APIView):
    """Manage services for existing orders"""
    
    def __init__(self):
        super().__init__()
        self.order_manager = DuffelOrderManager()
    
    def get(self, request, order_id):
        """Get available services for an order"""
        try:
            services = self.order_manager._make_request(
                "GET", 
                f"/air/orders/{order_id}/available_services"
            )
            
            return Response({
                "status": "success",
                "data": services
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching services: {str(e)}")
            return Response({
                "status": "error",
                "message": "Failed to fetch available services"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request, order_id):
        """Add services to an existing order"""
        try:
            service_data = {
                "add_services": request.data.get('services', []),
                "payment": request.data.get('payment', {})
            }
            
            result = self.order_manager._make_request(
                "POST",
                f"/air/orders/{order_id}/services",
                service_data
            )
            
            return Response({
                "status": "success",
                "message": "Services added successfully",
                "data": result
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error adding services: {str(e)}")
            return Response({
                "status": "error",
                "message": "Failed to add services to order"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class OrderListCreateView(APIView):
    """Comprehensive view for listing and creating orders"""
    
    def __init__(self):
        super().__init__()
        self.order_manager = DuffelOrderManager()
        self.creation_view = OrderCreationView()
    
    def get(self, request):
        """List orders with filtering and pagination"""
        try:
            params = request.query_params.dict()
            
            # Build query parameters for Duffel API
            duffel_params = {}
            valid_params = [
                'after', 'before', 'limit', 'booking_reference', 'offer_id',
                'awaiting_payment', 'sort', 'owner_id', 'origin_id', 'destination_id',
                'passenger_name', 'requires_action', 'user_id'
            ]
            
            for param in valid_params:
                if param in params:
                    duffel_params[param] = params[param]
            
            # Convert list parameters
            for param in ['owner_id', 'origin_id', 'destination_id', 'passenger_name']:
                if param in duffel_params and isinstance(duffel_params[param], str):
                    duffel_params[f"{param}[]"] = duffel_params.pop(param).split(',')
            
            orders = self.order_manager._make_request(
                "GET", 
                "/air/orders",
                duffel_params
            )
            
            return Response({
                "status": "success",
                "data": orders
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error listing orders: {str(e)}")
            return Response({
                "status": "error",
                "message": "Failed to retrieve orders"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Create a new order (delegate to OrderCreationView)"""
        return self.creation_view.post(request)



# views.py - Enhanced payment views
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json

class CreatePaymentIntentView(APIView):
    """
    Create payment intent for instant orders
    """
    
    def post(self, request):
        serializer = PaymentIntentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            data = serializer.validated_data
            offer_amount = data['offer_amount']
            markup = data.get('markup', Decimal('0.00'))
            target_currency = data.get('customer_currency', data['offer_currency'])
            
            # Calculate final amount (you can add your markup logic here)
            final_amount = offer_amount + markup
            
            # Create payment intent
            payment_intent = duffel_service.create_payment_intent(
                final_amount, 
                target_currency,
                metadata={
                    'offer_amount': str(offer_amount),
                    'markup': str(markup),
                    'order_type': 'instant'
                }
            )
            
            # Save to database for tracking
            from .models import PaymentIntent, Order
            try:
                order = Order.objects.get(id=data.get('order_id'))
                PaymentIntent.objects.create(
                    id=payment_intent['data']['id'],
                    order=order,
                    amount=final_amount,
                    currency=target_currency,
                    client_secret=payment_intent['data']['client_secret'],
                    metadata=payment_intent['data']['metadata']
                )
            except Exception as e:
                logger.warning(f"Failed to save payment intent to database: {str(e)}")
            
            return Response({
                'payment_intent': payment_intent['data'],
                'client_token': payment_intent['data']['client_secret'],
            }, status=status.HTP_200_OK)
            
        except Exception as e:
            logger.error(f"Payment intent creation failed: {str(e)}")
            return Response(
                {'error': 'Failed to create payment intent', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ConfirmPaymentIntentView(APIView):
    """
    Confirm payment intent and create actual payment
    """
    
    def post(self, request):
        serializer = PaymentIntentConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            payment_intent_id = serializer.validated_data['payment_intent_id']
            payment_method = request.data.get('payment_method', {})
            
            # Confirm payment intent (this creates the actual Duffel payment)
            confirmed_intent = duffel_service.confirm_payment_intent(
                payment_intent_id, 
                payment_method
            )
            
            # Update payment intent status in database
            from .models import PaymentIntent
            try:
                intent = PaymentIntent.objects.get(id=payment_intent_id)
                intent.status = 'succeeded'
                intent.save()
            except PaymentIntent.DoesNotExist:
                pass
            
            return Response({
                'payment_intent': confirmed_intent['data'],
                'status': 'succeeded'
            })
            
        except Exception as e:
            logger.error(f"Payment confirmation failed: {str(e)}")
            
            # Update payment intent status to failed
            from .models import PaymentIntent
            try:
                intent = PaymentIntent.objects.get(id=serializer.validated_data['payment_intent_id'])
                intent.status = 'failed'
                intent.save()
            except:
                pass
            
            return Response(
                {'error': 'Payment confirmation failed', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PayHoldOrderView(APIView):
    """Pay for a hold order - MAIN PAYMENT ENDPOINT"""
    
    def post(self, request):
        serializer = HoldOrderPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            data = serializer.validated_data
            order_id = data['order_id']
            
            # Validate payment requirements
            is_valid, error_message = duffel_service.validate_payment_requirements(order_id)
            if not is_valid:
                return Response(
                    {'error': 'Payment validation failed', 'details': error_message},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create payment for hold order
            payment = duffel_service.create_hold_order_payment(
                order_id=data['order_id'],
                amount=data['amount'],
                currency=data['currency'],
                payment_type=data.get('payment_type', 'balance')
            )
            
            # Update order status in local database
            from .models import Order, Payment
            try:
                order = Order.objects.get(id=order_id)
                order.status = 'confirmed'
                order.save()
                
                # Save payment details
                Payment.objects.create(
                    id=payment['data']['id'],
                    order=order,
                    type=payment['data']['type'],
                    amount=payment['data']['amount'],
                    currency=payment['data']['currency'],
                    status='completed'
                )
            except Exception as e:
                logger.warning(f"Failed to update local database: {str(e)}")
            
            return Response({
                'payment': payment['data'],
                'status': 'succeeded',
                'message': 'Payment completed successfully'
            })
            
        except Exception as e:
            logger.error(f"Hold order payment failed: {str(e)}")
            return Response(
                {'error': 'Payment failed', 'details': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PaymentSuccessView(APIView):
    """
    Handle successful payment and display confirmation
    """
    
    def get(self, request, order_id=None):
        try:
            if not order_id:
                order_id = request.GET.get('order_id')
            
            if not order_id:
                return Response(
                    {'error': 'Order ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get order details from Duffel
            order_data = duffel_service.get_order(order_id)
            order = order_data.get('data', {})
            
            # Get payment details
            payments = order.get('payments', [])
            latest_payment = payments[-1] if payments else {}
            
            # Prepare confirmation data
            confirmation_data = {
                'order': {
                    'id': order.get('id'),
                    'booking_reference': order.get('booking_reference'),
                    'status': order.get('type'),
                    'total_amount': order.get('total_amount'),
                    'total_currency': order.get('total_currency'),
                    'created_at': order.get('created_at'),
                },
                'payment': {
                    'id': latest_payment.get('id'),
                    'type': latest_payment.get('type'),
                    'amount': latest_payment.get('amount'),
                    'currency': latest_payment.get('currency'),
                    'status': 'completed',
                },
                'passengers': [],
                'flights': []
            }
            
            # Add passenger details
            for passenger in order.get('passengers', []):
                confirmation_data['passengers'].append({
                    'given_name': passenger.get('given_name'),
                    'family_name': passenger.get('family_name'),
                    'title': passenger.get('title'),
                    'born_on': passenger.get('born_on'),
                    'email': passenger.get('email'),
                })
            
            # Add flight details
            for slice_obj in order.get('slices', []):
                for segment in slice_obj.get('segments', []):
                    confirmation_data['flights'].append({
                        'airline': segment.get('operating_carrier', {}).get('name'),
                        'flight_number': segment.get('marketing_carrier_flight_number'),
                        'departure': {
                            'airport': segment.get('origin', {}).get('name'),
                            'iata_code': segment.get('origin', {}).get('iata_code'),
                            'time': segment.get('departing_at'),
                        },
                        'arrival': {
                            'airport': segment.get('destination', {}).get('name'),
                            'iata_code': segment.get('destination', {}).get('iata_code'),
                            'time': segment.get('arriving_at'),
                        }
                    })
            
            return Response(confirmation_data)
            
        except Exception as e:
            logger.error(f"Payment success view error: {str(e)}")
            return Response(
                {'error': 'Failed to load order confirmation'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@method_decorator(csrf_exempt, name='dispatch')
class DuffelWebhookView(APIView):
    """
    Handle Duffel webhooks for payment events
    """
    
    def post(self, request):
        try:
            # Verify webhook signature (implement based on Duffel's webhook security)
            signature = request.headers.get('Duffel-Signature')
            if not self._verify_webhook_signature(request.body, signature):
                return Response({'error': 'Invalid signature'}, status=status.HTTP_401_UNAUTHORIZED)
            
            payload = json.loads(request.body)
            event_type = payload.get('type')
            data = payload.get('data', {})
            
            # Store webhook event
            from .models import PaymentWebhook
            PaymentWebhook.objects.create(
                event_id=payload.get('id'),
                event_type=event_type,
                resource_type=data.get('type'),
                resource_id=data.get('id'),
                data=payload
            )
            
            # Process different event types
            if event_type == 'payment.succeeded':
                self._handle_payment_succeeded(data)
            elif event_type == 'payment.failed':
                self._handle_payment_failed(data)
            elif event_type == 'order.airline_updated':
                self._handle_order_updated(data)
            
            return Response({'status': 'processed'})
            
        except Exception as e:
            logger.error(f"Webhook processing error: {str(e)}")
            return Response(
                {'error': 'Webhook processing failed'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        """Verify webhook signature - implement based on Duffel's documentation"""
        # TODO: Implement webhook signature verification
        return True  # Remove this in production
    
    def _handle_payment_succeeded(self, data: Dict):
        """Handle successful payment webhook"""
        payment_id = data.get('id')
        order_id = data.get('order_id')
        
        logger.info(f"Payment {payment_id} succeeded for order {order_id}")
        
        # Update local database
        try:
            from .models import Payment, Order
            payment, created = Payment.objects.update_or_create(
                id=payment_id,
                defaults={
                    'status': 'completed',
                    'duffel_data': data
                }
            )
            
            if order_id:
                Order.objects.filter(id=order_id).update(status='confirmed')
        except Exception as e:
            logger.error(f"Failed to update local database for payment {payment_id}: {str(e)}")
    
    def _handle_payment_failed(self, data: Dict):
        """Handle failed payment webhook"""
        payment_id = data.get('id')
        logger.warning(f"Payment {payment_id} failed")
        
        try:
            from .models import Payment
            Payment.objects.filter(id=payment_id).update(status='failed')
        except Exception as e:
            logger.error(f"Failed to update payment status: {str(e)}")
    
    def _handle_order_updated(self, data: Dict):
        """Handle order update webhook"""
        order_id = data.get('id')
        logger.info(f"Order {order_id} updated")
        
        # Sync order changes to local database
        try:
            from .models import Order
            order_data = duffel_service.get_order(order_id)
            Order.objects.filter(id=order_id).update(
                duffel_data=order_data.get('data', {})
            )
        except Exception as e:
            logger.error(f"Failed to sync order {order_id}: {str(e)}")


# views.py - Add these new views

class MyFlightsView(APIView):
    """Get user's flight orders with detailed information"""
    
    def get(self, request):
        try:
            # Get user from authentication
            user = request.user
            if not user.is_authenticated:
                return Response(
                    {"status": "error", "message": "Authentication required"},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Get orders from local database
            orders = Order.objects.filter(
                passengers__email=user.email
            ).distinct().prefetch_related('passengers', 'payments')
            
            orders_data = []
            for order in orders:
                order_data = self._format_order_data(order)
                orders_data.append(order_data)
            
            return Response({
                "status": "success",
                "data": orders_data,
                "total": len(orders_data)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching user flights: {str(e)}")
            return Response(
                {"status": "error", "message": "Failed to fetch flights"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _format_order_data(self, order):
        """Format order data for frontend display"""
        duffel_data = order.duffel_data or {}
        slices = duffel_data.get('slices', [])
        
        # Extract flight information
        flight_info = self._extract_flight_info(slices)
        
        # Get passenger count
        passenger_count = order.passengers.count()
        
        # Get payment status
        payment_status = "pending"
        payments = order.payments.all()
        if payments.exists():
            payment_status = payments.first().status
        
        return {
            "id": order.id,
            "booking_reference": order.booking_reference,
            "type": order.type,
            "status": duffel_data.get('status', 'confirmed'),
            "total_amount": str(order.total_amount),
            "total_currency": order.total_currency,
            "created_at": order.created_at.isoformat(),
            "passenger_count": passenger_count,
            "payment_status": payment_status,
            "flight_info": flight_info,
            "duffel_order_id": duffel_data.get('id'),
            "metadata": order.metadata or {}
        }
    
    def _extract_flight_info(self, slices):
        """Extract flight information from slices"""
        if not slices:
            return {}
        
        first_slice = slices[0]
        segments = first_slice.get('segments', [])
        if not segments:
            return {}
        
        first_segment = segments[0]
        last_segment = segments[-1]
        
        operating_carrier = first_segment.get('operating_carrier', {})
        marketing_carrier = first_segment.get('marketing_carrier', {})
        
        return {
            "airline": operating_carrier.get('name') or marketing_carrier.get('name'),
            "flight_number": f"{marketing_carrier.get('iata_code', '')}{first_segment.get('marketing_carrier_flight_number', '')}",
            "departure": {
                "airport": first_segment.get('origin', {}).get('iata_code'),
                "airport_name": first_segment.get('origin', {}).get('name'),
                "time": first_segment.get('departing_at'),
                "terminal": first_segment.get('origin_terminal')
            },
            "arrival": {
                "airport": last_segment.get('destination', {}).get('iata_code'),
                "airport_name": last_segment.get('destination', {}).get('name'),
                "time": last_segment.get('arriving_at'),
                "terminal": last_segment.get('destination_terminal')
            },
            "duration": first_slice.get('duration'),
            "cabin_class": segments[0].get('passengers', [{}])[0].get('cabin_class', 'economy')
        }


class DuffelPaymentView(APIView):
    """Handle Duffel payments for instant and hold orders"""
    
    def __init__(self):
        super().__init__()
        self.order_manager = DuffelOrderManager()
    
    def post(self, request):
        """Create payment for a hold order"""
        try:
            order_id = request.data.get('order_id')
            payment_type = request.data.get('type', 'balance')  # balance, card, arc_bsp_cash
            three_d_secure_session_id = request.data.get('three_d_secure_session_id')
            
            if not order_id:
                return Response(
                    {"status": "error", "message": "Order ID is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get order details to verify amount
            order_response = self.order_manager._make_request(
                "GET", f"/air/orders/{order_id}"
            )
            order_data = order_response.get('data', {})
            
            if not order_data:
                return Response(
                    {"status": "error", "message": "Order not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Check if order is a hold order
            if order_data.get('type') != 'hold':
                return Response(
                    {"status": "error", "message": "Only hold orders can be paid for"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Prepare payment data
            payment_data = {
                "type": payment_type,
                "currency": order_data.get('total_currency'),
                "amount": order_data.get('total_amount')
            }
            
            if three_d_secure_session_id:
                payment_data["three_d_secure_session_id"] = three_d_secure_session_id
            
            # Create payment in Duffel
            payment_response = self.order_manager._make_request(
                "POST", 
                "/air/payments",
                {
                    "order_id": order_id,
                    "payment": payment_data
                }
            )
            
            payment_result = payment_response.get('data', {})
            
            # Update local database
            self._update_local_payment(order_id, payment_result, payment_type)
            
            return Response({
                "status": "success",
                "message": "Payment processed successfully",
                "data": payment_result
            }, status=status.HTTP_200_OK)
            
        except requests.exceptions.HTTPError as e:
            error_data = {}
            try:
                error_data = e.response.json()
            except:
                error_data = {"message": str(e)}
            
            logger.error(f"Payment failed: {error_data}")
            
            return Response({
                "status": "error",
                "message": "Payment failed",
                "error": error_data
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Payment processing error: {str(e)}")
            return Response({
                "status": "error",
                "message": "Payment processing failed"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _update_local_payment(self, order_id, payment_data, payment_type):
        """Update local database with payment information"""
        try:
            order = Order.objects.get(id=order_id)
            Payment.objects.update_or_create(
                order=order,
                defaults={
                    'id': payment_data.get('id'),
                    'type': payment_type,
                    'amount': payment_data.get('amount'),
                    'currency': payment_data.get('currency'),
                    'status': 'completed',
                    'duffel_data': payment_data
                }
            )
            
            # Update order status if needed
            order.duffel_data['status'] = 'confirmed'
            order.save()
            
        except Order.DoesNotExist:
            logger.warning(f"Order {order_id} not found in local database")
        except Exception as e:
            logger.error(f"Failed to update local payment: {str(e)}")


class OrderCancelView(APIView):
    """Cancel an order"""
    
    def __init__(self):
        super().__init__()
        self.order_manager = DuffelOrderManager()
    
    def post(self, request, order_id):
        """Cancel an order in Duffel and update local database"""
        try:
            # Cancel order in Duffel
            cancel_response = self.order_manager._make_request(
                "POST", 
                f"/air/orders/{order_id}/actions/cancel"
            )
            
            cancel_data = cancel_response.get('data', {})
            
            # Update local database
            self._update_local_order_status(order_id, 'cancelled')
            
            return Response({
                "status": "success",
                "message": "Order cancelled successfully",
                "data": cancel_data
            }, status=status.HTTP_200_OK)
            
        except requests.exceptions.HTTPError as e:
            error_data = {}
            try:
                error_data = e.response.json()
            except:
                error_data = {"message": str(e)}
            
            logger.error(f"Order cancellation failed: {error_data}")
            
            return Response({
                "status": "error",
                "message": "Order cancellation failed",
                "error": error_data
            }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Order cancellation error: {str(e)}")
            return Response({
                "status": "error",
                "message": "Order cancellation failed"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _update_local_order_status(self, order_id, status):
        """Update local order status"""
        try:
            order = Order.objects.get(id=order_id)
            if order.duffel_data:
                order.duffel_data['status'] = status
                order.save()
        except Order.DoesNotExist:
            logger.warning(f"Order {order_id} not found in local database")


class FlightOrderDetailsView(APIView):
    """Get detailed information about a specific flight order"""
    
    def __init__(self):
        super().__init__()
        self.order_manager = DuffelOrderManager()
    
    def get(self, request, order_id):
        """Get comprehensive order details"""
        try:
            # Get order from Duffel
            order_response = self.order_manager._make_request(
                "GET", f"/air/orders/{order_id}"
            )
            duffel_order = order_response.get('data', {})
            
            # Get local order data
            try:
                local_order = Order.objects.get(id=order_id)
                passengers_data = self._get_passengers_data(local_order)
                payments_data = self._get_payments_data(local_order)
            except Order.DoesNotExist:
                local_order = None
                passengers_data = []
                payments_data = []
            
            # Format response
            order_details = self._format_order_details(
                duffel_order, local_order, passengers_data, payments_data
            )
            
            return Response({
                "status": "success",
                "data": order_details
            }, status=status.HTTP_200_OK)
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                return Response({
                    "status": "error",
                    "message": "Order not found"
                }, status=status.HTTP_404_NOT_FOUND)
            raise
            
        except Exception as e:
            logger.error(f"Error fetching order details: {str(e)}")
            return Response({
                "status": "error",
                "message": "Failed to fetch order details"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_passengers_data(self, order):
        """Get formatted passengers data"""
        passengers = []
        for order_passenger in OrderPassenger.objects.filter(order=order).select_related('passenger'):
            passenger = order_passenger.passenger
            passengers.append({
                "id": passenger.id,
                "title": passenger.title,
                "given_name": passenger.given_name,
                "family_name": passenger.family_name,
                "type": order_passenger.passenger_type,
                "email": passenger.email,
                "phone_number": passenger.phone_number,
                "born_on": passenger.born_on,
                "gender": passenger.gender,
                "identity_documents": passenger.identity_documents
            })
        return passengers
    
    def _get_payments_data(self, order):
        """Get formatted payments data"""
        payments = []
        for payment in Payment.objects.filter(order=order):
            payments.append({
                "id": payment.id,
                "type": payment.type,
                "amount": str(payment.amount),
                "currency": payment.currency,
                "status": payment.status,
                "created_at": payment.created_at.isoformat() if payment.created_at else None
            })
        return payments
    
    def _format_order_details(self, duffel_order, local_order, passengers, payments):
        """Format comprehensive order details"""
        slices = duffel_order.get('slices', [])
        flight_info = self._extract_detailed_flight_info(slices)
        
        return {
            "order_info": {
                "id": duffel_order.get('id'),
                "type": duffel_order.get('type'),
                "booking_reference": duffel_order.get('booking_reference'),
                "status": duffel_order.get('status'),
                "total_amount": duffel_order.get('total_amount'),
                "total_currency": duffel_order.get('total_currency'),
                "created_at": duffel_order.get('created_at'),
                "expires_at": duffel_order.get('expires_at'),
                "live_mode": duffel_order.get('live_mode')
            },
            "flight_info": flight_info,
            "passengers": passengers,
            "payments": payments,
            "conditions": duffel_order.get('conditions', {}),
            "metadata": local_order.metadata if local_order else {}
        }
    
    def _extract_detailed_flight_info(self, slices):
        """Extract detailed flight information from slices"""
        flight_info = {
            "slices": [],
            "total_duration": 0,
            "total_stops": 0
        }
        
        for slice_idx, slice_data in enumerate(slices):
            segments = slice_data.get('segments', [])
            slice_info = {
                "slice_number": slice_idx + 1,
                "origin": slice_data.get('origin', {}),
                "destination": slice_data.get('destination', {}),
                "duration": slice_data.get('duration'),
                "segments": []
            }
            
            for segment in segments:
                operating_carrier = segment.get('operating_carrier', {})
                marketing_carrier = segment.get('marketing_carrier', {})
                
                segment_info = {
                    "airline": {
                        "name": operating_carrier.get('name'),
                        "iata_code": operating_carrier.get('iata_code'),
                        "logo": operating_carrier.get('logo_lockup_url')
                    },
                    "flight_number": f"{marketing_carrier.get('iata_code', '')}{segment.get('marketing_carrier_flight_number', '')}",
                    "departure": {
                        "airport": segment.get('origin', {}),
                        "time": segment.get('departing_at'),
                        "terminal": segment.get('origin_terminal')
                    },
                    "arrival": {
                        "airport": segment.get('destination', {}),
                        "time": segment.get('arriving_at'),
                        "terminal": segment.get('destination_terminal')
                    },
                    "duration": segment.get('duration'),
                    "aircraft": segment.get('aircraft', {}),
                    "cabin_class": segment.get('passengers', [{}])[0].get('cabin_class', 'economy')
                }
                slice_info["segments"].append(segment_info)
            
            flight_info["slices"].append(slice_info)
        
        return flight_info
    

# views.py - Add these views

class MyFlightsView(APIView):
    """Get user's flight bookings"""
    
    def get(self, request):
        try:
            # Get orders from Duffel API
            duffel_client = DuffelOrderManager()
            orders_response = duffel_client._make_request("GET", "/air/orders", {"limit": 50})
            
            if not orders_response or 'data' not in orders_response:
                return Response({
                    "status": "success",
                    "message": "No flights found",
                    "flights": []
                }, status=200)
            
            flights = []
            for order_data in orders_response['data']:
                flight = self._transform_order_to_flight(order_data)
                if flight:
                    flights.append(flight)
            
            # Sort by creation date, newest first
            flights.sort(key=lambda x: x['created_at'], reverse=True)
            
            return Response({
                "status": "success",
                "message": f"Found {len(flights)} flights",
                "flights": flights
            }, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching user flights: {str(e)}")
            return Response({
                "status": "error",
                "message": "Failed to fetch flights",
                "error": str(e)
            }, status=500)
    
    def _transform_order_to_flight(self, order_data: Dict) -> Optional[Dict]:
        """Transform Duffel order data to flight booking format"""
        try:
            slices = order_data.get('slices', [])
            if not slices:
                return None
            
            # Get first slice for basic info
            first_slice = slices[0]
            segments = first_slice.get('segments', [])
            if not segments:
                return None
            
            first_segment = segments[0]
            last_segment = segments[-1]
            
            # Calculate duration
            total_duration_minutes = 0
            for segment in segments:
                duration_str = segment.get('duration')
                if duration_str:
                    try:
                        if duration_str.startswith('PT'):
                            hours = 0
                            minutes = 0
                            if 'H' in duration_str:
                                hours = int(duration_str.split('H')[0].replace('PT',''))
                            if 'M' in duration_str:
                                min_part = duration_str.split('H')[1] if 'H' in duration_str else duration_str.replace('PT','')
                                minutes = int(min_part.replace('M',''))
                            total_duration_minutes += hours * 60 + minutes
                    except:
                        continue
            
            duration_str = f"{total_duration_minutes//60}h {total_duration_minutes%60}m"
            
            # Format times
            def format_time(iso_time):
                if not iso_time:
                    return "N/A"
                try:
                    dt = datetime.fromisoformat(iso_time.replace('Z','+00:00'))
                    return dt.strftime("%I:%M %p").lstrip('0')
                except:
                    return "N/A"
            
            flight_data = {
                "order_id": order_data.get('id'),
                "airline": first_segment.get('operating_carrier', {}).get('name', 'Unknown Airline'),
                "flight_number": first_segment.get('marketing_carrier_flight_number', ''),
                "departure": first_segment.get('origin', {}).get('iata_code', ''),
                "arrival": last_segment.get('destination', {}).get('iata_code', ''),
                "departure_time": first_segment.get('departing_at'),
                "arrival_time": last_segment.get('arriving_at'),
                "departure_city": first_segment.get('origin', {}).get('city_name', ''),
                "arrival_city": last_segment.get('destination', {}).get('city_name', ''),
                "duration": duration_str,
                "status": self._get_order_status(order_data),
                "total_amount": order_data.get('total_amount'),
                "currency": order_data.get('total_currency', 'GBP'),
                "passengers": order_data.get('passengers', []),
                "booking_reference": order_data.get('booking_reference', ''),
                "created_at": order_data.get('created_at'),
                "cabin_class": first_segment.get('passengers', [{}])[0].get('cabin_class', 'economy').title() if first_segment.get('passengers') else 'Economy',
                "trip_type": "Round Trip" if len(slices) > 1 else "One Way",
                "payment_status": self._get_payment_status(order_data)
            }
            
            return flight_data
            
        except Exception as e:
            logger.error(f"Error transforming order: {str(e)}")
            return None
    
    def _get_order_status(self, order_data: Dict) -> str:
        """Determine order status"""
        conditions = order_data.get('conditions', {})
        
        if order_data.get('cancelled_at'):
            return "Cancelled"
        elif conditions.get('change_before_departure') or conditions.get('refund_before_departure'):
            return "Confirmed"
        else:
            return "Pending"
    
    def _get_payment_status(self, order_data: Dict) -> str:
        """Determine payment status"""
        payments = order_data.get('payments', [])
        if payments:
            return "Paid"
        return "Pending"


class FlightBookingDetailView(APIView):
    """Get detailed information about a specific flight booking"""
    
    def get(self, request, order_id):
        try:
            duffel_client = DuffelOrderManager()
            order_response = duffel_client._make_request("GET", f"/air/orders/{order_id}")
            
            if not order_response or 'data' not in order_response:
                return Response({
                    "status": "error",
                    "message": "Flight booking not found"
                }, status=404)
            
            order_data = order_response['data']
            
            # Transform order data to detailed flight booking format
            detailed_booking = self._get_detailed_booking_info(order_data)
            
            return Response({
                "status": "success",
                "message": "Flight booking details retrieved",
                "booking": detailed_booking
            }, status=200)
            
        except Exception as e:
            logger.error(f"Error fetching flight booking details: {str(e)}")
            return Response({
                "status": "error",
                "message": "Failed to fetch booking details",
                "error": str(e)
            }, status=500)
    
    def _get_detailed_booking_info(self, order_data: Dict) -> Dict:
        """Get detailed booking information"""
        # Use the same transformation as MyFlightsView but add more details
        base_booking = MyFlightsView()._transform_order_to_flight(order_data)
        if not base_booking:
            return {}
        
        # Add additional details
        base_booking.update({
            "slices": order_data.get('slices', []),
            "conditions": order_data.get('conditions', {}),
            "documents": order_data.get('documents', []),
            "payments": order_data.get('payments', []),
            "metadata": order_data.get('metadata', {}),
            "services": order_data.get('services', []),
            "total_emissions_kg": order_data.get('total_emissions_kg'),
            "tax_amount": order_data.get('tax_amount'),
            "base_amount": order_data.get('base_amount'),
        })
        
        return base_booking


class CancelFlightBookingView(APIView):
    """Cancel a flight booking"""
    
    def post(self, request, order_id):
        try:
            duffel_client = DuffelOrderManager()
            
            # First get the order to check status
            order_response = duffel_client._make_request("GET", f"/air/orders/{order_id}")
            if not order_response or 'data' not in order_response:
                return Response({
                    "status": "error",
                    "message": "Flight booking not found"
                }, status=404)
            
            order_data = order_response['data']
            
            # Check if already cancelled
            if order_data.get('cancelled_at'):
                return Response({
                    "status": "error",
                    "message": "Booking is already cancelled"
                }, status=400)
            
            # Create cancellation offer
            cancellation_data = {
                "data": {
                    "order_id": order_id
                }
            }
            
            cancellation_response = duffel_client._make_request(
                "POST", 
                "/air/order_cancellations", 
                cancellation_data
            )
            
            if not cancellation_response or 'data' not in cancellation_response:
                return Response({
                    "status": "error",
                    "message": "Failed to create cancellation"
                }, status=400)
            
            cancellation_id = cancellation_response['data']['id']
            
            # Confirm cancellation
            confirm_response = duffel_client._make_request(
                "POST", 
                f"/air/order_cancellations/{cancellation_id}/actions/confirm"
            )
            
            return Response({
                "status": "success",
                "message": "Flight booking cancelled successfully",
                "cancellation": confirm_response.get('data', {}) if confirm_response else {}
            }, status=200)
            
        except Exception as e:
            logger.error(f"Error cancelling flight booking: {str(e)}")
            return Response({
                "status": "error",
                "message": "Failed to cancel booking",
                "error": str(e)
            }, status=500)