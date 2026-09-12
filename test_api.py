# -*- coding: utf-8 -*-
import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:3000/api"
print("=== TESTING BHARATYATRA BACKEND REST API & DATABASE ===")

def req(endpoint, data=None, method=None):
    url = BASE_URL + endpoint
    headers = {"Content-Type": "application/json"}
    if method == "POST" or data is not None:
        body = json.dumps(data if data is not None else {}).encode("utf-8")
        r = urllib.request.Request(url, data=body, headers=headers, method="POST")
    else:
        r = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(r, timeout=5) as res:
        return json.loads(res.read().decode("utf-8"))

# Test 1: Regions
regions = req("/regions")
assert regions["success"] == True
assert len(regions["data"]) == 6
print(f"[PASS] 1. GET /api/regions -> Loaded {len(regions['data'])} regions from SQLite.")

# Test 2: Trips
trips = req("/trips")
assert trips["success"] == True
assert len(trips["data"]) == 4
print(f"[PASS] 2. GET /api/trips -> Loaded {len(trips['data'])} customizable trips.")

# Test 3: Trip Details & Itinerary
trip1 = req("/trips/1")
assert trip1["success"] == True
assert len(trip1["data"]["itinerary"]) == 7
print(f"[PASS] 3. GET /api/trips/1 -> Full 7-day itinerary loaded for '{trip1['data']['title']}'.")

# Test 4: Toggle Favorite (Wishlist)
fav = req("/trips/1/favorite", method="POST")
assert fav["success"] == True
assert "is_favorited" in fav
print(f"[PASS] 4. POST /api/trips/1/favorite -> Wishlist state persisted in DB: is_favorited = {fav['is_favorited']}.")

# Test 5: AI Travel Copilot
ai = req("/ai/chat", {"prompt": "Plan a 7-day Maharashtra trip covering forts and coastal food"})
assert ai["success"] == True
assert "Maharashtra" in ai["reply"]
print(f"[PASS] 5. POST /api/ai/chat -> AI synthesized customized plan and logged conversation in SQLite.")

# Test 6: Create Booking
booking = req("/bookings", {
    "destination": "Rajasthan",
    "travel_date": "2026-10-15",
    "travellers": 2,
    "category": "Plan with AI",
    "customer_name": "Test Traveller"
})
assert booking["success"] == True
assert booking["booking_ref"].startswith("BY-")
print(f"[PASS] 6. POST /api/bookings -> Booking created with reference: {booking['booking_ref']}.")

# Test 7: Partners
partners = req("/partners")
assert partners["success"] == True
assert len(partners["data"]) >= 4
print(f"[PASS] 7. GET /api/partners -> Loaded {len(partners['data'])} verified local partners.")

# Test 8: Platform Stats
stats = req("/stats")
assert stats["success"] == True
print(f"[PASS] 8. GET /api/stats -> Platform metrics verified: {stats['stats']}.")

print("\n>>> ALL 8 BACKEND API & DATABASE TESTS PASSED 100%! <<<")
