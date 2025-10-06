from rest_framework.views import APIView
from rest_framework.response import Response 
from rest_framework.permissions import AllowAny
from rest_framework import status
import requests
from django.conf import settings
from datetime import datetime
import logging
import json

logger = logging.getLogger(__name__)

class AccommodationSearchView(APIView):
    """
    Step 1: Search for accommodations by location_name or coordinates.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            logger.info("🔍 Starting accommodation search")
            
            # Validate required fields
            check_in_date = request.data.get("check_in_date")
            check_out_date = request.data.get("check_out_date")
            
            if not check_in_date or not check_out_date:
                return Response({
                    "status": "error",
                    "message": "check_in_date and check_out_date are required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validate location or accommodation
            location = request.data.get("location")
            accommodation = request.data.get("accommodation")
            
            if not location and not accommodation:
                return Response({
                    "status": "error", 
                    "message": "Either location or accommodation must be provided"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Build guests array
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
                    "message": "At least one guest is required"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Build Duffel request
            search_data = {
                "data": {
                    "check_in_date": check_in_date,
                    "check_out_date": check_out_date,
                    "guests": guests,
                    "rooms": request.data.get("rooms", 1),
                    "free_cancellation_only": request.data.get("free_cancellation_only", False),
                    "mobile": request.data.get("mobile", False)
                }
            }
            
            # Add location or accommodation to search data
            if location:
                if not location.get("geographic_coordinates"):
                    return Response({
                        "status": "error",
                        "message": "Location must contain geographic_coordinates"
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
                        "message": "Invalid geographic coordinates format"
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                if not accommodation.get("id"):
                    return Response({
                        "status": "error",
                        "message": "Accommodation must contain id"
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                search_data["data"]["accommodation"] = {
                    "id": accommodation["id"]
                }
            
            # Duffel API request
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
                
                if response.status_code in [200, 201]:
                    data = response.json()
                    all_results = data.get("data", {}).get("results", [])
                    
                    logger.info(f"✅ SUCCESS! Found {len(all_results)} accommodations")
                    
                    if not all_results:
                        return Response({
                            "status": "success",
                            "message": "No accommodations found",
                            "results": []
                        }, status=status.HTTP_200_OK)
                    
                    # Transform results
                    accommodations = []
                    for result in all_results:
                        try:
                            accommodation_data = result.get("accommodation", {})
                            location_data = accommodation_data.get("location", {})
                            address_data = location_data.get("address", {})
                            
                            accommodation_obj = {
                                "search_result_id": result.get("id"),
                                "accommodation_id": accommodation_data.get("id"),
                                "name": accommodation_data.get("name"),
                                "description": accommodation_data.get("description"),
                                "rating": accommodation_data.get("rating"),
                                "review_score": accommodation_data.get("review_score"),
                                "review_count": accommodation_data.get("review_count"),
                                "location": {
                                    "address": {
                                        "line_one": address_data.get("line_one"),
                                        "city_name": address_data.get("city_name"),
                                        "region": address_data.get("region"),
                                        "country_code": address_data.get("country_code"),
                                        "postal_code": address_data.get("postal_code")
                                    },
                                    "coordinates": {
                                        "latitude": location_data.get("geographic_coordinates", {}).get("latitude"),
                                        "longitude": location_data.get("geographic_coordinates", {}).get("longitude")
                                    }
                                },
                                "photos": [{"url": photo.get("url")} for photo in accommodation_data.get("photos", [])],
                                "amenities": [
                                    {
                                        "type": amenity.get("type"),
                                        "description": amenity.get("description", "")
                                    } for amenity in accommodation_data.get("amenities", [])
                                ],
                                "pricing": {
                                    "total_amount": float(result.get("cheapest_rate_total_amount", 0)),
                                    "currency": result.get("cheapest_rate_currency", "GBP"),
                                    "public_amount": result.get("cheapest_rate_public_amount"),
                                    "due_at_accommodation_amount": result.get("cheapest_rate_due_at_accommodation_amount")
                                },
                                "check_in_info": accommodation_data.get("check_in_information", {})
                            }
                            accommodations.append(accommodation_obj)
                            
                        except Exception as e:
                            logger.error(f"Error processing accommodation: {str(e)}")
                            continue
                    
                    # Sort by price
                    accommodations.sort(key=lambda x: x.get("pricing", {}).get("total_amount", 0))
                    
                    return Response({
                        "status": "success",
                        "message": f"Found {len(accommodations)} accommodations",
                        "search_id": data.get("data", {}).get("id", ""),
                        "results": accommodations
                    }, status=status.HTTP_200_OK)
                
                else:
                    error_data = response.json()
                    error_msg = error_data.get("errors", [{}])[0].get("title", "Unknown error")
                    
                    logger.error(f"❌ Duffel API error {response.status_code}: {error_msg}")
                    
                    return Response({
                        "status": "error",
                        "message": "Search failed",
                        "error": error_msg
                    }, status=response.status_code)
                
            except requests.exceptions.Timeout:
                logger.error("⏰ Duffel API request timeout")
                return Response({
                    "status": "error",
                    "message": "Search timeout"
                }, status=status.HTTP_504_GATEWAY_TIMEOUT)
                
            except Exception as e:
                logger.error(f"🌐 Request error: {str(e)}")
                return Response({
                    "status": "error",
                    "message": "Network error"
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        except Exception as e:
            logger.error(f"💥 Unexpected error: {str(e)}")
            return Response({
                "status": "error",
                "message": "Internal server error"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HotelOffersView(APIView):
    """
    Step 2: Get detailed offers/rooms for a specific search result
    """
    permission_classes = [AllowAny]

    def get(self, request, search_result_id):
        url = f"https://api.duffel.com/stays/search_results/{search_result_id}/actions/fetch_all_rates"
        headers = {
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
            "Duffel-Version": "v2",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip"
        }

        try:
            response = requests.post(url, headers=headers, timeout=30)
            data = response.json()

            if response.status_code != 200:
                return Response(
                    {"status": "error", "message": "Failed to fetch offers", "details": data},
                    status=response.status_code
                )

            hotel_info = data.get("data", {})
            accommodation = hotel_info.get("accommodation", {})
            rooms = accommodation.get("rooms", [])

            room_offers = []
            for room in rooms:
                for rate in room.get("rates", []):
                    room_offers.append({
                        "rate_id": rate.get("id"),
                        "room_name": room.get("name"),
                        "beds": room.get("beds", []),
                        "board_type": rate.get("board_type"),
                        "total_amount": rate.get("total_amount"),
                        "currency": rate.get("total_currency"),
                        "due_at_accommodation_amount": rate.get("due_at_accommodation_amount"),
                        "payment_type": rate.get("payment_type"),
                        "cancellation_timeline": rate.get("cancellation_timeline", []),
                        "conditions": rate.get("conditions", []),
                        "available_payment_methods": rate.get("available_payment_methods", []),
                        "quantity_available": rate.get("quantity_available")
                    })

            return Response({
                "status": "success",
                "hotel": {
                    "name": accommodation.get("name"),
                    "description": accommodation.get("description"),
                    "rating": accommodation.get("rating"),
                    "review_score": accommodation.get("review_score"),
                    "review_count": accommodation.get("review_count"),
                    "location": accommodation.get("location"),
                    "photos": accommodation.get("photos", []),
                    "amenities": accommodation.get("amenities", [])
                },
                "room_offers": room_offers
            }, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            return Response(
                {"status": "error", "message": "Request failed", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"status": "error", "message": "Unexpected error", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CreateQuoteView(APIView):
    """
    Step 3: Create a quote from a rate ID
    """
    permission_classes = [AllowAny]

    def post(self, request):
        rate_id = request.data.get("rate_id")
        if not rate_id:
            return Response({
                "status": "error", 
                "message": "rate_id is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        url = "https://api.duffel.com/stays/quotes"
        headers = {
            "Accept-Encoding": "gzip",
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Duffel-Version": "v2",
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}"
        }
        payload = {
            "data": {
                "rate_id": rate_id
            }
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            
            if response.status_code == 201:
                data = response.json()
                return Response({
                    "status": "success",
                    "quote": data.get("data", {})
                }, status=status.HTTP_201_CREATED)
            else:
                error_data = response.json()
                return Response({
                    "status": "error",
                    "message": "Failed to create quote",
                    "details": error_data
                }, status=response.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({
                "status": "error",
                "message": "Request failed",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CreateBookingView(APIView):
    """
    Step 4: Create a booking from a quote
    """
    permission_classes = [AllowAny]

    def post(self, request):
        quote_id = request.data.get("quote_id")
        guests = request.data.get("guests", [])
        email = request.data.get("email")
        phone_number = request.data.get("phone_number")

        # === Validate Required Fields ===
        required_fields = {
            "quote_id": quote_id,
            "email": email,
            "phone_number": phone_number
        }
        for field, value in required_fields.items():
            if not value:
                return Response({
                    "status": "error",
                    "message": f"{field} is required"
                }, status=status.HTTP_400_BAD_REQUEST)

        if not guests:
            return Response({
                "status": "error",
                "message": "At least one guest is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        # === Build Booking Payload ===
        booking_data = {
            "data": {
                "quote_id": quote_id,
                "guests": guests,
                "email": email,
                "phone_number": phone_number
            }
        }

        optional_fields = [
            "loyalty_programme_account_number",
            "accommodation_special_requests",
            "metadata",
            "users"
        ]
        for field in optional_fields:
            if request.data.get(field):
                booking_data["data"][field] = request.data.get(field)

        # === Duffel API Request ===
        url = "https://api.duffel.com/stays/bookings"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Duffel-Version": "v2",
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}"
        }

        try:
            response = requests.post(url, json=booking_data, headers=headers, timeout=30)

            if response.status_code == 201:
                data = response.json().get("data", {})
                booking_id = data.get("id")

                # === Save to DB ===
                with transaction.atomic():
                    HotelBooking.objects.create(
                        booking_id=booking_id,
                        quote_id=quote_id,
                        email=email,
                        phone_number=phone_number,
                        status="confirmed",
                        payment_status="unpaid",
                        raw_response=data
                    )

                print(f"✅ Booking saved to DB → {booking_id}")
                logger.info(f"Booking created and saved: {booking_id}")

                return Response({
                    "status": "success",
                    "message": "Booking created successfully",
                    "booking": data
                }, status=status.HTTP_201_CREATED)

            else:
                # === Failed to Create Booking ===
                error_data = response.json()
                print("❌ Duffel booking creation failed. Not saving to DB.")
                logger.error(f"Booking creation failed: {error_data}")

                return Response({
                    "status": "error",
                    "message": "Booking creation failed",
                    "details": error_data
                }, status=response.status_code)

        except requests.exceptions.RequestException as e:
            print("🌐 Request failed. Not saving to DB.")
            logger.error(f"Booking request failed: {str(e)}")
            return Response({
                "status": "error",
                "message": "Booking request failed",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ConfirmBookingPaymentView(APIView):
    """
    Step 5: Confirm payment for a booking (if required)
    """
    permission_classes = [AllowAny]

    def post(self, request):
        booking_id = request.data.get("booking_id")
        payment_type = request.data.get("payment_type", "balance")  # balance or card

        if not booking_id:
            return Response({
                "status": "error",
                "message": "booking_id is required"
            }, status=status.HTTP_400_BAD_REQUEST)

        payload = {
            "data": {
                "type": payment_type
            }
        }

        # Add card details if payment type is card
        if payment_type == "card" and request.data.get("payment_method_id"):
            payload["data"]["payment_method_id"] = request.data.get("payment_method_id")

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Duffel-Version": "v2",
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}"
        }

        try:
            response = requests.post(
                f"https://api.duffel.com/stays/bookings/{booking_id}/payments",
                json=payload, 
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return Response({
                    "status": "success",
                    "message": "Payment confirmed",
                    "payment": data.get("data", {})
                }, status=status.HTTP_200_OK)
            else:
                error_data = response.json()
                return Response({
                    "status": "error",
                    "message": "Payment confirmation failed",
                    "details": error_data
                }, status=response.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({
                "status": "error",
                "message": "Payment request failed",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class GetBookingView(APIView):
    """
    Get booking details
    """
    permission_classes = [AllowAny]

    def get(self, request, booking_id):
        url = f"https://api.duffel.com/stays/bookings/{booking_id}"
        headers = {
            "Accept": "application/json",
            "Duffel-Version": "v2",
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}"
        }

        try:
            response = requests.get(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return Response({
                    "status": "success",
                    "booking": data.get("data", {})
                }, status=status.HTTP_200_OK)
            else:
                error_data = response.json()
                return Response({
                    "status": "error",
                    "message": "Failed to get booking",
                    "details": error_data
                }, status=response.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({
                "status": "error",
                "message": "Request failed",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class CancelBookingView(APIView):
    """
    Cancel a booking
    """
    permission_classes = [AllowAny]

    def post(self, request, booking_id):
        url = f"https://api.duffel.com/stays/bookings/{booking_id}/actions/cancel"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Duffel-Version": "v2",
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}"
        }

        try:
            response = requests.post(url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return Response({
                    "status": "success",
                    "message": "Booking cancelled successfully",
                    "booking": data.get("data", {})
                }, status=status.HTTP_200_OK)
            else:
                error_data = response.json()
                return Response({
                    "status": "error",
                    "message": "Failed to cancel booking",
                    "details": error_data
                }, status=response.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({
                "status": "error",
                "message": "Cancel request failed",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ListBookingsView(APIView):
    """
    List all bookings with pagination
    """
    permission_classes = [AllowAny]

    def get(self, request):
        url = "https://api.duffel.com/stays/bookings"
        
        # Get query parameters
        params = {}
        if request.GET.get('limit'):
            params['limit'] = request.GET.get('limit')
        if request.GET.get('after'):
            params['after'] = request.GET.get('after')
        if request.GET.get('before'):
            params['before'] = request.GET.get('before')
        if request.GET.get('user_id'):
            params['user_id'] = request.GET.get('user_id')

        headers = {
            "Accept": "application/json",
            "Duffel-Version": "v2",
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}"
        }

        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                return Response({
                    "status": "success",
                    "bookings": data.get("data", []),
                    "meta": data.get("meta", {})
                }, status=status.HTTP_200_OK)
            else:
                error_data = response.json()
                return Response({
                    "status": "error",
                    "message": "Failed to list bookings",
                    "details": error_data
                }, status=response.status_code)
                
        except requests.exceptions.RequestException as e:
            return Response({
                "status": "error",
                "message": "Request failed",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        



from .models import HotelBooking, PaymentTransaction

logger = logging.getLogger(__name__)


class InitiatePaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        quote_id = request.data.get("quote_id")
        amount = request.data.get("amount")
        email = request.data.get("email")
        phone = request.data.get("phone")

        if not all([quote_id, amount, email, phone]):
            return Response({"error": "Missing required fields"}, status=400)

        tran_id = f"TXN_{uuid.uuid4().hex[:8]}"
        payment = PaymentTransaction.objects.create(tran_id=tran_id, amount=amount)

        # prepare SSLCommerz payload
        payload = {
            "store_id": settings.SSL_STORE_ID,
            "store_passwd": settings.SSL_STORE_PASS,
            "total_amount": amount,
            "currency": "BDT",
            "tran_id": tran_id,
            "success_url": settings.SSL_SUCCESS_URL,
            "fail_url": settings.SSL_FAIL_URL,
            "cancel_url": settings.SSL_CANCEL_URL,
            "cus_email": email,
            "cus_phone": phone,
        }

        ssl_url = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
        resp = requests.post(ssl_url, data=payload)

        if resp.status_code == 200:
            data = resp.json()
            return Response({"GatewayPageURL": data.get("GatewayPageURL"), "tran_id": tran_id})
        return Response({"error": "SSLCommerz init failed"}, status=500)


class PaymentValidationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        tran_id = data.get("tran_id")

        if not tran_id:
            return Response({"error": "No tran_id"}, status=400)

        try:
            payment = PaymentTransaction.objects.get(tran_id=tran_id)
        except PaymentTransaction.DoesNotExist:
            return Response({"error": "Transaction not found"}, status=404)

        # validate payment from SSLCOMMERZ
        validation_url = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
        params = {
            "val_id": data.get("val_id"),
            "store_id": settings.SSL_STORE_ID,
            "store_passwd": settings.SSL_STORE_PASS,
            "format": "json"
        }
        response = requests.get(validation_url, params=params)
        validation = response.json()

        if validation.get("status") == "VALID":
            payment.status = "success"
            payment.validation_response = validation
            payment.save()
            logger.info(f"✅ SSL Payment Validated: {tran_id}")
            return Response({"message": "Payment verified", "tran_id": tran_id})
        else:
            payment.status = "failed"
            payment.validation_response = validation
            payment.save()
            return Response({"error": "Payment not valid"}, status=400)


class ConfirmBookingAfterPayment(APIView):
    """
    Confirm Duffel booking only after successful SSLCOMMERZ payment
    """
    permission_classes = [AllowAny]

    def post(self, request):
        tran_id = request.data.get("tran_id")
        guests = request.data.get("guests", [])
        email = request.data.get("email")
        phone_number = request.data.get("phone_number")
        quote_id = request.data.get("quote_id")

        try:
            payment = PaymentTransaction.objects.get(tran_id=tran_id, status="success")
        except PaymentTransaction.DoesNotExist:
            return Response({"error": "Payment not successful or invalid tran_id"}, status=400)

        # === Create Duffel Booking ===
        booking_data = {
            "data": {
                "quote_id": quote_id,
                "guests": guests,
                "email": email,
                "phone_number": phone_number
            }
        }

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Duffel-Version": "v2",
            "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}"
        }

        url = "https://api.duffel.com/stays/bookings"

        try:
            response = requests.post(url, json=booking_data, headers=headers, timeout=30)
            data = response.json()

            if response.status_code == 201:
                booking_id = data["data"]["id"]
                with transaction.atomic():
                    HotelBooking.objects.create(
                        booking_id=booking_id,
                        quote_id=quote_id,
                        email=email,
                        phone_number=phone_number,
                        status="confirmed",
                        payment_status="paid",
                        transaction=payment,
                        raw_response=data
                    )
                logger.info(f"✅ Booking confirmed and saved: {booking_id}")
                return Response({"status": "success", "booking": data}, status=201)
            else:
                logger.error(f"❌ Duffel booking failed: {data}")
                return Response({"error": "Duffel booking failed", "details": data}, status=400)
        except requests.exceptions.RequestException as e:
            logger.error(f"🌐 Duffel API failed: {str(e)}")
            return Response({"error": str(e)}, status=500)




#jncjdsnj