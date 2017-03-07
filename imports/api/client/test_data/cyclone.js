export default {
  "bulletin": {
    "id": 5,
    "issued_at": "2017-01-06 00:52:00",
    "type": "cyclone",
    "in_effect": true,
    "option": {
      "type": "Testing",
      "text": "PLEASE IGNORE (SYSTEM TEST)"
    },
    "tc_info": {
      "name": "Taula",
      "center": {"lat": -16.30, "lng": 177.64},
      "situation_en": "Free text describing the Situation in English will come here.",
      "situation_sam": "Free text describing the Situation in Samoan will come here.",
      "people_impact_en": "Free text describing the potential impact in English will come here.",
      "people_impact_sam": "Free text describing the potential impact in Samoan will come here.",
      "neighbour_towns": [
        {
          "name": "Apia",
          "distance_km": 1170,
          "distance_miles": 725,
          "direction": "West"
        },
        {
          "name": "Asau",
          "distance_km": 1090,
          "distance_miles": 675,
          "direction": "West"
        }
      ]
    },
    "warnings":[
      {
        "type": "cyclone",
        "category": 1,
        "level": "Watch",
        "change": "Remain",
        "in_effect": true,
        "area": "Samoa",
        "direction": "Whole area"
      },
      {
        "type": "cyclone",
        "category": 2,
        "level": "Warning",
        "change": "New",
        "in_effect": true,
        "area": "Savaii Island",
        "direction": "West"
      }
    ]
  }
}
