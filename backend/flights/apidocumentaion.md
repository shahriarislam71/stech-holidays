# ✈️ Flights Booking API Documentation

> Modern, frontend-friendly API documentation for flight search and booking system

---

## 📋 Table of Contents
- [Authentication](#-authentication)
- [Flight Search](#-flight-search)
- [Flight Packages](#-flight-packages)
- [Package Selection](#-package-selection)
- [Order Management](#-order-management)
- [Payment Processing](#-payment-processing)
- [Error Handling](#-error-handling)
- [Frontend Integration Guide](#-frontend-integration-guide)

---

## 🔐 Authentication

Currently uses API key authentication. Include in request headers:

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```
 
---

## country Search 
**GET** `http://127.0.0.1:8000/api/flights/locations/?query=london`


## 🔍 Flight Search

### 📤 Request
**POST** `http://127.0.0.1:8000/api/flights/search/`
## One way:
```json
{
  "flight_type": "one_way",
  "origin": "LHR",
  "destination": "JFK",
  "departure_date": "2025-10-11",
  "travelers": {
    "adults": 2,
    "children": 1,
    "infants": 0
  },
  "cabin_class": "economy",
  "fare_type": "regular"
}

```
## ROUNDTRIP


```json
{
  "slices": [
    {
      "origin": "LHR",
      "destination": "JFK",
      "departure_date": "2025-10-01"
    },
        {
      "origin": "JFK",
      "destination": "LHR",
      "departure_date": "2025-10-01"
    }
  ],
  "return_date": "2025-10-10",
  "travelers": {
    "adults": 2,
    "children": 1,
    "infants": 0
  },
  "cabin_class": "economy",
  "fare_type": "regular"
}

```

## MULTICITY 
```json

```json
{
  "slices": [
    {
      "origin": "LHR",
      "destination": "JFK",
      "departure_date": "2025-10-01"
    },
    {
      "origin": "JFK",
      "destination": "LAX",
      "departure_date": "2025-10-02"
    },
    {
      "origin": "LAX",
      "destination": "LHR",
      "departure_date": "2025-10-03"
    }
  ],
  "travelers": {
    "adults": 2,
    "children": 1,
    "infants": 0
  },
  "cabin_class": "economy",
  "fare_type": "regular"
}
```



#### 🎯 Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `origin` | string | ✅ | IATA code (e.g., "DAC") |
| `destination` | string | ✅ | IATA code (e.g., "CXB") |
| `departure_date` | string | ✅ | YYYY-MM-DD format |
| `travelers.adults` | number | ✅ | Number of adult passengers |
| `travelers.children` | number | ❌ | Number of children |
| `travelers.infants` | number | ❌ | Number of infants |
| `cabin_class` | string | ✅ | "economy", "business", "first" |
| `fare_type` | string | ✅ | "regular", "flexible" |

### 📥 Response
**Status:** `200 OK`

```json
{
  "status": "success",
  "message": "Found 4 flight options",
  "search": {
    "route": {
      "from": {
        "code": "DAC",
        "name": "Dhaka Shahjalal International Airport",
        "city": "Dhaka Shahjalal International"
      },
      "to": {
        "code": "CXB",
        "name": "Cox's Bazar Airport",
        "city": "Cox's Bazar"
      }
    },
    "dates": {
      "departure": "2025-09-25",
      "return": null,
      "tripType": "one_way"
    },
    "travelers": {
      "adults": 1,
      "children": 0,
      "infants": 0,
      "total": 1
    },
    "preferences": {
      "cabinClass": "Economy",
      "fareType": "Regular"
    }
  },
  "results": {
    "total": 4,
    "sorting": "price_low_to_high",
    "itineraries": [
      {
        "id": "off_0000AyURPTT12z5Npu7Jpq",
        "totalPrice": "BDT 41",
        "priceAmount": 41.16,
        "totalDuration": "0h 59m",
        "airlines": ["Duffel Airways"],
        "tripType": "One-way",
        "summary": "6:34 PM DAC → 7:33 PM CXB • 0h 59m • 0 stops",
        "segments": [
          {
            "airline": "Duffel Airways",
            "flightNumber": "ZZ3878",
            "duration": "0h 59m",
            "stops": "Non-stop",
            "departure": {
              "time": "6:34 PM",
              "airportCode": "DAC",
              "airportName": "Dhaka Shahjalal International Airport"
            },
            "arrival": {
              "time": "7:33 PM",
              "airportCode": "CXB",
              "airportName": "Cox's Bazar Airport"
            },
            "layover": false
          }
        ],
        "travelers": 1,
        "cabinClass": "Economy",
        "fareType": "Regular"
      }
    ]
  },
  "filters": {
    "priceRange": {
      "min": 41.16,
      "max": 118.2,
      "currency": "BDT"
    },
    "airlines": ["Duffel Airways", "Biman Bangladesh Airlines"],
    "stops": ["non_stop", "1_stop", "2_plus_stops"],
    "durations": ["short", "medium", "long"]
  },
  "metadata": {
    "searchId": "orq_0000AyURPTHfjA0nGioG9Y",
    "timestamp": "2025-09-23T12:57:18.789632",
    "resultsCount": 4
  }
}
```
##  OFFER DETAILS:
**POST** `http://127.0.0.1:8000/api/flights/offers/off_0000AydqymoN4rzagIe07m/`
 
## RESPONSE ILCLUDE SEAT MAP , ITS WILL BE HUGE RESPONSE SO NOT PROVIDED :

---

## 📦 Flight Packages

### 📤 Request
**POST** `http://127.0.0.1:8000/api/flights/offer/{offer_id}/package/`

#### 🎯 Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------=================|
| `offer_id` | path | ✅      | Offer ID from search results |

### 📥 Response
**Status:** `200 OK`

```json
{
  "airline_title": "Duffel Airways",
  "airline_subtitle": "Duffel Airways",
  "time_range": "6:34 PM - 7:33 PM",
  "route": "Dhaka → Cox's Bazar",
  "flight_number": "9863",
  "duration": "59m",
  "total_passengers": 1,
  "cabin_class": "Economy",
  "available_seats": "Limited",
  "fares": [
    {
      "name": "Economy Saver",
      "description": "Essential travel with carry-on included",
      "price": "GBP 41.19",
      "baggage": {
        "cabin": "1 KG /Adult",
        "checked": "1 KG /Adult"
      },
      "available_seats": "Limited",
      "continue": true
    },
    {
      "name": "Economy Value",
      "description": "More flexibility and comfort",
      "price": "GBP 53.14",
      "baggage": {
        "cabin": "1 KG /Adult",
        "checked": "6 KG /Adult"
      },
      "available_seats": "Limited",
      "continue": true
    },
    {
      "name": "Economy Flex",
      "description": "Maximum flexibility and benefits",
      "price": "GBP 65.49",
      "baggage": {
        "cabin": "4 KG /Adult",
        "checked": "11 KG /Adult"
      },
      "available_seats": "Limited",
      "continue": true
    }
  ],
  "raw_offer_data": {
    "id": "off_0000AyWUGDW9y97sT88FTx",
    "created_at": "2025-09-24T06:38:41.552545Z",
    "expires_at": "2025-09-24T07:08:41.552546Z",
    "total_amount": "41.19",
    "total_currency": "GBP",
    "live_mode": false,
    "partial": false
  },
  "api_data_sources": {
    "offers_api": true,
    "available_services_api": false,
    "seat_maps_api": true,
    "offer_confirm_api": false
  }
}
```

---

## ✅ Package Selection

### 📤 Request
**POST** `http://127.0.0.1:8000/api/flights/package/select/`

```json
{
  "offer_id": "off_0000AyWXglKnA6Aak0AFJy",
  "fare_name": "Economy Saver"
}
```

#### 🎯 Parameters
| Parameter    | Type   | Required | Description        |
|-----------   |------  |----------|--------------------|
| `offer_id`   | string | ✅       | Selected offer ID |
| `fare_name`  | string | ✅       | Fare package name |

### 📥 Response
**Status:** `200 OK`

```json
{
  "offer_id": "off_0000AyWXglKnA6Aak0AFJy",
  "fare_selected": "Economy Saver",
  "airline": "Duffel Airways",
  "flight_number": "9863",
  "departure": "DAC",
  "arrival": "CXB",
  "departure_time": "2025-09-25T18:34:00",
  "arrival_time": "2025-09-25T19:33:00",
  "duration": "0h 59m",
  "cabin_class": "Economy",
  "price": "GBP 41.39",
  "baggage": {
    "cabin": "1 KG /Adult",
    "checked": "1 KG /Adult"
  },
  "available_seats": "Limited"
}
```

---

## 🎫 Order Management

### Instant Order Creation
**POST** `http://127.0.0.1:8000/api/flights/orders/`

```json
{
  "data": {
    "selected_offers": ["off_0000AyZ3ZrBnr9JfiLgFAh"],
    "passengers": [
      {
        "id": "pas_0000AyZ3ZqzkZxfv6y2cNe",
        "title": "mr",
        "given_name": "John",
        "family_name": "Doe",
        "born_on": "1990-01-01",
        "gender": "m",
        "email": "john@example.com",
        "phone_number": "+8801712345678"
      }
    ],
    "payments": [
      {
        "type": "balance",
        "amount": "40.84",
        "currency": "GBP"
      }
    ],
    "type": "instant"
  }
}
```

### Hold Order Creation
**POST** `http://127.0.0.1:8000/api/flights/orders/`

```json
{
  "data": {
    "selected_offers": ["off_0000AybUQWMzh3QTKVU7k2"],
    "passengers": [
      {
        "id": "pas_0000AybUQW6Kh06AUpgolu",
        "title": "mr",
        "given_name": "John",
        "family_name": "Doe",
        "born_on": "1990-01-01",
        "gender": "m",
        "email": "john@example.com",
        "phone_number": "+8801712345678"
      }
    ],
    "type": "hold"
  }
}
```

#### 🎯 Order Types
| Type     | Description       | Payment Required       |
|----------|-------------------|------------------------|
| `instant`| Immediate booking | At order creation      |
| `hold`   | Temporary hold    | Within payment window  |

---

## 💳 Payment Processing

### 📤 Request (Hold Order Payment)
**POST** `http://127.0.0.1:8000/api/flights/hold-order/pay/`

```json
{
  "order_id": "ord_0000Aybmt1IaSrcl0ffsjw",
  "payment_type": "balance",
  "amount": "40.44",
  "currency": "GBP"
}
```

### 📥 Response
**Status:** `200 OK`

```json
{
  "payment": {
    "live_mode": false,
    "created_at": "2025-09-26T20:04:38.051011Z",
    "amount": "40.44",
    "currency": "GBP",
    "type": "balance",
    "id": "pay_0000AybnDOPgEekaUPhseK"
  }
}
```

---

## ⚠️ Error Handling

### Common Error Responses

```json
{
  "status": "error",
  "message": "Detailed error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific error information"
  }
}
```

### Error Codes
| Code | Description | Action |
|------|-------------|--------|
| `VALIDATION_ERROR` | Invalid request parameters | Check request body |
| `OFFER_EXPIRED` | Offer no longer available | Refresh search |
| `INSUFFICIENT_SEATS` | Not enough seats available | Select different fare |
| `PAYMENT_FAILED` | Payment processing failed | Retry with valid payment |

---
### 📤 Request (Intned Order Payment with card )
**POST** `http://127.0.0.1:8000/api/flights/hold-order/pay/`

```json
{
  "offer_amount": "41.13",
  "offer_currency": "GBP",
  "markup": "0.00",
  "customer_currency": "GBP"
}

```

### 📥 Response
**Status:** `200 OK`

```json
{
  "payment_intent": {
    "fees_currency": null,
    "fees_amount": null,
    "client_token": "eyJjbGllbnRfc2VjcmV0IjoicGlfM1NDNDk0QWcySmhFeTh2WTBUVHdJRzZ0X3NlY3JldF9Zc1Z5SUpvbnV0eUxzeml2ZFd0NndqWHpyIiwicHVibGlzaGFibGVfa2V5IjoicGtfdGVzdF9EQUJLY0E2Vzh6OTc0cTdPSWY0YmJ2MVQwMEpwRmMyOUpWIn0=",
    "card_network": null,
    "card_last_four_digits": null,
    "card_country_code": null,
    "net_currency": null,
    "net_amount": null,
    "refunds": [],
    "confirmed_at": null,
    "live_mode": false,
    "created_at": "2025-09-27T19:51:01.778899Z",
    "updated_at": "2025-09-27T19:51:02.200540Z",
    "amount": "47.44",
    "currency": "GBP",
    "status": "requires_payment_method",
    "id": "pit_0000AydqVyMzyc3vvyDJqv"
  },
  "client_token": "eyJjbGllbnRfc2VjcmV0IjoicGlfM1NDNDk0QWcySmhFeTh2WTBUVHdJRzZ0X3NlY3JldF9Zc1Z5SUpvbnV0eUxzeml2ZFd0NndqWHpyIiwicHVibGlzaGFibGVfa2V5IjoicGtfdGVzdF9EQUJLY0E2Vzh6OTc0cTdPSWY0YmJ2MVQwMEpwRmMyOUpWIn0="
}
```
## 🚀 Frontend Integration Guide

### 1. Search Flow
```javascript
// 1. Perform flight search
const searchResults = await fetch('/api/flights/search/', {
  method: 'POST',
  body: JSON.stringify(searchParams)
});

// 2. Display results with filters
const { itineraries, filters } = searchResults;

// 3. Implement sorting and filtering
// Use filters.priceRange, filters.airlines, etc.
```

### 2. Package Selection
```javascript
// 1. Get fare packages for selected flight
const packages = await fetch(`/api/flights/offer/${offerId}/package/`, {
  method: 'POST'
});

// 2. Display fare options to user
// Show baggage allowances, benefits, etc.

// 3. User selects fare package
const selection = await fetch('/api/flights/package/select/', {
  method: 'POST',
  body: JSON.stringify({
    offer_id: offerId,
    fare_name: selectedFare
  })
});
```

### 3. Booking Flow
```javascript
// For instant booking:
const order = await fetch('/api/flights/orders/', {
  method: 'POST',
  body: JSON.stringify(instantOrderData)
});

// For hold booking:
const holdOrder = await fetch('/api/flights/orders/', {
  method: 'POST',
  body: JSON.stringify(holdOrderData)
});

// Then pay for hold order:
const payment = await fetch('/api/flights/hold-order/pay/', {
  method: 'POST',
  body: JSON.stringify(paymentData)
});
```

### 4. UI Components Suggestions
- **Search Form**: Origin/Destination inputs, date picker, passenger selector
- **Results Grid**: Flight cards with summary, price, duration
- **Filters Sidebar**: Price slider, airline checkboxes, stops filter
- **Fare Selector**: Package comparison table with baggage info
- **Passenger Form**: Personal details collection
- **Payment Form**: Payment method selection

---

## 💡 Best Practices

### ✅ Do's
- Cache search results for better performance
- Implement loading states for all API calls
- Validate passenger data before submission
- Handle offer expiration gracefully
- Show clear error messages to users

### ❌ Don'ts
- Don't hardcode currency symbols
- Don't assume all flights have the same fare structure
- Don't forget timezone conversions for flight times
- Don't skip form validation on frontend

---

## 🔄 State Management Flow

```
Search → Select Flight → Choose Fare → Passenger Details → Payment → Confirmation
    ↓           ↓           ↓             ↓             ↓         ↓
  /search   /package/   /select/     /orders/      /pay/    /confirmation/
```

---

## 📱 Mobile Considerations
- Use touch-friendly interface elements
- Implement infinite scroll for search results
- Optimize images and icons for mobile
- Test payment flow on mobile devices
0.56+
This documentation provides everything frontend developers need to integrate the flights booking system seamlessly! 🎉AQ2 




{
  "total_amount": 601.07,
  "currency": "GBP",
  "offer_id": "off_0000Ayy5HMBl7xlQVxLr8L",
  "passenger_ids": ["pas_0000Ayy5HLuk9E9XfBOGby"], 
  "passengers": [
    {
      "title": "mr",
      "given_name": "John",
      "family_name": "Doe",
      "born_on": "1990-05-15",
      "gender": "m",
      "email": "john@example.com",
      "phone_number": "+8801710000000"
    }
  ],
  "cus_name": "John Doe",
  "email": "john@example.com",
  "cus_phone": "01710000000",
  "cus_add1": "House 12, Road 3",
  "cus_city": "Dhaka",
  "cus_state": "Dhaka",
  "cus_postcode": "1207",
  "cus_country": "Bangladesh"
}
