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
        


import uuid
import requests
from decimal import Decimal, InvalidOperation
from django.utils import timezone
from django.conf import settings
from django.shortcuts import redirect
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import PaymentTransaction, HotelBooking
import logging

logger = logging.getLogger(__name__)

from decimal import Decimal, InvalidOperation
import uuid
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import PaymentTransaction

class InitiatePaymentView(APIView):
    """
    Initiates payment via SSLCommerz sandbox or live.
    Expects full customer and product info in POST JSON.
    """

    def post(self, request):

        data = request.data

        # --- Required fields check ---
        required_fields = [
            "total_amount", "currency", "quote_id", "email",
            "cus_name", "cus_phone", "cus_add1", "cus_city",
            "cus_state", "cus_postcode", "cus_country",
            "product_name", "product_category", "product_profile",
            "shipping_method"
        ]

        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            return Response({
                "success": False,
                "error": f"Missing fields: {', '.join(missing)}"
            }, status=400)

        # --- Parse amount safely ---
        try:
            total_amount = Decimal(str(data["total_amount"]))
        except (ValueError, InvalidOperation) as e:
            return Response({
                "success": False,
                "error": f"Invalid total_amount: {str(e)}"
            }, status=400)

        # --- Generate unique transaction ID ---
        tran_id = f"TXN_{uuid.uuid4().hex[:12].upper()}"

        # --- Build payload for SSLCommerz ---
        payload = {
            "store_id": getattr(settings, "SSL_STORE_ID", "testbox"),
            "store_passwd": getattr(settings, "SSL_STORE_PASS", "qwerty"),
            "total_amount": f"{total_amount:.2f}",
            "currency": data.get("currency", "BDT"),
            "tran_id": tran_id,
            "success_url": request.build_absolute_uri("/api/hotels/payments/success/"),
            "fail_url": request.build_absolute_uri("/api/hotels/payments/fail/"),
            "cancel_url": request.build_absolute_uri("/api/hotels/payments/cancel/"),
            "ipn_url": request.build_absolute_uri("/api/hotels/payments/ipn/"),

            # --- Customer info ---
            "cus_name": data["cus_name"],
            "cus_email": data["email"],
            "cus_phone": data["cus_phone"],
            "cus_add1": data["cus_add1"],
            "cus_add2": data.get("cus_add2", ""),
            "cus_city": data["cus_city"],
            "cus_state": data["cus_state"],
            "cus_postcode": data["cus_postcode"],
            "cus_country": data["cus_country"],

            # --- Product info ---
            "product_name": data["product_name"],
            "product_category": data["product_category"],
            "product_profile": data["product_profile"],

            # --- Shipping info ---
            "shipping_method": data["shipping_method"],
        }

        if data["shipping_method"].upper() != "NO":
            payload.update({
                "ship_name": data.get("ship_name", data["cus_name"]),
                "ship_add1": data.get("ship_add1", data["cus_add1"]),
                "ship_city": data.get("ship_city", data["cus_city"]),
                "ship_state": data.get("ship_state", data["cus_state"]),
                "ship_postcode": data.get("ship_postcode", data["cus_postcode"]),
                "ship_country": data.get("ship_country", data["cus_country"]),
            })

        # --- Send to SSLCommerz ---
        api_url = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
        try:
            response = requests.post(api_url, data=payload, timeout=15)
            response_data = response.json()
        except Exception as e:
            return Response({
                "success": False,
                "error": f"Payment initiation error: {str(e)}"
            }, status=502)

        # --- Validate response ---
        if response_data.get("status") != "SUCCESS":
            return Response({
                "success": False,
                "error": response_data.get("failedreason", "Payment init failed")
            }, status=400)

        # --- Save transaction record ---
        PaymentTransaction.objects.create(
            tran_id=tran_id,
            checkout_data=data,
            session_key=response_data.get("sessionkey", ""),
            amount=total_amount,
            initiation_response=response_data,
            status="initiated"
        )

        # --- Final clean response ---
        return Response({
            "success": True,
            "tran_id": tran_id,
            "quote_id": data["quote_id"],
            "payment_url": response_data.get("GatewayPageURL"),
        })

# ---------- IPN Handler ----------
@method_decorator(csrf_exempt, name='dispatch')
class PaymentIPNView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print("1. IPN RECEIVED")
        data = request.data
        tran_id = data.get('tran_id')
        val_id = data.get('val_id')
        status_ipn = data.get('status')
        amount = data.get('amount')

        if not all([tran_id, val_id, status_ipn, amount]):
            return Response({'error': 'Missing fields'}, status=400)

        try:
            payment = PaymentTransaction.objects.get(tran_id=tran_id)
        except PaymentTransaction.DoesNotExist:
            return Response({'error': 'Transaction not found'}, status=404)

        if PaymentTransaction.objects.filter(val_id=val_id, status='success').exists():
            return Response({'status': 'duplicate', 'message': 'IPN already processed'}, status=200)

        if abs(payment.amount - Decimal(str(amount))) > Decimal('0.01'):
            payment.status = 'failed'
            payment.save()
            return Response({'error': 'Amount mismatch'}, status=400)

        payment.status = 'success'
        payment.val_id = val_id
        payment.ipn_data = data
        payment.ipn_received_at = timezone.now()
        payment.save()

        return Response({'status': 'success', 'tran_id': tran_id})



import json
import requests
from django.conf import settings
from django.shortcuts import redirect
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from .models import PaymentTransaction
from .models import HotelBooking


class PaymentSuccessView(APIView):
    permission_classes = [AllowAny]

    def handle_success_payment(self, data):
        print("🔵 [START] handle_success_payment triggered")
        print("📩 Incoming data:", dict(data))

        tran_id = data.get('tran_id') or (data.get('tran_id')[0] if isinstance(data.get('tran_id'), list) else None)
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        print(f"🆔 Transaction ID: {tran_id}")

        if not tran_id:
            print("❌ No transaction ID found in callback data")
            return redirect(f'{frontend_url}/payment/fail?error=no_transaction')

        try:
            print("🔍 Fetching PaymentTransaction from DB...")
            payment = PaymentTransaction.objects.get(tran_id=tran_id)
            print(f"✅ PaymentTransaction found: {payment.id}")

            payment.status = 'success'
            payment.redirect_data = dict(data)
            payment.redirect_received_at = timezone.now()
            payment.save()
            print("💾 PaymentTransaction updated to success")

            checkout = payment.checkout_data or {}
            print("🧾 Checkout Data:", checkout)

            quote_id = checkout.get('quote_id')
            guests = checkout.get('guest_info', [])
            print(f"📦 Quote ID: {quote_id}")
            print(f"👥 Guests: {guests}")

            # Build Duffel payload with required fields
            duffel_guests = [
                {
                    "type": g.get("type", "adult"),
                    "given_name": (checkout.get("cus_name", "Guest User").split(" ")[0]) or "Guest",
                    "family_name": (checkout.get("cus_name", "Guest User").split(" ")[-1]) or "User",
                    "age": g.get("age"),
                }
                for g in guests
            ]

            payload = {
                "data": {
                    "quote_id": quote_id,
                    "guests": duffel_guests,
                    "email": checkout.get("email", "guest@example.com"),
                    "phone_number": checkout.get("cus_phone", "+8800000000000"),
                }
            }

            print("🌍 Sending Duffel booking request:", "https://api.duffel.com/stays/bookings")
            print("📤 Payload:", json.dumps(payload, indent=2))

            headers = {
                "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
                "Duffel-Version": "v2",
                "Content-Type": "application/json",
            }

            response = requests.post("https://api.duffel.com/stays/bookings", json=payload, headers=headers, timeout=30)
            data_resp = response.json()
            print(f"📥 Duffel API Response ({response.status_code}):", json.dumps(data_resp, indent=2))

            # ✅ Successful Duffel booking
            if response.status_code == 201:
                booking_id = data_resp["data"]["id"]
                HotelBooking.objects.create(
                    booking_id=booking_id,
                    quote_id=quote_id,
                    email=checkout.get("email", ""),
                    phone_number=checkout.get("cus_phone", ""),
                    status="confirmed",
                    payment_status="paid",
                    transaction=payment,
                    raw_response=data_resp,
                )
                print(f"✅ HotelBooking created successfully: {booking_id}")
                return redirect(f"{frontend_url}/payment/success?tran_id={tran_id}&order_id={booking_id}&paid=true&booking_type=hotel")

            # ⚠️ Duffel booking failed
            print(f"⚠️ Duffel booking failed with status {response.status_code}: {data_resp}")
            return redirect(f'{frontend_url}/payment/fail?tran_id={tran_id}')

        except PaymentTransaction.DoesNotExist:
            print(f"❌ PaymentTransaction not found for tran_id={tran_id}")
            return redirect(f'{frontend_url}/payment/fail?error=payment_not_found')

        except Exception as e:
            print(f"🔥 Unexpected error in handle_success_payment: {str(e)}")
            return redirect(f'{frontend_url}/payment/fail?error=exception')

    def get(self, request):
        print("🟢 PaymentSuccessView GET triggered")
        return self.handle_success_payment(request.GET)

    def post(self, request):
        print("🟢 PaymentSuccessView POST triggered")
        return self.handle_success_payment(request.data)

# ---------- Failed / Cancel Views ----------
class PaymentFailView(APIView):
    permission_classes = [AllowAny]

    def handle_failed_payment(self, data):
        tran_id = data.get('tran_id')
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        if tran_id:
            PaymentTransaction.objects.filter(tran_id=tran_id).update(status='failed')
        return redirect(f'{frontend_url}/payment/fail?tran_id={tran_id or "unknown"}')

    def get(self, request):
        return self.handle_failed_payment(request.GET)

    def post(self, request):
        return self.handle_failed_payment(request.data)


class PaymentCancelView(APIView):
    permission_classes = [AllowAny]

    def handle_cancelled_payment(self, data):
        tran_id = data.get('tran_id')
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        if tran_id:
            PaymentTransaction.objects.filter(tran_id=tran_id).update(status='cancelled')
        return redirect(f'{frontend_url}/payment/fail?tran_id={tran_id or "unknown"}&status=cancelled')

    def get(self, request):
        return self.handle_cancelled_payment(request.GET)

    def post(self, request):
        return self.handle_cancelled_payment(request.data)



#jncjdsnj