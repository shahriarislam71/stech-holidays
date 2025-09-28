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
from .models import Order, Passenger, Payment, OrderPassenger 



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



class FlightListView(APIView):
    def post(self, request):
            try:
                # 1️⃣ Validate required fields
                slices_input = request.data.get("slices")  # multicity array input
                if not slices_input:
                    # fallback: single origin/destination
                    slices_input = [{
                        "origin": request.data.get("origin"),
                        "destination": request.data.get("destination"),
                        "departure_date": request.data.get("departure_date")
                    }]

                if not isinstance(slices_input, list) or not slices_input:
                    return JsonResponse({
                        "status": "error",
                        "message": "Missing slices or invalid format",
                        "error_code": "MISSING_FIELD"
                    }, status=status.HTTP_400_BAD_REQUEST)

                # validate each slice
                slices = []
                for s in slices_input:
                    o = s.get("origin", "").upper()
                    d = s.get("destination", "").upper()
                    date = s.get("departure_date")
                    if not o or not d or not date:
                        return JsonResponse({
                            "status": "error",
                            "message": "Each slice must have origin, destination, and departure_date",
                            "error_code": "MISSING_FIELD"
                        }, status=status.HTTP_400_BAD_REQUEST)

                    if len(o) != 3 or not o.isalpha():
                        return JsonResponse({
                            "status": "error",
                            "message": f"Invalid origin IATA code: {o}",
                            "error_code": "INVALID_IATA_CODE"
                        }, status=status.HTTP_400_BAD_REQUEST)

                    if len(d) != 3 or not d.isalpha():
                        return JsonResponse({
                            "status": "error",
                            "message": f"Invalid destination IATA code: {d}",
                            "error_code": "INVALID_IATA_CODE"
                        }, status=status.HTTP_400_BAD_REQUEST)

                    slices.append({
                        "origin": o,
                        "destination": d,
                        "departure_date": date
                    })

                # 2️⃣ Build passengers array
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
                        "message": "At least one passenger is required",
                        "error_code": "NO_PASSENGERS"
                    }, status=status.HTTP_400_BAD_REQUEST)

                # 3️⃣ Validate cabin class and fare type
                valid_cabins = ["economy", "premium_economy", "business", "first"]
                cabin_class = request.data.get("cabin_class", "economy").lower()
                if cabin_class not in valid_cabins:
                    cabin_class = "economy"

                valid_fares = ["regular", "hold"]
                fare_type = request.data.get("fare_type", "regular").lower()
                if fare_type not in valid_fares:
                    fare_type = "regular"

                # 4️⃣ Build Duffel request
                search_data = {
                    "data": {
                        "slices": slices,
                        "passengers": passengers,
                        "cabin_class": cabin_class
                    },
                    "fare_type": fare_type
                }

                # 5️⃣ Duffel API request
                url = "https://api.duffel.com/air/offer_requests"
                headers = {
                    "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Duffel-Version": "v2"
                }

                response = requests.post(url, json=search_data, headers=headers, timeout=30)

                if response.status_code != 201:
                    try:
                        error_data = response.json()
                        error_msg = error_data.get("errors", [{}])[0].get("title", "Unknown error")
                    except Exception:
                        error_msg = response.text
                    return JsonResponse({
                        "status": "error",
                        "message": "Flight search failed",
                        "error": f"Duffel API error: {error_msg}",
                        "error_code": "DUFFEL_API_ERROR"
                    }, status=response.status_code)

                # 6️⃣ Transform Duffel offers
                data = response.json()
                all_offers = data.get("data", {}).get("offers", [])

                if not all_offers:
                    return JsonResponse({
                        "status": "success",
                        "message": "No flights found for your search criteria",
                        "results": {
                            "total": 0,
                            "itineraries": []
                        },
                        "search": self._build_search_summary(request.data, slices, passengers),
                        "filters": self._build_filters([]),
                        "metadata": {
                            "searchId": data.get("data", {}).get("id", ""),
                            "timestamp": datetime.now().isoformat(),
                            "resultsCount": 0
                        }
                    }, status=status.HTTP_200_OK)

                itineraries = self._transform_offers(all_offers, passengers, request.data)
                search_summary = self._build_search_summary(request.data, slices, passengers)
                filters = self._build_filters(itineraries)
                metadata = {
                    "searchId": data.get("data", {}).get("id", ""),
                    "timestamp": datetime.now().isoformat(),
                    "resultsCount": len(itineraries)
                }

                return JsonResponse({
                    "status": "success",
                    "message": f"Found {len(itineraries)} flight options",
                    "search": search_summary,
                    "results": {
                        "total": len(itineraries),
                        "sorting": "price_low_to_high",
                        "itineraries": itineraries
                    },
                    "filters": filters,
                    "metadata": metadata
                }, status=status.HTTP_200_OK)

            except requests.exceptions.Timeout:
                return JsonResponse({
                    "status": "error",
                    "message": "Flight search timeout",
                    "error": "Request to flight provider timed out",
                    "error_code": "TIMEOUT_ERROR"
                }, status=status.HTTP_504_GATEWAY_TIMEOUT)

            except Exception as e:
                return JsonResponse({
                    "status": "error",
                    "message": "Failed to search flights",
                    "error": str(e),
                    "error_code": "INTERNAL_SERVER_ERROR"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # ================== Keep all your existing helper methods intact ==================

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
                            "layover": False
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

    def _build_search_summary(self, request_data, slices, passengers):
        travelers = request_data.get("travelers", {})
        return {
            "route": [{"from": s["origin"], "to": s["destination"], "date": s["departure_date"]} for s in slices],
            "dates": {
                "tripType": "one_way" if len(slices)==1 else ("round_trip" if len(slices)==2 else "multi_city")
            },
            "travelers": {
                "adults": travelers.get("adults",1),
                "children": travelers.get("children",0),
                "infants": travelers.get("infants",0),
                "total": len(passengers)
            },
            "preferences": {
                "cabinClass": request_data.get("cabin_class","economy").title(),
                "fareType": request_data.get("fare_type","regular").title()
            }
        }

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
    def _build_metadata(self, duffel_data, itineraries):
        return {"searchId": duffel_data.get("data", {}).get("id",""),"timestamp":datetime.now().isoformat(),"resultsCount":len(itineraries)}



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
        self.timeout = 130

    def _make_request(self, method: str, endpoint: str, data: dict = None):
        """Make authenticated request to Duffel API"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=self.headers,
                json=data,  # directly pass payload
                timeout=self.timeout
            )
            logger.info(f"Duffel API {method} {endpoint}: {response.status_code}")
            print("1. Repoonse checking at DuffelOrderManager._make_request:" , response.json())
            if response.status_code in [200, 201]:
                return response.json()
            else:
                logger.error(f"API error {response.status_code}: {response.text}")
                response.raise_for_status()
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed for {endpoint}: {str(e)}")
            raise

    def validate_passenger(self, p: dict):
        errors = []
        required = ["given_name", "family_name", "born_on", "gender", "email", "phone_number"]
        for f in required:
            if not p.get(f):
                errors.append(f"Missing field {f}")
        # Email format check
        if p.get("email") and "@" not in p["email"]:
            errors.append("Invalid email")
        # Born date
        try:
            datetime.strptime(p.get("born_on",""), "%Y-%m-%d")
        except ValueError:
            errors.append("born_on must be YYYY-MM-DD")
        return errors

    def validate_payment(self, p: dict):
        errors = []
        if p.get("type") not in ["balance", "card", "arc_bsp_cash"]:
            errors.append("Invalid payment type")
        if not p.get("amount"):
            errors.append("Missing payment amount")
        if not p.get("currency"):
            errors.append("Missing currency")
        return errors


class OrderCreationView(APIView):
    """Creates order in Duffel and saves to local database."""

    def __init__(self):
        super().__init__()
        self.order_manager = DuffelOrderManager()

    def post(self, request): 
        try:
            payload = request.data.get("data")
            if not payload:
                return Response(
                    {"status": "error", "message": "Missing 'data'", "error_code": "MISSING_FIELD"},
                    status=400
                )

            selected_offers = payload.get("selected_offers")
            passengers = payload.get("passengers", [])
            metadata = payload.get("metadata", {})
            order_type = payload.get("type", "instant")

            if not selected_offers or not passengers:
                return Response(
                    {"status": "error", "message": "Missing selected_offers or passengers", "error_code": "MISSING_FIELD"},
                    status=400
                )

            offer_id = selected_offers[0]

            # Fetch offer details from Duffel
            offer_details = self.order_manager._make_request("GET", f"/air/offers/{offer_id}")
            offer_data = offer_details.get("data", {})
            slice_passengers = offer_data.get("slices", [])[0].get("segments", [])[0].get("passengers", [])

            # Build passenger payload for Duffel API
            passenger_payloads = []
            for idx, p in enumerate(passengers):
                p_data = {
                    "title": p["title"],
                    "given_name": p["given_name"],
                    "family_name": p["family_name"],
                    "born_on": p["born_on"],
                    "gender": p["gender"],
                    "email": p.get("email"),
                    "phone_number": p.get("phone_number"),
                    "identity_documents": p.get("identity_documents", [])
                }
                if idx < len(slice_passengers):
                    p_data["id"] = slice_passengers[idx]["passenger_id"]
                passenger_payloads.append(p_data)

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

            # Create order in Duffel
            duffel_result = self.order_manager._make_request("POST", "/air/orders", {"data": order_data})
            duffel_order_data = duffel_result.get("data", {})
            
            print("Duffel order created successfully:", duffel_order_data.get("id"))
            
            # Save to local database
            saved_order = self._save_order_to_database(duffel_order_data, passengers, metadata)
            
            # Return combined response
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
            return Response(
                {"status": "error", "message": "Internal server error", "error": str(e)}, 
                status=500
            )

    def _save_order_to_database(self, duffel_order_data, original_passengers, metadata):
        """Save order and passengers to local database with transaction safety"""
        from django.db import transaction
        
        try:
            with transaction.atomic():
                # Extract order details
                order_id = duffel_order_data.get("id")
                order_type = duffel_order_data.get("type", "instant")
                total_amount = duffel_order_data.get("total_amount")
                total_currency = duffel_order_data.get("total_currency")
                booking_reference = duffel_order_data.get("booking_reference")
                
                print(f"Saving order {order_id} to database...")
                
                # Create or update Order
                order, created = Order.objects.update_or_create(
                    id=order_id,
                    defaults={
                        'type': order_type,
                        'total_amount': total_amount,
                        'total_currency': total_currency,
                        'booking_reference': booking_reference,
                        'metadata': metadata,
                        'duffel_data': duffel_order_data  # Store full Duffel data
                    }
                )
                
                # Save passengers with their types
                duffel_passengers = duffel_order_data.get("passengers", [])
                
                for idx, duffel_passenger in enumerate(duffel_passengers):
                    # Get corresponding original passenger data
                    original_passenger = original_passengers[idx] if idx < len(original_passengers) else {}
                    passenger_type = duffel_passenger.get("type", "adult")
                    
                    passenger, p_created = Passenger.objects.update_or_create(
                        id=duffel_passenger.get("id"),
                        defaults={
                            'title': duffel_passenger.get("title", ""),
                            'given_name': duffel_passenger.get("given_name", ""),
                            'family_name': duffel_passenger.get("family_name", ""),
                            'born_on': duffel_passenger.get("born_on"),
                            'gender': duffel_passenger.get("gender", ""),
                            'email': original_passenger.get("email"),
                            'phone_number': original_passenger.get("phone_number"),
                            'identity_documents': original_passenger.get("identity_documents", [])
                        }
                    )
                    
                    # Create order-passenger relationship with type
                    OrderPassenger.objects.update_or_create(
                        order=order,
                        passenger=passenger,
                        defaults={'passenger_type': passenger_type}
                    )
                
                # Save payment information if available
                payments = duffel_order_data.get("payments", [])
                for payment_data in payments:
                    Payment.objects.update_or_create(
                        id=payment_data.get("id"),
                        defaults={
                            'order': order,
                            'type': payment_data.get("type"),
                            'amount': payment_data.get("amount"),
                            'currency': payment_data.get("currency"),
                            'status': payment_data.get("status", "completed"),
                            'duffel_data': payment_data
                        }
                    )
                
                print(f"Order {order_id} saved to database with {len(duffel_passengers)} passengers")
                return order
                
        except Exception as e:
            logger.error(f"Failed to save order to database: {str(e)}")
            raise



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



class CreatePaymentIntentView(APIView):

    
    def post(self, request):
        # Reuse the logic from PaymentViewSet.create_payment_intent
        serializer = PaymentIntentCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            data = serializer.validated_data
            offer_amount = data['offer_amount']
            markup = data['markup']
            target_currency = data.get('customer_currency', data['offer_currency'])
            
            final_amount = duffel_service.calculate_customer_amount(
                offer_amount, markup, target_currency
            )
            
            payment_intent = duffel_service.create_payment_intent(final_amount, target_currency)
            
            return Response({
                'payment_intent': payment_intent['data'],
                'client_token': payment_intent['data']['client_token'],
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ConfirmPaymentIntentView(APIView):
    
    def post(self, request):
        serializer = PaymentIntentConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            payment_intent_id = serializer.validated_data['payment_intent_id']
            confirmed_intent = duffel_service.confirm_payment_intent(payment_intent_id)
            
            return Response({'payment_intent': confirmed_intent['data']})
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class PayHoldOrderView(APIView):
    """Pay for a hold order"""
    
    def post(self, request):
        serializer = HoldOrderPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            data = serializer.validated_data
            payment = duffel_service.create_hold_order_payment(
                data['order_id'], data['amount'], data['currency'], data['payment_type']
            )
            
            return Response({'payment': payment['data']})
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

