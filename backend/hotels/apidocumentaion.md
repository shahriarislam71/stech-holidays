

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
  "slices": [
    {
      "origin": "LHR",
      "destination": "JFK",
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
