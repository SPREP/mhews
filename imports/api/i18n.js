const i18nConfig = {
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      common: {
        "weather": "weather",
        "earthquake": "earthquake",
        "tsunami": "tsunami",
        "cyclone": "cyclone",
        "aboutsmd": "About SMD",
        "warnings": "Warnings",
        "heavyrain": "heavy rain",
        "language": "language",
        "district": "district",
        "cancellation": "cancellation",
        "category": "category",
        "exercise": "exercise",
        level : {
          advisory: "advisory",
          watch: "watch",
          warning: "warning",
          information: "information"
        },
        title : {
          app: "Samoa Weather",
          climate: "Climate",
          weather: "Weather",
          heavyrain: "Heavy Rain",
          earthquake: "Earthquake",
          tsunami: "Tsunami",
          warnings: "Effective Warnings",
          language: "Language Setting",
          settings: "Settings",
          eqtsunami: "Earthquake And Tsunami",
          cyclone: "Cyclone",
          about: "About SMD",
          aboutapp: "About this App",
          quit: "Quit",
          usage: "Usage"
        },
        districts: {
          "upolu-north-northwest": "Upolu North Northwest",
          "upolu-east-southwest": "Upolu East Southwest",
          "savaii-east-northeast": "Savaii East Northeast",
          "savaii-northwest": "Savaii Northwest",
          "savaii-south": "Savaii South"
        },
        directions: {
          "north": "North",
          "north north-east": "North North-East",
          "north-east": "North-East",
          "east": "East",
          "east north-east": "East North-East",
          "east south-east": "East South-East",
          "south-east": "South-East",
          "south": "South",
          "south south-west": "South South-West",
          "south south-east": "South South-East",
          "south-west": "South-West",
          "west south-west": "West South-West",
          "west": "West",
          "west north-west": "West North-West",
          "north-west": "North-West",
          "north north-west": "North North-West"
        },
        "is in effect in": "is in effect in",
        no_warning_in_effect: "No warnings in effect. No severe quakes within the last 24h.",
        no_weather_forecast_error: "Sorry there is no forecast... Perhaps the app failed to contact the server.",
        no_data_to_display: "No data to be displayed",
        situation: "situation",
        loading_map: "Loading Google map...",
        loading_data: "Loading data...",
        issued_at: "issued at",
        join_exercise: "Join exercise",
        month:{
          "jan": "Jan",
          "feb": "Feb",
          "mar": "Mar",
          "apr": "Apr",
          "may": "May",
          "jun": "Jun",
          "jul": "Jul",
          "aug": "Aug",
          "sep": "Sep",
          "oct": "Oct",
          "nov": "Nov",
          "dec": "Dec"
        },
        weekdays:{
          "mon": "Mon",
          "tue": "Tue",
          "wed": "Wed",
          "thu": "Thu",
          "fri": "Fri",
          "sat": "Sat",
          "sun": "Sun"
        },
        moon_phase: {
          "new_moon": "new moon",
          "waxing_crescent": "waxing crescent",
          "first_quarter": "first quarter",
          "waxing_gibbous": "waxing gibbous",
          "full_moon": "full moon",
          "waning_gibbous": "waning gibbous",
          "last_quarter": "last quarter",
          "waning_crescent": "waning crescent"
        },
        heavy_rain: "heavy rain",
        "waiting-for-network": "Waiting for Network",
        "software-update-available": "New software available.",
        tide: "tide",
        time: "time",
        height: "height",
        high: "high",
        low: "low",
        moon: "moon",
        or: "or",
        earthquake_description: {
          location: "An earthquake with magnitude %f occurred in %s at the depth of %d km",
          town: "approximately %d km (%s miles) of %s"
        },
        cyclone_description: {
          location: "Tropical Cyclone %s was located at %f, %f",
          town: "about %d km (%d miles) %s of %s"
        }
      }
    },
    ws: {
      common: {
        "weather": "tau",
        "climate": "climate",
        "earthquake": "mafui'e",
        "tsunami": "sunami",
        "cyclone": "afa",
        "aboutsmd": "Faatatau ia SMD",
        "warnings": "Lapataiga",
        "heavyrain": "heavyRain",
        "language": "gagana",
        "district": "vaega",
        "category": "vaega",
        "cancellation": "faaleaogaina",
        "exercise": "faataitaiga",
        level : {
          advisory: "fautuaga",
          watch: "nofosauni",
          warning: "lapataiga",
          information: "faaliga"
        },
        title : {
          app: "Tau o Samoa",
          weather: "Tau",
          heavyrain: "Timuga mamafa",
          earthquake: "Mafui'e",
          tsunami: "Sunami",
          warnings: "Lapataiga",
          language: "Language",
          settings: "Settings",

          eqtsunami: "Mafui'e ma Sunami",
          cyclone: "Afa",
          about: "Faatautau ile SMD",
          aboutapp: "Faatautau ile Apps",
          quit: "Faiatu",
          usage: "Faaaogaina"
        },
        districts: {
          "upolu-north-northwest": "Upolu Matu-Matu i Sisifo",
          "upolu-east-southwest": "Upolu Sasae-Saute i Sisifo",
          "savaii-east-northeast": "Savaii Sasae Matu i Sasae",
          "savaii-northwest": "Savaii Matu i Sisifo",
          "savaii-south": "Savaii Saute"
        },
        directions: {
          "north": "Matu",
          "north north-east": "Matu Matu-Sasae",
          "north-east": "Matu-Sasae",
          "east": "Sasae",
          "east north-east": "Sasae Matu-Sasae",
          "east south-east": "Sasae Saute-Sasae",
          "south-east": "Saute-Sasae",
          "south": "Saute",
          "south south-west": "Saute Saute-Sisifo",
          "south south-east": "Saute Saute-Sasae",
          "south-west": "Saute-Sisifo",
          "west south-west": "Sisifo Saute-Sisifo",
          "west": "Sisifo",
          "west north-west": "Sisifo Matu-Sisifo",
          "north-west": "Matu-Sisifo",
          "north north-west": "Matu Matu-Sisifo"
        },
        "is in effect in": "i aafiaga i le",
        no_warning_in_effect: "No warnings in effect. No severe quakes within the last 24h.",
        no_weather_forecast_error: "Tulou e leai forecast...",
        no_data_to_display: "No data to be displayed",
        situation: "tulaga",
        loading_map: "Loading Google map...",
        loading_data: "Loading data...",
        issued_at: "issued at",
        join_exercise: "Join exercise",
        month:{
          "jan": "Ianuari",
          "feb": "Fepuari",
          "mar": "Mati",
          "apr": "Aperila",
          "may": "Me",
          "jun": "Iuni",
          "jul": "Iulai",
          "aug": "Auguso",
          "sep": "Setema",
          "oct": "Oketopa",
          "nov": "Novema",
          "dec": "Tesema"
        },
        weekdays:{
          "mon": "Aso Gafua",
          "tue": "Aso Lua",
          "wed": "Aso Lulu",
          "thu": "Aso Tofi",
          "fri": "Aso Faraile",
          "sat": "Aso To'anai",
          "sun": "Aso Sa"
        },
        moon_phase: {
          "new_moon": "masina vaaia",
          "waxing_crescent": "waxing crescent",
          "first_quarter": "kuata muamua ole masina",
          "waxing_gibbous": "waxing gibbous",
          "full_moon": "atoa le masina",
          "waning_gibbous": "waning gibbous",
          "last_quarter": "kuata fa'aiu ole masina",
          "waning_crescent": "waning crescent"
        },
        heavy_rain: "timuga mamafa",
        "waiting-for-network": "Fa'atali mo le network",
        "software-update-available": "New software available.",
        tide: "tai",
        time: "taimi",
        height: "maualuga",
        high: "sua",
        low: "pe",
        moon: "masina",
        or: "po'o",
        earthquake_description: {
          location: "O le mafuie e tusa lona malosi ma le %f ile fua mafuie sa afua mai ile motu o %s ile loloto e %d kilomita",
          town: "ile mamao e %d kilomita (%s miles) o %s"
        },
        cyclone_description: {
          location: "Sa iai le Afa o %s i %f, %f",
          town: "le %d kilomita (%d miles) %s o %s"
        }
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
