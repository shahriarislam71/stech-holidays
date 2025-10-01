from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from django.conf import settings
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)

class AccommodationSearchView(APIView):
    def post(self, request):
        try:
            # ==================== DEBUG 1: INCOMING REQUEST ====================
            logger.info("🔍 [DEBUG 1] Starting accommodation search request")
            logger.info(f"📥 [DEBUG 1] Raw request data: {request.data}")
            # ==================== END DEBUG 1 ====================

            # 1️⃣ Validate required fields
            check_in_date = request.data.get("check_in_date")
            check_out_date = request.data.get("check_out_date")
            
            if not check_in_date or not check_out_date:
                return Response({
                    "status": "error",
                    "message": "Missing check_in_date or check_out_date",
                    "error_code": "MISSING_FIELD"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 2️⃣ Validate location or accommodation
            location = request.data.get("location")
            accommodation = request.data.get("accommodation")
            
            if not location and not accommodation:
                return Response({
                    "status": "error", 
                    "message": "Either location or accommodation must be provided",
                    "error_code": "MISSING_FIELD"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 3️⃣ Build guests array
            guests = []
            travelers = request.data.get("travelers", {})
            adults_count = travelers.get("adults", 1)
            children_ages = travelers.get("children_ages", [])
            
            for _ in range(adults_count):
                guests.append({"type": "adult"})
            
            for age in children_ages:
                guests.append({
                    "type": "child",
                    "age": age
                })
            
            if not guests:
                return Response({
                    "status": "error",
                    "message": "At least one guest is required",
                    "error_code": "NO_GUESTS"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # 4️⃣ Validate other parameters
            rooms = request.data.get("rooms", 1)
            if rooms < 1:
                rooms = 1
            
            free_cancellation_only = request.data.get("free_cancellation_only", False)
            mobile = request.data.get("mobile", False)
            
            # 5️⃣ Build Duffel request
            search_data = {
                "data": {
                    "check_in_date": check_in_date,
                    "check_out_date": check_out_date,
                    "guests": guests,
                    "rooms": rooms,
                    "free_cancellation_only": free_cancellation_only,
                    "mobile": mobile
                }
            }
            
            # Add location or accommodation to search data
            if location:
                if not location.get("geographic_coordinates"):
                    return Response({
                        "status": "error",
                        "message": "Location must contain geographic_coordinates",
                        "error_code": "INVALID_LOCATION"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    search_data["data"]["location"] = {
                        "geographic_coordinates": {
                            "latitude": float(location["geographic_coordinates"]["latitude"]),
                            "longitude": float(location["geographic_coordinates"]["longitude"])
                        },
                        "radius": location.get("radius", 5)
                    }
                except (KeyError, ValueError, TypeError) as e:
                    return Response({
                        "status": "error",
                        "message": "Invalid geographic coordinates format",
                        "error": str(e),
                        "error_code": "INVALID_COORDINATES"
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                if not accommodation.get("id"):
                    return Response({
                        "status": "error",
                        "message": "Accommodation must contain id",
                        "error_code": "INVALID_ACCOMMODATION"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                search_data["data"]["accommodation"] = {
                    "id": accommodation["id"]
                }
            
            # 6️⃣ Duffel API request
            url = "https://api.duffel.com/stays/search"
            headers = {
                "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Duffel-Version": "v2",
                "Accept-Encoding": "gzip"
            }
            
            logger.info("🚀 Sending request to Duffel API...")
            
            try:
                response = requests.post(url, json=search_data, headers=headers, timeout=30)
                logger.info(f"📊 Duffel API response status: {response.status_code}")
                
                # ✅ FIX: Duffel returns 201 (Created) for successful searches, not 200
                if response.status_code in [200, 201]:  # Accept both 200 and 201 as success
                    # Parse the successful response
                    data = response.json()
                    all_results = data.get("data", {}).get("results", [])
                    
                    logger.info(f"✅ SUCCESS! Found {len(all_results)} accommodations from Duffel")
                    
                    if not all_results:
                        return Response({
                            "status": "success",
                            "message": "No accommodations found for your search criteria",
                            "results": {
                                "total": 0,
                                "accommodations": []
                            },
                            "search": self._build_search_summary(request.data, guests),
                            "filters": self._build_filters([]),
                            "metadata": {
                                "searchId": data.get("data", {}).get("id", ""),
                                "timestamp": datetime.now().isoformat(),
                                "resultsCount": 0
                            }
                        }, status=status.HTTP_200_OK)
                    
                    # Transform and return successful results
                    accommodations = self._transform_results(all_results, guests, request.data)
                    search_summary = self._build_search_summary(request.data, guests)
                    filters = self._build_filters(accommodations)
                    metadata = {
                        "searchId": data.get("data", {}).get("id", ""),
                        "timestamp": datetime.now().isoformat(),
                        "resultsCount": len(accommodations)
                    }
                    
                    logger.info(f"🎉 Returning {len(accommodations)} processed accommodations")
                    
                    return Response({
                        "status": "success",
                        "message": f"Found {len(accommodations)} accommodation options",
                        "search": search_summary,
                        "results": {
                            "total": len(accommodations),
                            "sorting": "price_low_to_high",
                            "accommodations": accommodations
                        },
                        "filters": filters,
                        "metadata": metadata
                    }, status=status.HTTP_200_OK)
                
                else:
                    # Handle actual API errors
                    try:
                        error_data = response.json()
                        error_msg = error_data.get("errors", [{}])[0].get("title", "Unknown error")
                        error_detail = error_data.get("errors", [{}])[0].get("detail", "")
                    except Exception:
                        error_msg = response.text or "Unknown error"
                    
                    logger.error(f"❌ Duffel API error {response.status_code}: {error_msg}")
                    
                    return Response({
                        "status": "error",
                        "message": "Accommodation search failed",
                        "error": f"Duffel API error: {error_msg}",
                        "error_detail": error_detail,
                        "error_code": "DUFFEL_API_ERROR"
                    }, status=response.status_code)
                
            except requests.exceptions.Timeout:
                logger.error("⏰ Duffel API request timeout")
                return Response({
                    "status": "error",
                    "message": "Accommodation search timeout",
                    "error": "Request to accommodation provider timed out",
                    "error_code": "TIMEOUT_ERROR"
                }, status=status.HTTP_504_GATEWAY_TIMEOUT)
                
            except Exception as e:
                logger.error(f"🌐 Request error: {str(e)}")
                return Response({
                    "status": "error",
                    "message": "Network error",
                    "error": str(e),
                    "error_code": "NETWORK_ERROR"
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        except Exception as e:
            logger.error(f"💥 Unexpected error: {str(e)}")
            return Response({
                "status": "error",
                "message": "Failed to search accommodations",
                "error": str(e),
                "error_code": "INTERNAL_SERVER_ERROR"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def _transform_results(self, results, guests, request_data):
        accommodations = []
        for result in results:
            try:
                search_result_id = result.get("id")
                accommodation_data = result.get("accommodation", {})
                location_data = accommodation_data.get("location", {})
                address_data = location_data.get("address", {})
                
                # ==================== REQUIRED PRICING FIELDS ====================
                total_amount = float(result.get("cheapest_rate_total_amount", 0))
                currency = result.get("cheapest_rate_currency", "GBP")
                public_amount = result.get("cheapest_rate_public_amount")
                due_at_accommodation_amount = result.get("cheapest_rate_due_at_accommodation_amount")
                base_amount = result.get("cheapest_rate_base_amount")
                # ==================== END REQUIRED PRICING FIELDS ====================
                
                # ==================== REQUIRED ROOM INFORMATION ====================
                rooms_data = accommodation_data.get("rooms", [])
                available_rooms = self._extract_room_info(rooms_data)
                # ==================== END REQUIRED ROOM INFORMATION ====================
                
                # ==================== REQUIRED AMENITIES ====================
                amenities = []
                for amenity in accommodation_data.get("amenities", []):
                    amenities.append({
                        "type": amenity.get("type"),
                        "description": amenity.get("description", "")
                    })
                # ==================== END REQUIRED AMENITIES ====================
                
                # ==================== REQUIRED PHOTOS ====================
                photos = []
                for photo in accommodation_data.get("photos", []):
                    photos.append({
                        "url": photo.get("url")
                    })
                # ==================== END REQUIRED PHOTOS ====================
                
                # ==================== REQUIRED CHECK-IN INFORMATION ====================
                check_in_info = accommodation_data.get("check_in_information", {})
                # ==================== END REQUIRED CHECK-IN INFORMATION ====================
                
                # ==================== REQUIRED NEGOTIATED RATES ====================
                negotiated_rates = []
                for rate in result.get("supported_negotiated_rates", []):
                    negotiated_rates.append({
                        "id": rate.get("id"),
                        "display_name": rate.get("display_name")
                    })
                # ==================== END REQUIRED NEGOTIATED RATES ====================
                
                # ==================== BUILD THE COMPLETE ACCOMMODATION OBJECT ====================
                accommodation = {
                    # ==================== SEARCH RESULT IDENTIFIERS ====================
                    "id": search_result_id,
                    "accommodationId": accommodation_data.get("id"),
                    
                    # ==================== BASIC INFORMATION ====================
                    "name": accommodation_data.get("name"),
                    "description": accommodation_data.get("description"),
                    "chain": accommodation_data.get("chain", {}).get("name"),
                    "brand": {
                        "name": accommodation_data.get("brand", {}).get("name"),
                        "id": accommodation_data.get("brand", {}).get("id")
                    },
                    
                    # ==================== PRICING INFORMATION (REQUIRED) ====================
                    "pricing": {
                        "totalAmount": total_amount,
                        "currency": currency,
                        "totalDisplay": f"{currency} {total_amount:.2f}",
                        "publicAmount": public_amount,
                        "dueAtAccommodationAmount": due_at_accommodation_amount,
                        "baseAmount": base_amount,
                        "baseCurrency": result.get("cheapest_rate_base_currency"),
                        "publicCurrency": result.get("cheapest_rate_public_currency"),
                        "dueAtAccommodationCurrency": result.get("cheapest_rate_due_at_accommodation_currency")
                    },
                    
                    # ==================== LOCATION INFORMATION (REQUIRED) ====================
                    "location": {
                        "address": {
                            "lineOne": address_data.get("line_one"),
                            "cityName": address_data.get("city_name"),
                            "region": address_data.get("region"),
                            "countryCode": address_data.get("country_code"),
                            "postalCode": address_data.get("postal_code")
                        },
                        "coordinates": {
                            "latitude": location_data.get("geographic_coordinates", {}).get("latitude"),
                            "longitude": location_data.get("geographic_coordinates", {}).get("longitude")
                        },
                        "fullAddress": f"{address_data.get('line_one', '')}, {address_data.get('city_name', '')}, {address_data.get('region', '')}, {address_data.get('country_code', '')}"
                    },
                    
                    # ==================== RATING INFORMATION (REQUIRED) ====================
                    "rating": {
                        "score": accommodation_data.get("review_score"),
                        "count": accommodation_data.get("review_count"),
                        "starRating": accommodation_data.get("rating")
                    },
                    
                    # ==================== CONTACT INFORMATION ====================
                    "contact": {
                        "phone": accommodation_data.get("phone_number"),
                        "email": accommodation_data.get("email")
                    },
                    
                    # ==================== CHECK-IN INFORMATION (REQUIRED) ====================
                    "checkInInfo": {
                        "checkInAfterTime": check_in_info.get("check_in_after_time"),
                        "checkInBeforeTime": check_in_info.get("check_in_before_time"),
                        "checkOutBeforeTime": check_in_info.get("check_out_before_time")
                    },
                    
                    # ==================== KEY COLLECTION ====================
                    "keyCollection": accommodation_data.get("key_collection", {}),
                    
                    # ==================== AMENITIES (REQUIRED) ====================
                    "amenities": amenities,
                    
                    # ==================== PHOTOS (REQUIRED) ====================
                    "photos": photos,
                    
                    # ==================== ROOMS (REQUIRED) ====================
                    "rooms": available_rooms,
                    
                    # ==================== FEATURES AND SUPPORT ====================
                    "features": {
                        "negotiatedRates": negotiated_rates,
                        "loyaltyProgramme": accommodation_data.get("supported_loyalty_programme"),
                        "paymentInstructionsSupported": accommodation_data.get("payment_instruction_supported", False)
                    },
                    
                    # ==================== SEARCH METADATA ====================
                    "searchDetails": {
                        "checkInDate": result.get("check_in_date"),
                        "checkOutDate": result.get("check_out_date"),
                        "guests": guests,  # Keep original guest structure
                        "rooms": result.get("rooms", 1),
                        "totalGuests": len(guests)
                    },
                    
                    # ==================== TIMESTAMP ====================
                    "createdAt": result.get("created_at")
                }
                
                accommodations.append(accommodation)
                
            except Exception as e:
                logger.error(f"Error processing accommodation result {result.get('id')}: {str(e)}")
                continue
        
        # Sort by price low to high
        accommodations.sort(key=lambda x: x.get("pricing", {}).get("totalAmount", 0))
        return accommodations

    def _extract_room_info(self, rooms_data):
        rooms = []
        for room in rooms_data:
            try:
                room_info = {
                    "name": room.get("name"),
                    "beds": room.get("beds", []),
                    "photos": [{"url": photo.get("url")} for photo in room.get("photos", [])],
                    "rates": []
                }
                
                # Extract rate information with all required fields
                for rate in room.get("rates", []):
                    rate_info = {
                        # ==================== RATE IDENTIFIERS ====================
                        "id": rate.get("id"),
                        "code": rate.get("code"),
                        "negotiatedRateId": rate.get("negotiated_rate_id"),
                        
                        # ==================== PRICING BREAKDOWN ====================
                        "pricing": {
                            "totalAmount": rate.get("total_amount"),
                            "totalCurrency": rate.get("total_currency"),
                            "publicAmount": rate.get("public_amount"),
                            "publicCurrency": rate.get("public_currency"),
                            "dueAtAccommodationAmount": rate.get("due_at_accommodation_amount"),
                            "dueAtAccommodationCurrency": rate.get("due_at_accommodation_currency"),
                            "baseAmount": rate.get("base_amount"),
                            "baseCurrency": rate.get("base_currency"),
                            "taxAmount": rate.get("tax_amount"),
                            "taxCurrency": rate.get("tax_currency"),
                            "feeAmount": rate.get("fee_amount"),
                            "feeCurrency": rate.get("fee_currency")
                        },
                        
                        # ==================== RATE DETAILS ====================
                        "paymentType": rate.get("payment_type"),
                        "boardType": rate.get("board_type"),
                        "quantityAvailable": rate.get("quantity_available"),
                        "loyaltyProgrammeRequired": rate.get("loyalty_programme_required", False),
                        "supportedLoyaltyProgramme": rate.get("supported_loyalty_programme"),
                        
                        # ==================== DEAL TYPES ====================
                        "dealTypes": rate.get("deal_types", []),
                        
                        # ==================== PAYMENT METHODS ====================
                        "availablePaymentMethods": rate.get("available_payment_methods", []),
                        
                        # ==================== CANCELLATION POLICY ====================
                        "cancellationTimeline": rate.get("cancellation_timeline", []),
                        
                        # ==================== CONDITIONS ====================
                        "conditions": rate.get("conditions", [])
                    }
                    room_info["rates"].append(rate_info)
                
                rooms.append(room_info)
            except Exception as e:
                logger.error(f"Error processing room: {str(e)}")
                continue
        
        return rooms



    def _build_search_summary(self, request_data, guests):
        travelers = request_data.get("travelers", {})
        location = request_data.get("location")
        accommodation = request_data.get("accommodation")
        
        search_type = "location" if location else "accommodation"
        search_target = location if location else accommodation
        
        return {
            "dates": {
                "checkIn": request_data.get("check_in_date"),
                "checkOut": request_data.get("check_out_date"),
                "nights": self._calculate_nights(request_data.get("check_in_date"), request_data.get("check_out_date"))
            },
            "searchType": search_type,
            "searchTarget": search_target,
            "occupancy": {
                "adults": travelers.get("adults", 1),
                "children": len(travelers.get("children_ages", [])),
                "totalGuests": len(guests),
                "rooms": request_data.get("rooms", 1)
            },
            "preferences": {
                "freeCancellationOnly": request_data.get("free_cancellation_only", False),
                "mobile": request_data.get("mobile", False)
            }
        }
    
    def _calculate_nights(self, check_in, check_out):
        try:
            check_in_date = datetime.strptime(check_in, "%Y-%m-%d")
            check_out_date = datetime.strptime(check_out, "%Y-%m-%d")
            return (check_out_date - check_in_date).days
        except:
            return 0
    
    def _build_filters(self, accommodations):
        if not accommodations:
            return {
                "priceRange": {"min": 0, "max": 0, "currency": "GBP"},
                "ratings": [],
                "amenities": [],
                "chains": [],
                "starRatings": [1, 2, 3, 4, 5]
            }
        
        # ✅ FIX: Pull price from the nested pricing dict
        prices = [
            acc["pricing"]["totalAmount"]
            for acc in accommodations
            if acc.get("pricing") and acc["pricing"].get("totalAmount") is not None
        ]
        if not prices:
            prices = [0]

        # ✅ FIX: Get currency from the first accommodation's pricing
        currency = (
            accommodations[0].get("pricing", {}).get("currency", "GBP")
            if accommodations else "GBP"
        )
        
        # ✅ Ratings (rounding where possible)
        ratings = set()
        for acc in accommodations:
            rating_score = acc.get("rating", {}).get("score")
            if rating_score:
                try:
                    ratings.add(round(float(rating_score)))
                except (ValueError, TypeError):
                    continue
        
        # ✅ Amenities (flatten amenity descriptions instead of dicts)
        amenities = set()
        for acc in accommodations:
            for amenity in acc.get("amenities", []):
                desc = amenity.get("description")
                if desc:
                    amenities.add(desc)
        
        # ✅ Chains
        chains = set()
        for acc in accommodations:
            chain = acc.get("chain")
            if chain:
                chains.add(chain)
        
        # ✅ Star ratings
        star_ratings = set()
        for acc in accommodations:
            star_rating = acc.get("rating", {}).get("starRating")
            if star_rating:
                try:
                    star_ratings.add(int(star_rating))
                except (ValueError, TypeError):
                    continue
        
        return {
            "priceRange": {
                "min": min(prices),
                "max": max(prices),
                "currency": currency
            },
            "ratings": sorted(list(ratings)),
            "amenities": sorted(list(amenities)),
            "chains": sorted(list(chains)),
            "starRatings": sorted(list(star_ratings)) if star_ratings else [1, 2, 3, 4, 5]
        }

        if not accommodations:
            return {
                "priceRange": {"min": 0, "max": 0, "currency": "GBP"},
                "ratings": [],
                "amenities": [],
                "chains": [],
                "starRatings": [1, 2, 3, 4, 5]
            }
        
        # Price range
        prices = [acc["priceAmount"] for acc in accommodations]
        currency = accommodations[0]["currency"] if accommodations else "GBP"
        
        # Ratings
        ratings = set()
        for acc in accommodations:
            if acc["rating"]["score"]:
                ratings.add(round(acc["rating"]["score"]))
        
        # Amenities
        amenities = set()
        for acc in accommodations:
            for amenity in acc["amenities"]:
                amenities.add(amenity)
        
        # Chains
        chains = set()
        for acc in accommodations:
            if acc["chain"]:
                chains.add(acc["chain"])
        
        # Star ratings
        star_ratings = set()
        for acc in accommodations:
            if acc["rating"]["starRating"]:
                star_ratings.add(acc["rating"]["starRating"])
        
        return {
            "priceRange": {
                "min": min(prices),
                "max": max(prices),
                "currency": currency
            },
            "ratings": sorted(list(ratings)),
            "amenities": sorted(list(amenities)),
            "chains": sorted(list(chains)),
            "starRatings": sorted(list(star_ratings))
        }