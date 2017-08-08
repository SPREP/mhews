export default {
  "languages": ["en", "ws"],
  "notificationConfig" : {
    "earthquake" : {
      "sound": "tsunami_warning.wav",
      "icon": "/images/warnings/earthquake.png",
      "page": "earthquakePage",
      "useLocation": false
    },
    "tsunami" : {
      "sound": "tsunami_warning.wav",
      "icon": "/images/warnings/tsunami.png",
      "page": "earthquakePage",
      "useLocation": false
    },
    "cyclone" : {
      "sound": "general_warning.mp3",
      "icon": "/images/warnings/tornado.png",
      "page": "cyclonePage",
      "useLocation": false
    },
    "heavyRain" : {
      "sound": "general_warning.mp3",
      "icon": "/images/warnings/storm.png",
      "page": "heavyRainPage",
      "useLocation": false
    },
    "wind" : {
      "sound": "general_warning.mp3",
      "icon": "/images/warnings/wind.png",
      "page": "heavyRainPage",
      "useLocation": false
    }
  },
  "menu": [
    "topPage",
    "climate",
    "settings",
    "usage",
    "about"
  ],
  "topPage": "topPage",
  "pages": {
    "topPage" : {
      "component": "TopPage",
      "title": "title.app",
      "icon": "HomeIcon"
    },
    "climate" : {
      "component": "ClimatePage",
      "title": "title.climate",
      "icon": "LinkIcon"
    },
    "usage" : {
      "component": "UsagePage",
      "title": "title.usage",
      "icon": "InfoOutlineIcon"
    },
    "about":{
      "component": "AboutAppPage",
      "title": "title.aboutapp",
      "useGrid": true,
      "icon": "CopyrightIcon"
    },
    "settings": {
      "component": "PreferencesPageContainer",
      "title": "title.settings",
      "icon": "SettingsIcon"
    }
  },
  "cacheFiles": {
    "surfaceChart": "http://www.samet.gov.ws/images/surface_chart/latest_compact.png",
    "satelliteImage": "http://www.samet.gov.ws/satellite/satellite_image_compact.png"
  },
  "districts": [
    "upolu-north-northwest",
    "upolu-east-southwest",
    "savaii-east-northeast",
    "savaii-northwest",
    "savaii-south"
  ],
  "quakeDistances": [
    {distance: 0, description: "Don't receive any earthquake information."},
    {distance: 5000, description: "5000km or near (Polynesia)"},
    {distance: 8000, description: "8000km or near (Oceania, South East Asia)"},
    {distance: 10000, description: "10000km or near (South America West Coast)"},
    {distance: 50000, description: "Not limited by distance."}
  ],
  "defaultPreferences": {
    "language": "en",
    "district": "upolu-north-northwest",
    "exercise": "false",
    "quakeDistance": 50000
  }

}
