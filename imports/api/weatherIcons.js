export const weatherIcons = {
  "dayTime": {
    "clear": "Sunny.png",
    "partlyCloudy": "PartlyCloudyDay.png",
    "overcast": "Overcast.png",
    "shower": "DayShower.png",
    "moderate": "Moderate.png",
    "heavyRain": "HeavyRain.png",
    "thunder": "Thunder.png",
    "windy": "Windy.png"
  },
  "nightTime": {
    "clear": "ClearNight.png",
    "partlyCloudy": "PartlyCloudyNight.png",
    "overcast": "Overcast.png",
    "shower": "NightShower.png",
    "moderate": "Moderate.png",
    "heavyRain": "HeavyRain.png",
    "thunder": "Thunder.png",
    "windy": "Windy.png"
  }
};

// Used to judge which icon should be selected as predominant,
// based on the negative effect of the weather.
const weatherSignificance = {
    "clear" : 0,
    "partlyCloudy": 1,
    "overcast":2,
    "shower":3,
    "moderate":4,
    "heavyRain":5,
    "thunder":6,
    "windy":7
}

// From the given list of weather symbols for a day,
// select the weather symbol that describes the weather of the day.
// Because the weather during the night time is not so important,
// this function chooses one of the weather symbols during the day time.
// The given list of weather symbols must be sorted from 0:00 to the 24:00.
export function selectPredominantWeatherSymbol(weatherSymbols){
  if( weatherSymbols.length == 1 ){
    return weatherSymbols[0];
  }
  else{
    const symbolMap = {};
    const daytimeSymbols = extractDaytimeSymbols(weatherSymbols);
    daytimeSymbols.forEach((symbol)=>{
      if( symbolMap[symbol] ){
        symbolMap[symbol] ++;
      }
      else{
        symbolMap[symbol] = 1;
      }
    });

    // The returned list contains objects, with "key" as the weatherSymbol, "value" as the count.
    let list = sortMap(symbolMap).reverse();
    if( list[0].value >= weatherSymbols.length / 2 ){
      // Single weatherSymbol is predominant for the day
      return list[0].key;
    }
    else{
      // Select the worst weather symbol among the highest count weather symbols
      return selectWorstSymbol(selectHighestValues(list));

    }
  }
}

function extractDaytimeSymbols(symbols){
  const hoursPerSymbol = 24 / symbols.length;
  const daytimeSymbols = [];
  symbols.forEach((symbol, index)=>{
    const startTime = index * hoursPerSymbol;
    if( startTime >= 6 && startTime < 18 ){
      daytimeSymbols.push(symbol);
    }
  })

  return daytimeSymbols;
}

function selectWorstSymbol(list){
  let selected;
  let selectedSignificance = -1;
  list.forEach((kv)=>{
    if( weatherSignificance[kv.key] > selectedSignificance ){
      selectedSignificance = weatherSignificance[kv.key];
      selected = kv.key;
    }
  });
  return selected;
}

// list must have been sorted in descending order
function selectHighestValues(list){
  const rlist = [];
  const highestValue = list[0].value;
  list.forEach((e)=>{
    if( e.value == highestValue ){
      rlist.push(e);
    }
  });
  return rlist;
}

function sortMap(hash){
  const list = [];
  for(let key in hash){
    list.push({key: key, value: hash[key]});
  }
  return list.sort((a, b)=>{
    return a.value - b.value;
  });
}

// The referenceTime must be a moment object
export function getWeatherIcon(weatherSymbol, referenceTime){
  const hour = referenceTime.hour();
  const dayTime = hour > 6 && hour < 18;

  const weatherIcon = dayTime ? weatherIcons.dayTime[weatherSymbol] : weatherIcons.nightTime[weatherSymbol];
  return "images/weather/"+weatherIcon;
}
