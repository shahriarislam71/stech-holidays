

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
## 🔍 Hotels Search

### 📤 Request
**Get** `http://127.0.0.1:8000/api/hotels/offers/srr_id`
## One way:
Example Usage Flow
1. Search Accommodations
bash
POST /api/stays/search/
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
GET /api/stays/offers/{search_result_id}/
3. Create Quote
bash
POST /api/stays/quotes/
{
  "rate_id": "rat_0000BTVRuKZTavzrZDJ4cb"
}
4. Create Booking
bash
POST /api/stays/bookings/
{
  "quote_id": "quo_0000AS0NZdKjjnnHZmSUbI",
  "guests": [
    {
      "given_name": "John",
      "family_name": "Doe"
    }
  ],
  "email": "john.doe@example.com",
  "phone_number": "+441234567890",
  "loyalty_programme_account_number": "123456789"
}
5. Confirm Payment (if required)
bash
POST /api/stays/bookings/confirm-payment/
{
  "booking_id": "bok_0000BTVRuKZTavzrZDJ4cb",
  "payment_type": "balance"
}
This complete implementation provides the entire booking flow without using serializers or models, focusing purely on the view logic and URL routing.