
const i18nConfig = {
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      common: {
        "IndexPage": "Index page",
        "Weather": "Weather",
        "Earthquake": "Earthquake",
        "Cyclone": "Cyclone",
        "AboutSMD": "About SMD",
        "Warnings": "Warnings",
        "Warning": "Warning",
        "Watch": "Watch",
        title : {
          eqtsunami: "Earthquake And Tsunami",
          cyclone: "Cyclone",
          about: "About SMD"
        },
        menu : {
          language: "Gagana",
          about: "About this app"
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
        HeavyRain: "Heavy Rain"
      }
    },
    ws: {
      common: {
        "IndexPage": "Index itulau",
        "Weather": "Tau",
        "Earthquake": "Mafui'e",
        "Cyclone": "Afa",
        "AboutSMD": "Faatatau ia SMD",
        "Warnings": "Lapataiga",
        "Warning": "Lapataiga",
        "Watch": "Tausi",
        title : {
          eqtsunami: "Mafui'e ma Sunami",
          cyclone: "Afa",
          about: "Faatautau ia SMD"
        },
        menu : {
          language: "Language",
          about: "Faatatau ia le app"
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
        HeavyRain: "Heavy Rain"
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
