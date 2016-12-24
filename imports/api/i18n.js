
const i18nConfig = {
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      common: {
        "Weather": "Weather",
        "Earthquake": "Earthquake",
        "Cyclone": "Cyclone",
        "AboutSMD": "About SMD",
        "Warnings": "Warnings",
        "Warning": "Warning",
        "Watch": "Watch",
        "warning": "warning",
        "heavyRain": "heavyRain",
        title : {
          index: "Overview",
          weather: "Weather Forecast",
          heavyRain: "Heavy Rain",
          warnings: "Effective Warnings",
          language: "Language Setting",
          settings: "Settings",
          eqtsunami: "Earthquake And Tsunami",
          cyclone: "Cyclone",
          about: "About SMD",
          aboutApp: "About this App"
        },
        district: {
          "upolu-north-northwest": "Upolu North Northwest",
          "upolu-east-southwest": "Upolu East Southwest",
          "savaii-east-northeast": "Savaii East Northeast",
          "savaii-northwest": "Savaii Northwest",
          "savaii-south": "Savaii South"
        },
        "is in effect in": "is in effect in",
        no_warning_in_effect: "Currently no warning is in effect.",
        no_weather_forecast_error: "Sorry there is no forecast... Perhaps the app failed to contact the server.",
        situation: "Situation",
        month:{
          "Jan": "Jan",
          "Feb": "Feb",
          "Mar": "Mar",
          "Apr": "Apr",
          "May": "May",
          "Jun": "Jun",
          "Jul": "Jul",
          "Aug": "Aug",
          "Sep": "Sep",
          "Oct": "Oct",
          "Nov": "Nov",
          "Dec": "Dec"
        },
        weekdays:{
          "Mon": "Mon",
          "Tue": "Tue",
          "Wed": "Wed",
          "Thu": "Thu",
          "Fri": "Fri",
          "Sat": "Sat",
          "Sun": "Sun"
        },
        HeavyRain: "Heavy Rain",
        "waiting-for-network": "Waiting for Network"
      }
    },
    ws: {
      common: {
        "Weather": "Tau",
        "Earthquake": "Mafui'e",
        "Cyclone": "Afa",
        "AboutSMD": "Faatatau ia SMD",
        "Warnings": "Lapataiga",
        "Warning": "Lapataiga",
        "Watch": "Tausi",
        "warning": "warning",
        "heavyRain": "heavyRain",
        title : {
          index: "Overview",
          weather: "Tau",
          heavyRain: "Heavy Rain",
          warnings: "Lapataiga",
          language: "Language",
          settings: "Settings",

          eqtsunami: "Mafui'e ma Sunami",
          cyclone: "Afa",
          about: "Faatautau ia SMD",
          aboutApp: "Faatautau ia App"
        },
        district: {
          "upolu-north-northwest": "Upolu North Northwest",
          "upolu-east-southwest": "Upolu East Southwest",
          "savaii-east-northeast": "Savaii East Northeast",
          "savaii-northwest": "Savaii Northwest",
          "savaii-south": "Savaii South"
        },
        "is in effect in": "i aafiaga i le",
        no_warning_in_effect: "E leai se lapataiga i aafiaga nei.",
        no_weather_forecast_error: "Tulou e leai forecast...",
        situation: "Tulaga",
        month: {
          "Jan": "Ian",
          "Feb": "Fep",
          "Mar": "Mat",
          "Apr": "Ape",
          "May": "Ma",
          "Jun": "Iun",
          "Jul": "Iul",
          "Aug": "Auk",
          "Sep": "Set",
          "Oct": "Oke",
          "Nov": "Nov",
          "Dec": "Tes"
        },
        weekdays:{
          "Mon": "Aso Gafua",
          "Tue": "Aso Lua",
          "Wed": "Aso Lulu",
          "Thu": "Aso Tofi",
          "Fri": "Aso Faraile",
          "Sat": "Aso To'anai",
          "Sun": "Aso Sa"
        },
        HeavyRain: "Heavy Rain",
        "waiting-for-network": "Fa'atali mo le network"
      }
    }
  },

  // have a common namespace used around the full app
  ns: ['common'],
  defaultNS: 'common',

  debug: true,

  interpolation: {
    escapeValue: false // not needed for react!!
  }
};

export default i18nConfig;
