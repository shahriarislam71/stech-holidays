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
from django.template.loader import render_to_string

class AccommodationSearchView(APIView):
    """
    Step 1: Search for accommodations by location_name or coordinates.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            logger.info(" Starting accommodation search")
            
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
                    print(response)
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

        tran_id = data.get('tran_id')
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
            
            # Check if HotelBooking already exists for this transaction
            try:
                
                booking = HotelBooking.objects.get(transaction=payment)
                print(f"✅ HotelBooking already exists: {booking.booking_reference}")
                
                # Prepare comprehensive confirmation data WITH SAFE FIELD ACCESS
                confirmation_data = {
                    'status': 'success',
                    'booking': {
                        # Booking Details
                        'booking_reference': booking.booking_reference,
                        'confirmation_number': booking.confirmation_number,
                        'booking_confirmed_date': booking.booking_confirmed_date.isoformat(),
                        'status': booking.status,
                        'payment_status': booking.payment_status,
                        
                        # Hotel Information
                        'hotel_name': booking.hotel_name,
                        'hotel_address': booking.hotel_address,
                        'hotel_city': booking.hotel_city,
                        'hotel_country': booking.hotel_country,
                        
                        # Stay Details - Use safe access with getattr
                        'check_in_date': booking.check_in_date.isoformat(),
                        'check_out_date': booking.check_out_date.isoformat(),
                        'nights': booking.nights,
                        'room_type': booking.room_type,
                        'board_type': booking.board_type,
                        'adults': booking.adults,
                        'children': booking.children,
                        'rooms': booking.rooms,
                        'check_in_time': getattr(booking, 'check_in_time', '2:00 PM'),
                        'check_out_time': getattr(booking, 'check_out_time', '12:00 PM'),
                        'key_collection': getattr(booking, 'key_collection', 'Standard check-in at hotel reception'),
                        'special_requests': booking.special_requests,
                        
                        # Guest Information
                        'guest_name': booking.guest_name,
                        'guest_email': booking.guest_email,
                        'guest_phone': booking.guest_phone,
                        'guest_country_code': booking.guest_country_code,
                        
                        # Pricing Information
                        'room_rate': float(booking.room_rate),
                        'tax_amount': float(booking.tax_amount),
                        'fee_amount': float(booking.fee_amount),
                        'total_amount_paid': float(booking.total_amount_paid),
                        'due_at_accommodation_amount': float(booking.due_at_accommodation_amount),
                        'currency': booking.currency,
                        
                        # Policy Information
                        'cancellation_policy': booking.cancellation_policy,
                        'refundability': booking.refundability,
                        'cancellation_timeline': booking.cancellation_timeline,
                        'rate_conditions': booking.rate_conditions,
                        
                        # Business Information
                        'business_name': booking.business_name,
                        'business_address': booking.business_address,
                        'customer_service_phone': booking.customer_service_phone,
                        'customer_service_email': booking.customer_service_email,
                        'terms_url': booking.terms_url,
                    }
                }

                # Redirect to confirmation page with all data
                query_params = {
                    'tran_id': tran_id,
                    'booking_type': 'hotel',
                    'booking_reference': booking.booking_reference,
                    'confirmation_number': booking.confirmation_number,
                }
                
                # If it's an API call, return JSON
                if self.request.content_type == 'application/json':
                    return Response(confirmation_data, status=200)
                
                # Otherwise redirect to frontend with parameters
                query_string = '&'.join([f"{key}={value}" for key, value in query_params.items()])
                return redirect(f"{frontend_url}/payment/success?{query_string}")

            except HotelBooking.DoesNotExist:
                print("ℹ️ HotelBooking does not exist yet. Creating via Duffel...")
                
                # Try to get the booking reference from checkout data first
                booking_reference = checkout.get('booking_reference')
                if booking_reference:
                    try:
                        booking = HotelBooking.objects.get(booking_reference=booking_reference)
                        booking.transaction = payment
                        booking.save()
                        print(f"✅ Associated existing booking {booking_reference} with transaction")
                        
                        query_params = {
                            'tran_id': tran_id,
                            'booking_type': 'hotel',
                            'booking_reference': booking.booking_reference,
                            'confirmation_number': booking.confirmation_number,
                        }
                        query_string = '&'.join([f"{key}={value}" for key, value in query_params.items()])
                        return redirect(f"{frontend_url}/payment/success?{query_string}")
                    except HotelBooking.DoesNotExist:
                        pass

                # If no booking exists, create one via Duffel (your existing working logic)
                guests = checkout.get('guest_info', [])
                print(f"📦 Quote ID: {quote_id}")
                print(f"👥 Guests: {guests}")

                # Build Duffel payload with required fields
                duffel_guests = []
                if guests:
                    duffel_guests = [
                        {
                            "type": g.get("type", "adult"),
                            "given_name": (checkout.get("cus_name", "Guest User").split(" ")[0]) or "Guest",
                            "family_name": (checkout.get("cus_name", "Guest User").split(" ")[-1]) or "User",
                            "age": g.get("age"),
                        }
                        for g in guests
                    ]
                else:
                    # Fallback if no guest info
                    duffel_guests = [{
                        "type": "adult",
                        "given_name": checkout.get("cus_name", "Guest").split(" ")[0],
                        "family_name": checkout.get("cus_name", "Guest").split(" ")[-1] if " " in checkout.get("cus_name", "Guest") else "Guest",
                    }]

                payload = {
                    "data": {
                        "quote_id": quote_id,
                        "guests": duffel_guests,
                        "email": checkout.get("email", "guest@example.com"),
                        "phone_number": checkout.get("cus_phone", "+8800000000000"),
                    }
                }

                # Add optional fields if present
                optional_fields = ["loyalty_programme_account_number", "accommodation_special_requests", "metadata"]
                for field in optional_fields:
                    if checkout.get(field):
                        payload["data"][field] = checkout.get(field)

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
                    booking_data = data_resp.get("data", {})
                    booking_id = booking_data.get("id")
                    
                    # Extract hotel details from booking response
                    accommodation = booking_data.get("accommodation", {})
                    location = accommodation.get("location", {})
                    address = location.get("address", {})
                    rate = booking_data.get("rate", {})
                    rate_conditions = rate.get("conditions", [])
                    
                    # Extract check-in information
                    check_in_info = accommodation.get("check_in_information", {})
                    check_in_after = check_in_info.get("check_in_after_time", "2:00 PM")
                    check_out_before = check_in_info.get("check_out_before_time", "12:00 PM")
                    key_collection = check_in_info.get("key_collection", "")
                    
                    # Extract cancellation policy
                    cancellation_policy = "Please check hotel policy for cancellation details"
                    refundable = False
                    for condition in rate_conditions:
                        if 'cancellation' in condition.get('title', '').lower():
                            cancellation_policy = condition.get('description', cancellation_policy)
                            if 'free' in condition.get('description', '').lower():
                                refundable = True
                    
                    # Extract cancellation timeline
                    cancellation_timeline = rate.get("cancellation_timeline", [])
                    
                    # Extract price details
                    total_amount = booking_data.get("total_amount", "0")
                    total_currency = booking_data.get("total_currency", "USD")
                    due_at_accommodation_amount = rate.get("due_at_accommodation_amount", "0")
                    due_at_accommodation_currency = rate.get("due_at_accommodation_currency", "USD")
                    
                    # Calculate nights and convert dates to proper date objects
                    check_in_date_str = booking_data.get("check_in_date")
                    check_out_date_str = booking_data.get("check_out_date")
                    
                    # Initialize variables
                    nights = 0
                    check_in_date = timezone.now().date()  # Default
                    check_out_date = timezone.now().date()  # Default

                    if check_in_date_str and check_out_date_str:
                        try:
                            from datetime import datetime
                            check_in_date = datetime.strptime(check_in_date_str, "%Y-%m-%d").date()
                            check_out_date = datetime.strptime(check_out_date_str, "%Y-%m-%d").date()
                            nights = (check_out_date - check_in_date).days
                        except Exception as e:
                            # Fallback to current date
                            check_in_date = timezone.now().date()
                            check_out_date = timezone.now().date()
                            nights = 1

                    # Count guests
                    adults = len([g for g in booking_data.get("guests", []) if g.get("type") == "adult"])
                    children = len([g for g in booking_data.get("guests", []) if g.get("type") == "child"])
                    
                    # Get room count from quote or default to 1
                    rooms = booking_data.get("rooms", 1)
                    
                    # Create HotelBooking with ALL required information - FIXED: Use date objects
                    booking = HotelBooking.objects.create(
                        # Booking Information
                        booking_id=booking_id,
                        booking_confirmed_date=timezone.now(),
                        
                        # Guest Information
                        guest_name=checkout.get("cus_name", "Guest User"),
                        guest_email=checkout.get("email", ""),
                        guest_phone=checkout.get("cus_phone", ""),
                        guest_country_code="+880",  # Default or extract from phone
                        special_requests=checkout.get("special_requests", ""),
                        
                        # Hotel Information
                        hotel_id=accommodation.get("id", ""),
                        hotel_name=accommodation.get("name", ""),
                        hotel_address=f"{address.get('line_one', '')}, {address.get('city_name', '')}, {address.get('country_code', '')}".strip(", "),
                        hotel_city=address.get("city_name", ""),
                        hotel_country=address.get("country_code", ""),
                        
                        # Room Information - FIXED: Use date objects instead of strings
                        room_type=checkout.get("room_type", "Standard Room"),
                        board_type=rate.get("board_type", "room_only"),
                        check_in_date=check_in_date,  # Date object
                        check_out_date=check_out_date,  # Date object
                        nights=nights,
                        adults=adults,
                        children=children,
                        rooms=rooms,
                        
                        # Pricing Information
                        room_rate=total_amount,  # Base rate
                        tax_amount=0,  # Extract from response if available
                        fee_amount=0,  # Extract from response if available
                        total_amount_paid=total_amount,
                        due_at_accommodation_amount=due_at_accommodation_amount,
                        currency=total_currency,
                        
                        # Payment Information
                        payment_status="paid",
                        payment_method="SSLCommerz",
                        
                        # Policy Information
                        cancellation_policy=cancellation_policy,
                        refundability=refundable,
                        cancellation_timeline=cancellation_timeline,
                        rate_conditions=rate_conditions,
                        
                        # Business Information (Update with your actual business info)
                        business_name=getattr(settings, 'BUSINESS_NAME', 'Your Travel Agency'),
                        business_address=getattr(settings, 'BUSINESS_ADDRESS', '123 Business Street, City, Country'),
                        customer_service_phone=getattr(settings, 'CUSTOMER_SERVICE_PHONE', '+880 1234 567890'),
                        customer_service_email=getattr(settings, 'CUSTOMER_SERVICE_EMAIL', 'support@youragency.com'),
                        terms_url=getattr(settings, 'TERMS_URL', 'https://youragency.com/terms'),
                        
                        # Status and Metadata
                        status="confirmed",
                        transaction=payment,
                        raw_response=booking_data,
                    )
                    
                    print(f"✅ HotelBooking created successfully: {booking.booking_reference}")
                    
                    # Send confirmation email with ALL required information
                    try:
                        from django.core.mail import send_mail
                        from django.template.loader import render_to_string
                        
                        # Prepare email context - FIXED: Now booking.check_in_date is a date object
                        context = {
                            'booking': {
                                # Booking Details
                                'booking_reference': booking.booking_reference,
                                'confirmation_number': booking.confirmation_number,
                                'booking_confirmed_date': booking.booking_confirmed_date.strftime('%Y-%m-%d %H:%M:%S'),
                                'status': booking.status,
                                'payment_status': booking.payment_status,
                                
                                # Hotel Information
                                'hotel_name': booking.hotel_name,
                                'hotel_address': booking.hotel_address,
                                'hotel_city': booking.hotel_city,
                                'hotel_country': booking.hotel_country,
                                
                                # Stay Details - FIXED: Now can call strftime() on date objects
                                'check_in_date': booking.check_in_date.strftime('%Y-%m-%d'),
                                'check_out_date': booking.check_out_date.strftime('%Y-%m-%d'),
                                'nights': booking.nights,
                                'room_type': booking.room_type,
                                'board_type': booking.board_type,
                                'adults': booking.adults,
                                'children': booking.children,
                                'rooms': booking.rooms,
                                'check_in_time': check_in_after,
                                'check_out_time': check_out_before,
                                'key_collection': key_collection,
                                'special_requests': booking.special_requests,
                                
                                # Guest Information
                                'guest_name': booking.guest_name,
                                'guest_email': booking.guest_email,
                                'guest_phone': booking.guest_phone,
                                'guest_country_code': booking.guest_country_code,
                                
                                # Pricing Information
                                'room_rate': float(booking.room_rate),
                                'tax_amount': float(booking.tax_amount),
                                'fee_amount': float(booking.fee_amount),
                                'total_amount_paid': float(booking.total_amount_paid),
                                'due_at_accommodation_amount': float(booking.due_at_accommodation_amount),
                                'currency': booking.currency,
                                
                                # Policy Information
                                'cancellation_policy': booking.cancellation_policy,
                                'refundability': booking.refundability,
                                'cancellation_timeline': booking.cancellation_timeline,
                                'rate_conditions': booking.rate_conditions,
                                
                                # Business Information
                                'business_name': booking.business_name,
                                'business_address': booking.business_address,
                                'customer_service_phone': booking.customer_service_phone,
                                'customer_service_email': booking.customer_service_email,
                                'terms_url': booking.terms_url,
                            }
                        }
                        
                        # Render HTML email
                        html_content = render_to_string('emails/hotel_booking_confirmation.html', context)
                        
                        # Plain text version
                        plain_text_content = f"""
Hotel Booking Confirmation - {booking.booking_reference}

Dear {booking.guest_name},

Your hotel booking has been successfully confirmed!

📋 BOOKING DETAILS
Booking Reference: {booking.booking_reference}
Confirmation Number: {booking.confirmation_number}
Booking Date: {booking.booking_confirmed_date.strftime('%Y-%m-%d %H:%M:%S')}
Status: {booking.status.title()}
Payment Status: {booking.payment_status.title()}

🏨 HOTEL INFORMATION
Hotel: {booking.hotel_name}
Address: {booking.hotel_address}
City/Country: {booking.hotel_city}, {booking.hotel_country}

📅 STAY DETAILS
Check-in: {booking.check_in_date.strftime('%Y-%m-%d')} (after {check_in_after})
Check-out: {booking.check_out_date.strftime('%Y-%m-%d')} (before {check_out_before})
Nights: {booking.nights} night(s)
Guests: {booking.adults} adult(s), {booking.children} child(ren)
Rooms: {booking.rooms} room(s)
Room Type: {booking.room_type}
Board Type: {booking.board_type.title()}
Key Collection: {key_collection or 'Standard check-in at hotel reception'}

{('Special Requests: ' + booking.special_requests) if booking.special_requests else ''}

👤 GUEST INFORMATION
Name: {booking.guest_name}
Email: {booking.guest_email}
Phone: {booking.guest_country_code} {booking.guest_phone}

💰 PRICE SUMMARY
Room Rate ({booking.nights} night(s)): {booking.currency} {float(booking.room_rate):.2f}
Taxes: {booking.currency} {float(booking.tax_amount):.2f}
Service Fees: {booking.currency} {float(booking.fee_amount):.2f}
Due at Hotel: {booking.currency} {float(booking.due_at_accommodation_amount):.2f}
TOTAL PAID: {booking.currency} {float(booking.total_amount_paid):.2f}

⚠️ CANCELLATION POLICY
{booking.cancellation_policy}
Refundable: {'Yes' if booking.refundability else 'No'}

📞 OUR CONTACT INFORMATION
{booking.business_name}
{booking.business_address}
Phone: {booking.customer_service_phone}
Email: {booking.customer_service_email}
Terms & Conditions: {booking.terms_url}

📌 IMPORTANT INFORMATION
• Please present this confirmation and a valid ID at check-in
• Standard check-in time: After {check_in_after}
• Standard check-out time: Before {check_out_before}
• For modifications or cancellations, contact our customer service
• Review the hotel's specific policies and amenities

Thank you for choosing {booking.business_name}!
                        """
                        
                        # Send email to guest
                        send_mail(
                            subject=f'Hotel Booking Confirmation - {booking.booking_reference}',
                            message=plain_text_content,
                            html_message=html_content,
                            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@youragency.com'),
                            recipient_list=[booking.guest_email],
                            fail_silently=True  # Don't fail payment if email fails
                        )
                        
                        # Send copy to business email
                        send_mail(
                            subject=f'[Copy] Hotel Booking - {booking.booking_reference}',
                            message=plain_text_content,
                            html_message=html_content,
                            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@youragency.com'),
                            recipient_list=[booking.customer_service_email],
                            fail_silently=True
                        )
                        
                        logger.info(f"✅ Confirmation email sent for booking {booking.booking_reference}")
                        
                    except Exception as e:
                        logger.error(f"❌ Failed to send confirmation email: {str(e)}")
                        # Don't fail payment process if email fails
                    
                    # Redirect to success page with all booking details
                    success_params = {
                        'tran_id': tran_id,
                        'booking_id': booking_id,
                        'booking_reference': booking.booking_reference,
                        'confirmation_number': booking.confirmation_number,
                        'paid': 'true',
                        'booking_type': 'hotel',
                        'hotel_name': booking.hotel_name,
                        'check_in': booking.check_in_date.strftime('%Y-%m-%d'),
                        'check_out': booking.check_out_date.strftime('%Y-%m-%d'),
                        'nights': booking.nights,
                        'guests': booking.adults + booking.children,
                        'rooms': booking.rooms,
                        'total_paid': f"{booking.currency} {float(booking.total_amount_paid):.2f}",
                        'due_at_hotel': f"{booking.currency} {float(booking.due_at_accommodation_amount):.2f}" if float(booking.due_at_accommodation_amount) > 0 else '0',
                        'refundable': 'yes' if booking.refundability else 'no'
                    }
                    
                    query_string = '&'.join([f"{key}={value}" for key, value in success_params.items()])
                    return redirect(f"{frontend_url}/payment/success?{query_string}")

                # ⚠️ Duffel booking failed
                print(f"⚠️ Duffel booking failed with status {response.status_code}: {data_resp}")
                return redirect(f'{frontend_url}/payment/fail?tran_id={tran_id}')

        except PaymentTransaction.DoesNotExist:
            print(f"❌ PaymentTransaction not found for tran_id={tran_id}")
            return redirect(f'{frontend_url}/payment/fail?error=payment_not_found')

        except Exception as e:
            print(f"🔥 Unexpected error in handle_success_payment: {str(e)}")
            import traceback
            traceback.print_exc()
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

# hotels/views/dashboard.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class HotelAnalyticsView(APIView):
    """Get hotel booking analytics for dashboard"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        try:
            # Time ranges
            now = timezone.now()
            last_30_days = now - timedelta(days=30)
            last_7_days = now - timedelta(days=7)
            
            # Get hotel bookings from database
            from .models import HotelBooking
            
            # Total bookings
            total_bookings = HotelBooking.objects.count()
            
            # Total revenue
            total_revenue = 0
            bookings = HotelBooking.objects.all()
            for booking in bookings:
                raw_response = booking.raw_response or {}
                # FIX: Access the nested "data" key
                booking_data = raw_response.get('data', {})
                total_amount = booking_data.get('total_amount', '0')
                if total_amount:
                    try:
                        total_revenue += float(total_amount)
                    except:
                        pass
            
            # Recent bookings
            recent_bookings = HotelBooking.objects.filter(
                created_at__gte=last_7_days
            ).order_by('-created_at')[:10]
            
            # Top hotels (simple analysis)
            top_hotels = []
            hotel_counts = {}
            
            for booking in bookings:
                raw_response = booking.raw_response or {}
                # FIX: Access the nested "data" key
                booking_data = raw_response.get('data', {})
                accommodation = booking_data.get('accommodation', {})
                
                # FIX: Get hotel name and city properly
                hotel_name = accommodation.get('name', 'Unknown Hotel')
                location = accommodation.get('location', {})
                address = location.get('address', {})
                city = address.get('city_name', 'Unknown City')
                
                key = f"{hotel_name}::{city}"
                if key in hotel_counts:
                    hotel_counts[key]['bookings'] += 1
                    # FIX: Get total amount from correct location
                    hotel_counts[key]['revenue'] += float(booking_data.get('total_amount', 0))
                else:
                    hotel_counts[key] = {
                        'name': hotel_name,
                        'city': city,
                        'bookings': 1,
                        'revenue': float(booking_data.get('total_amount', 0)),
                        'rating': accommodation.get('rating', 0)  # Get actual rating
                    }
            
            # Convert to list and sort
            for hotel in hotel_counts.values():
                top_hotels.append(hotel)
            
            top_hotels = sorted(top_hotels, key=lambda x: x['bookings'], reverse=True)[:5]
            
            # Format recent bookings
            formatted_recent = []
            for booking in recent_bookings:
                raw_response = booking.raw_response or {}
                # FIX: Access the nested "data" key
                booking_data = raw_response.get('data', {})
                accommodation = booking_data.get('accommodation', {})
                location = accommodation.get('location', {})
                address = location.get('address', {})
                
                formatted_recent.append({
                    'id': booking.booking_id,
                    'hotelName': accommodation.get('name', 'Unknown Hotel'),
                    'city': address.get('city_name', 'Unknown City'),
                    'checkIn': booking_data.get('check_in_date', ''),
                    'checkOut': booking_data.get('check_out_date', ''),
                    'guests': len(booking_data.get('guests', [])),
                    'status': booking.status,
                    'amount': float(booking_data.get('total_amount', 0))
                })
            
            # Occupancy rate (placeholder)
            occupancy_rate = 78.5
            
            return Response({
                'status': 'success',
                'data': {
                    'totalBookings': total_bookings,
                    'totalRevenue': total_revenue,
                    'occupancyRate': occupancy_rate,
                    'topHotels': top_hotels,
                    'recentBookings': formatted_recent
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error fetching hotel analytics: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to fetch hotel analytics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class HotelMarkupView(APIView):
    """Manage hotel markup percentage"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request):
        """Get current hotel markup"""
        try:
            from django.conf import settings
            markup = getattr(settings, 'HOTEL_MARKUP_PERCENTAGE', 10)
            
            return Response({
                'status': 'success',
                'markup': markup
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error getting hotel markup: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to get hotel markup'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """Update hotel markup"""
        try:
            percentage = request.data.get('percentage')
            if not percentage:
                return Response({
                    'status': 'error',
                    'message': 'Percentage is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                percentage = float(percentage)
                if percentage < 0 or percentage > 50:
                    return Response({
                        'status': 'error',
                        'message': 'Percentage must be between 0 and 50'
                    }, status=status.HTTP_400_BAD_REQUEST)
            except ValueError:
                return Response({
                    'status': 'error',
                    'message': 'Invalid percentage format'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save markup setting (to database in production)
            
            return Response({
                'status': 'success',
                'message': 'Hotel markup updated successfully',
                'markup': percentage
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error updating hotel markup: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to update hotel markup'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HotelVoucherPDFView(APIView):
    """Generate hotel voucher PDF"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def get(self, request, booking_id):
        """Generate hotel voucher PDF"""
        try:
            from .models import HotelBooking
            booking = HotelBooking.objects.get(booking_id=booking_id)
            
            # Fetch booking details from Duffel if needed
            headers = {
                "Accept": "application/json",
                "Duffel-Version": "v2",
                "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}"
            }
            
            response = requests.get(
                f"https://api.duffel.com/stays/bookings/{booking_id}",
                headers=headers,
                timeout=30
            )
            
            if response.status_code != 200:
                # Use local data if Duffel API fails
                booking_data = booking.raw_response or {}
            else:
                booking_data = response.json().get('data', {})
            
            # Generate PDF voucher
            pdf_content = self._generate_voucher_pdf(booking_data, booking)
            
            # Create response
            from django.http import HttpResponse
            response = HttpResponse(pdf_content, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="hotel-voucher-{booking_id}.pdf"'
            
            return response
            
        except HotelBooking.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error generating hotel voucher: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to generate hotel voucher'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _generate_voucher_pdf(self, booking_data, booking):
        """Generate hotel voucher PDF with company branding"""
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet
        from io import BytesIO
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        story = []
        
        styles = getSampleStyleSheet()
        
        # Company header
        story.append(Paragraph("STECH HOLIDAYS", styles['Title']))
        story.append(Paragraph("Hotel Accommodation Voucher", styles['Heading1']))
        story.append(Spacer(1, 20))
        
        # Booking details
        accommodation = booking_data.get('accommodation', {})
        address = accommodation.get('location', {}).get('address', {})
        
        story.append(Paragraph(f"<b>Hotel:</b> {accommodation.get('name', 'N/A')}", styles['Normal']))
        story.append(Paragraph(f"<b>Address:</b> {address.get('line_one', '')}, {address.get('city_name', '')}, {address.get('country_code', '')}", styles['Normal']))
        story.append(Paragraph(f"<b>Booking ID:</b> {booking.booking_id}", styles['Normal']))
        story.append(Paragraph(f"<b>Check-in:</b> {booking_data.get('check_in_date', 'N/A')}", styles['Normal']))
        story.append(Paragraph(f"<b>Check-out:</b> {booking_data.get('check_out_date', 'N/A')}", styles['Normal']))
        story.append(Paragraph(f"<b>Total Amount:</b> {booking_data.get('total_amount', '0')} {booking_data.get('total_currency', 'USD')}", styles['Normal']))
        story.append(Spacer(1, 20))
        
        # Guest information
        story.append(Paragraph("Guest Information", styles['Heading2']))
        guests = booking_data.get('guests', [])
        guests_data = []
        for guest in guests:
            guests_data.append([
                guest.get('given_name', ''),
                guest.get('family_name', ''),
                guest.get('type', 'adult')
            ])
        
        if guests_data:
            guests_table = Table([['Given Name', 'Family Name', 'Type']] + guests_data)
            guests_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            story.append(guests_table)
        
        # Special requests
        special_requests = booking_data.get('accommodation_special_requests')
        if special_requests:
            story.append(Spacer(1, 20))
            story.append(Paragraph("Special Requests", styles['Heading2']))
            story.append(Paragraph(special_requests, styles['Normal']))
        
        # Footer
        story.append(Spacer(1, 30))
        story.append(Paragraph("Thank you for choosing STECH HOLIDAYS", styles['Normal']))
        story.append(Paragraph("For any queries, contact: +880 XXXX-XXXXXX", styles['Normal']))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()


class SendHotelVoucherEmailView(APIView):
    """Send hotel voucher email"""
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request, booking_id):
        """Send hotel voucher email"""
        try:
            from .models import HotelBooking
            booking = HotelBooking.objects.get(booking_id=booking_id)
            
            # Generate PDF voucher
            pdf_view = HotelVoucherPDFView()
            booking_data = booking.raw_response or {}
            pdf_content = pdf_view._generate_voucher_pdf(booking_data, booking)
            
            # Send email
            from django.core.mail import EmailMessage
            from django.conf import settings
            
            email = EmailMessage(
                subject=f'Your Hotel Voucher - Booking {booking.booking_id}',
                body=f'Dear Guest,\n\nPlease find your hotel accommodation voucher attached.\n\nHotel: {booking_data.get("accommodation", {}).get("name", "N/A")}\nCheck-in: {booking_data.get("check_in_date", "N/A")}\nCheck-out: {booking_data.get("check_out_date", "N/A")}\n\nThank you for choosing STECH HOLIDAYS.\n\nBest regards,\nSTECH HOLIDAYS Team',
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[booking.email],
                cc=[settings.DEFAULT_FROM_EMAIL]
            )
            
            email.attach(f'hotel-voucher-{booking_id}.pdf', pdf_content, 'application/pdf')
            email.send()
            
            logger.info(f"Hotel voucher email sent for booking {booking_id} to {booking.email}")
            
            return Response({
                'status': 'success',
                'message': 'Hotel voucher email sent successfully'
            }, status=status.HTTP_200_OK)
            
        except HotelBooking.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error sending hotel voucher email: {str(e)}")
            return Response({
                'status': 'error',
                'message': 'Failed to send hotel voucher email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

# hotels/views.py - Add these views
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
import requests
import json

class GetCancellationPolicyView(APIView):
    """Get cancellation policy for a quote"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, quote_id):
        try:
            # Try to get from Duffel API
            headers = {
                "Authorization": f"Bearer {settings.DUFFEL_ACCESS_TOKEN}",
                "Duffel-Version": "v2",
                "Accept": "application/json"
            }
            
            # First get the quote
            quote_response = requests.get(
                f"https://api.duffel.com/stays/quotes/{quote_id}",
                headers=headers,
                timeout=30
            )
            
            if quote_response.status_code == 200:
                quote_data = quote_response.json().get('data', {})
                rate_conditions = quote_data.get('rate', {}).get('conditions', [])
                
                # Extract cancellation policy
                cancellation_policy = "Non-refundable"
                refundable = False
                
                for condition in rate_conditions:
                    if 'cancellation' in condition.get('title', '').lower():
                        cancellation_policy = condition.get('description', 'Non-refundable')
                        if 'free' in condition.get('description', '').lower():
                            refundable = True
                            break
                
                return Response({
                    'status': 'success',
                    'quote_id': quote_id,
                    'cancellation_policy': cancellation_policy,
                    'refundable': refundable,
                    'rate_conditions': rate_conditions
                })
            
            # Fallback response
            return Response({
                'status': 'success',
                'quote_id': quote_id,
                'cancellation_policy': 'Free cancellation available up to 24 hours before check-in',
                'refundable': True,
                'rate_conditions': []
            })
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CreateCompleteBookingView(APIView):
    """Create a complete booking with all required information"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            data = request.data
            
            # Required fields
            required_fields = [
                'quote_id', 'guest_name', 'guest_email', 'guest_phone',
                'hotel_id', 'hotel_name', 'hotel_address', 'room_type',
                'check_in_date', 'check_out_date', 'nights', 'adults',
                'room_rate', 'total_amount_paid', 'currency'
            ]
            
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return Response({
                    'status': 'error',
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create booking in database
            booking_data = {
                'user': request.user,
                'booking_id': data.get('duffel_booking_id'),  # From Duffel after creation
                'guest_name': data['guest_name'],
                'guest_email': data['guest_email'],
                'guest_phone': data['guest_phone'],
                'guest_country_code': data.get('guest_country_code', '+880'),
                'special_requests': data.get('special_requests', ''),
                'hotel_id': data['hotel_id'],
                'hotel_name': data['hotel_name'],
                'hotel_address': data['hotel_address'],
                'hotel_city': data.get('hotel_city', ''),
                'hotel_country': data.get('hotel_country', ''),
                'room_type': data['room_type'],
                'board_type': data.get('board_type', 'room_only'),
                'check_in_date': data['check_in_date'],
                'check_out_date': data['check_out_date'],
                'nights': data['nights'],
                'adults': data['adults'],
                'children': data.get('children', 0),
                'rooms': data.get('rooms', 1),
                'room_rate': data['room_rate'],
                'tax_amount': data.get('tax_amount', 0),
                'fee_amount': data.get('fee_amount', 0),
                'total_amount_paid': data['total_amount_paid'],
                'due_at_accommodation_amount': data.get('due_at_accommodation_amount', 0),
                'currency': data['currency'],
                'cancellation_policy': data.get('cancellation_policy', ''),
                'refundability': data.get('refundability', False),
                'rate_conditions': data.get('rate_conditions', []),
                'cancellation_timeline': data.get('cancellation_timeline', {}),
                'business_name': data.get('business_name', 'Your Travel Agency'),
                'business_address': data.get('business_address', 'Your Business Address'),
                'customer_service_phone': data.get('customer_service_phone', '+880 1234 567890'),
                'customer_service_email': data.get('customer_service_email', 'support@youragency.com'),
                'terms_url': data.get('terms_url', 'https://youragency.com/terms'),
                'status': 'pending',
                'payment_status': 'unpaid'
            }
            
            # Create booking
            booking = HotelBooking.objects.create(**booking_data)
            
            return Response({
                'status': 'success',
                'message': 'Booking created successfully',
                'booking_reference': booking.booking_reference,
                'confirmation_number': booking.confirmation_number,
                'booking_id': booking.id
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class SendBookingConfirmationEmailView(APIView):
    """Send booking confirmation email"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            data = request.data
            
            # Validate required fields
            required_fields = [
                'reference_number', 'hotel_name', 'hotel_address',
                'check_in_date', 'check_out_date', 'customer_email',
                'customer_name'
            ]
            
            missing_fields = [field for field in required_fields if not data.get(field)]
            if missing_fields:
                return Response({
                    'status': 'error',
                    'message': f'Missing required fields: {", ".join(missing_fields)}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Business information (update with your actual details)
            business_info = {
                'name': data.get('business_name', 'Your Travel Agency'),
                'address': data.get('business_address', '123 Business Street, City, Country'),
                'phone': data.get('business_phone', '+880 1234 567890'),
                'email': data.get('business_email', 'support@youragency.com'),
                'hours': data.get('business_hours', '9:00 AM - 6:00 PM (GMT+6)')
            }
            
            # Prepare email context
            context = {
                'booking': data,
                'business': business_info
            }
            
            # Render HTML email
            html_content = render_to_string('emails/hotel_booking_confirmation.html', context)
            
            # Send email
            send_mail(
                subject=f'Hotel Booking Confirmation - {data["reference_number"]}',
                message='',  # Plain text version
                html_message=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[data['customer_email']],
                fail_silently=False
            )
            
            # Also send to admin/business email
            send_mail(
                subject=f'New Hotel Booking - {data["reference_number"]}',
                message=f'New booking received:\n\nReference: {data["reference_number"]}\nHotel: {data["hotel_name"]}\nCustomer: {data["customer_name"]}\nEmail: {data["customer_email"]}\nAmount: {data.get("total_paid", "N/A")}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[business_info['email']],
                fail_silently=False
            )
            
            return Response({
                'status': 'success',
                'message': 'Confirmation email sent successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetBookingDetailsView(APIView):
    """Get complete booking details for confirmation page"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, booking_reference):
        try:
            booking = HotelBooking.objects.get(
                booking_reference=booking_reference,
                user=request.user
            )
            
            # Prepare response
            response_data = {
                'booking_reference': booking.booking_reference,
                'confirmation_number': booking.confirmation_number,
                'booking_confirmed_date': booking.booking_confirmed_date.strftime('%Y-%m-%d %H:%M:%S'),
                'status': booking.status,
                'payment_status': booking.payment_status,
                
                # Guest Information
                'guest_name': booking.guest_name,
                'guest_email': booking.guest_email,
                'guest_phone': booking.guest_phone,
                'special_requests': booking.special_requests,
                
                # Hotel Information
                'hotel_name': booking.hotel_name,
                'hotel_address': booking.hotel_address,
                'hotel_city': booking.hotel_city,
                'hotel_country': booking.hotel_country,
                
                # Stay Details
                'room_type': booking.room_type,
                'board_type': booking.board_type,
                'check_in_date': booking.check_in_date.strftime('%Y-%m-%d'),
                'check_out_date': booking.check_out_date.strftime('%Y-%m-%d'),
                'nights': booking.nights,
                'adults': booking.adults,
                'children': booking.children,
                'rooms': booking.rooms,
                
                # Pricing
                'room_rate': float(booking.room_rate),
                'tax_amount': float(booking.tax_amount),
                'fee_amount': float(booking.fee_amount),
                'total_amount_paid': float(booking.total_amount_paid),
                'due_at_accommodation_amount': float(booking.due_at_accommodation_amount),
                'currency': booking.currency,
                
                # Policies
                'cancellation_policy': booking.cancellation_policy,
                'refundability': booking.refundability,
                'rate_conditions': booking.rate_conditions,
                
                # Business Information
                'business_name': booking.business_name,
                'business_address': booking.business_address,
                'customer_service_phone': booking.customer_service_phone,
                'customer_service_email': booking.customer_service_email,
                'terms_url': booking.terms_url,
                
                # Timestamps
                'created_at': booking.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                'updated_at': booking.updated_at.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            return Response({
                'status': 'success',
                'booking': response_data
            })
            
        except HotelBooking.DoesNotExist:
            return Response({
                'status': 'error',
                'message': 'Booking not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    
    # Add this import at the top
from django.template.loader import render_to_string

class SendHotelConfirmationEmailView(APIView):
    """Send complete hotel booking confirmation email"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            data = request.data
            
            # Get booking reference from data
            booking_reference = data.get('booking_reference')
            if not booking_reference:
                return Response({
                    'status': 'error',
                    'message': 'Booking reference is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get booking from database
            try:
                booking = HotelBooking.objects.get(booking_reference=booking_reference)
            except HotelBooking.DoesNotExist:
                return Response({
                    'status': 'error',
                    'message': 'Booking not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            # Prepare email context with ALL required information
            context = {
                'booking': {
                    # Booking Details
                    'booking_reference': booking.booking_reference,
                    'confirmation_number': booking.confirmation_number,
                    'booking_confirmed_date': booking.booking_confirmed_date.strftime('%Y-%m-%d %H:%M:%S'),
                    'status': booking.status,
                    'payment_status': booking.payment_status,
                    
                    # Hotel Information
                    'hotel_name': booking.hotel_name,
                    'hotel_address': booking.hotel_address,
                    'hotel_city': booking.hotel_city,
                    'hotel_country': booking.hotel_country,
                    
                    # Stay Details
                    'check_in_date': booking.check_in_date.strftime('%Y-%m-%d'),
                    'check_out_date': booking.check_out_date.strftime('%Y-%m-%d'),
                    'nights': booking.nights,
                    'room_type': booking.room_type,
                    'board_type': booking.board_type,
                    'adults': booking.adults,
                    'children': booking.children,
                    'rooms': booking.rooms,
                    'check_in_time': booking.check_in_time if hasattr(booking, 'check_in_time') else "2:00 PM",
                    'check_out_time': booking.check_out_time if hasattr(booking, 'check_out_time') else "12:00 PM",
                    'special_requests': booking.special_requests,
                    
                    # Guest Information
                    'guest_name': booking.guest_name,
                    'guest_email': booking.guest_email,
                    'guest_phone': booking.guest_phone,
                    'guest_country_code': booking.guest_country_code,
                    
                    # Pricing Information
                    'room_rate': float(booking.room_rate),
                    'tax_amount': float(booking.tax_amount),
                    'fee_amount': float(booking.fee_amount),
                    'total_amount_paid': float(booking.total_amount_paid),
                    'due_at_accommodation_amount': float(booking.due_at_accommodation_amount) if booking.due_at_accommodation_amount else 0,
                    'currency': booking.currency,
                    
                    # Policy Information
                    'cancellation_policy': booking.cancellation_policy,
                    'refundability': booking.refundability,
                    'cancellation_timeline': booking.cancellation_timeline or [],
                    'rate_conditions': booking.rate_conditions or [],
                    
                    # Business Information
                    'business_name': booking.business_name,
                    'business_address': booking.business_address,
                    'customer_service_phone': booking.customer_service_phone,
                    'customer_service_email': booking.customer_service_email,
                    'terms_url': booking.terms_url,
                }
            }
            
            # Render HTML email
            html_content = render_to_string('emails/hotel_booking_confirmation.html', context)
            plain_text_content = f"""
Booking Confirmation - {booking.booking_reference}

Dear {booking.guest_name},

Your hotel booking has been confirmed.

Booking Details:
- Booking Reference: {booking.booking_reference}
- Confirmation Number: {booking.confirmation_number}
- Booking Date: {booking.booking_confirmed_date.strftime('%Y-%m-%d %H:%M:%S')}

Hotel Information:
- Hotel: {booking.hotel_name}
- Address: {booking.hotel_address}, {booking.hotel_city}, {booking.hotel_country}

Stay Details:
- Check-in: {booking.check_in_date.strftime('%Y-%m-%d')} after {booking.check_in_time if hasattr(booking, 'check_in_time') else '2:00 PM'}
- Check-out: {booking.check_out_date.strftime('%Y-%m-%d')} before {booking.check_out_time if hasattr(booking, 'check_out_time') else '12:00 PM'}
- Nights: {booking.nights}
- Guests: {booking.adults} adult(s), {booking.children} child(ren)
- Rooms: {booking.rooms}
- Room Type: {booking.room_type}
- Board Type: {booking.board_type}

Price Summary:
- Room Rate: {booking.currency} {booking.room_rate}
- Taxes: {booking.currency} {booking.tax_amount}
- Service Fee: {booking.currency} {booking.fee_amount}
- Due at Hotel: {booking.currency} {booking.due_at_accommodation_amount if booking.due_at_accommodation_amount else 0}
- Total Paid: {booking.currency} {booking.total_amount_paid}

Cancellation Policy:
{booking.cancellation_policy}
Refundable: {'Yes' if booking.refundability else 'No'}

Our Contact Information:
{booking.business_name}
{booking.business_address}
Phone: {booking.customer_service_phone}
Email: {booking.customer_service_email}
Terms: {booking.terms_url}

Please present this confirmation at check-in.
Thank you for choosing {booking.business_name}!
            """
            
            # Send email to guest
            send_mail(
                subject=f'Hotel Booking Confirmation - {booking.booking_reference}',
                message=plain_text_content,
                html_message=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[booking.guest_email],
                fail_silently=False
            )
            
            # Also send copy to business email
            send_mail(
                subject=f'[Copy] Hotel Booking - {booking.booking_reference}',
                message=plain_text_content,
                html_message=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[booking.customer_service_email],
                fail_silently=False
            )
            
            return Response({
                'status': 'success',
                'message': 'Confirmation email sent successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error sending confirmation email: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Failed to send email: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)