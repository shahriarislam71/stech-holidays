

## 🔐 Authentication

Currently uses API key authentication. Include in request headers:

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

---

## 🔍 Hotels Search

### 📤 Request
**POST** `http://127.0.0.1:8000/api/hotels/search/`
## One way:
```json
backend/flights/apidocumentaion.mdre_type": "regular"
}
```
## ROUNDTRIP


```json

{
  "check_in_date": "2025-10-15",
  "check_out_date": "2025-10-18",
  "location_name": "Paris, France",
  "travelers": {"adults": 2, "children_ages": [7, 10]},
  "rooms": 1
}
```
## 🔍 Hotels Search

### 📤 Request
**Get** `http://127.0.0.1:8000/api/hotels/offers/srr_id`
## One way:
Example Usage Flow
1. Search Accommodations
bash
POST /api/hotels/search/
```json
{
    "check_in_date": "2025-10-15",
    "check_out_date": "2025-10-18",
    "location": {
        "geographic_coordinates": {
            "latitude": 51.5071,
            "longitude": -0.1416
        },
        "radius": 5
    },
    "travelers": {
        "adults": 2,
        "children_ages": [7, 10]
    },
    "rooms": 1,
    "free_cancellation_only": false,
    "mobile": false
}
```
```json

2. Get Hotel Offers
bash
GET /api/hotels/offers/{search_result_id}/
3. Create Quote
bash
POST /api/hotels/quotes/
{
  "rate_id": "rat_0000BTVRuKZTavzrZDJ4cb"
}
4. Create Booking
bash
{
  "quote_id": "quo_0000AytUYzHArTi1yu15a7",
 
  "guests": [
    {
      "given_name": "John",
      "family_name": "Doe"
    }
  ],
  "email": "john.doe@example.com",
  "phone_number": "+441234567890"
}

5. Confirm Payment (if required)
bash
POST /api/hotels/bookings/confirm-payment/
{
  "booking_id": "bok_0000BTVRuKZTavzrZDJ4cb",
  "payment_type": "balance"
}
This complete implementation provides the entire booking flow without using serializers or models, focusing purely on the view logic and URL routing.

6. {base_url}hotels/payments/initiate/
Request :
{
  "total_amount": 773.20,
  "currency": "GBP",
  "quote_id": "quo_0000Ayvt7Gv5nQ5fw5Ih0K",
  "email": "guest@example.com",
  "cus_name": "John Doe",
  "cus_phone": "+8801700000000",
  "cus_add1": "123 Main Street",
  "cus_add2": "Apartment 4B",
  "cus_city": "Dhaka",
  "cus_state": "Dhaka",
  "cus_postcode": "1207",
  "cus_country": "Bangladesh",
  "product_name": "Hotel Booking",
  "product_category": "Travel",
  "product_profile": "service",
  "shipping_method": "NO",
  "guest_info": [
    {"type": "adult", "age": null},
    {"type": "adult", "age": null},
    {"type": "child", "age": 5}
  ]
}
Resposne :

{"success":true,"tran_id":"TXN_DCFEBCB8F158","quote_id":"quo_0000Ayvt7Gv5nQ5fw5Ih0K","payment_url":"https://sandbox.sslcommerz.com/EasyCheckOut/testcde7eeedc497ded4511ed2988ca15a55c85"}
