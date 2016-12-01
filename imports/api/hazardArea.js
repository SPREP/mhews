const HazardAreaMap = {
  "Samoa": {
    "North": {
      shape: "polygon",
      vertices: [
        {lng: -172.858887,lat: -13.459080},
        {lng: -172.320557,lat: -13.346865},
        {lng:-171.644897, lat: -13.747389},
        {lng:-171.342773,lat: -14.056659}
      ]
    },
    "East":{
      shape: "polygon",
      vertices: [
        {lng: -172.128296,lat:-13.816744},
        {lng:-171.754761,lat:-13.715372},
        {lng:-171.331787,lat:-14.019356},
        {lng:-171.809692,lat:-14.104613},
        {lng:-172.073364,lat:-13.955392},
        {lng:-172.139282,lat:-13.827412}
      ]
    },
    "South": {
      shape: "polygon",
      vertices: [
        {lng: -172.875366,lat:-13.496473},
        {lng: -171.326294,lat:-14.046002},
        {lng:-171.743774,lat:-14.109940},
        {lng:-172.617188,lat:-13.822078},
        {lng:-172.886353,lat:-13.496473}
      ]
    },
    "West":{
      shape: "polygon",
      vertices:  [
        {lng: -172.847900,lat:-13.448395},
        {lng:-172.348022,lat:-13.330830},
        {lng:-172.100830,lat:-13.736717},
        {lng:-172.529297,lat:-13.864747},
        {lng:-172.792969,lat:-13.656663},
      ]
    }
  },
  "Upolu Island": {
    "North":{
      shape: "polygon",
      vertices: [
        {lng:-172.087097,lat:-13.835413},
        {lng:-171.823425,lat:-13.742053},
        {lng:-171.364746,lat:-14.008696},
        {lng:-172.089844,lat:-13.843414}
      ]
    },
    "East": {
      shape: "polygon",
      vertices:[
        {lng:-171.694336,lat:-13.782069},
        {lng:-171.826172,lat:-14.064652},
        {lng:-171.600952,lat:-14.083301},
        {lng:-171.386719,lat:-14.035344},
        {lng:-171.502075,lat:-13.883412},
      ]
    },
    "South":{
      shape: "polygon",
      vertices:[
        {lng:-172.084351,lat:-13.851414},
        {lng:-171.378479,lat:-14.022020},
        {lng:-171.606445,lat:-14.083301},
        {lng:-171.804199,lat:-14.059324},
        {lng:-172.004700,lat:-13.979381},
      ]
    },
    "West":{
      shape: "polygon",
      vertices: [
        {lng:-172.087097,lat:-13.835413},
        {lng:-171.875610,lat:-13.752725},
        {lng:-171.694336,lat:-13.787404},
        {lng:-171.793213,lat:-14.048666},
        {lng:-172.021179,lat:-13.968719},
        {lng:-172.081604,lat:-13.899410},
      ]
    },
    "Town Area": {},
    "Highlands": {},
  },
  "Savaii Island": {
    "North": {
      shape: "polygon",
      vertices:[
        {lng:-172.878113,lat:-13.469764},
        {lng:-172.359009,lat:-13.389620},
        {lng:-172.117310,lat:-13.670007},
        {lng:-172.183228,lat:-13.726045},
      ]
    },
    "East":{
      shape: "polygon",
      vertices:[
        {lng:-172.348022,lat:-13.378932},
        {lng:-172.139282,lat:-13.667338},
        {lng:-172.207947,lat:-13.816744},
        {lng:-172.548523,lat:-13.816744},
      ]
    },
    "South": {
      shape: "polygon",
      vertices:[
        {lng:-172.836914,lat:-13.496473},
        {lng:-172.166748,lat:-13.766063},
        {lng:-172.238159,lat:-13.832746},
        {lng:-172.575989,lat:-13.811410},
      ]
    },
    "West":{
      shape: "polygon",
      vertices: [
        {lng:-172.867126,lat:-13.453737},
        {lng:-172.337036,lat:-13.378932},
        {lng:-172.523804,lat:-13.835413}
      ]
    },
    "Town Area": {},
    "Highlands": {},
  },
  // Assuming that a warning is valid to entier Manono Island
  "Manono Island": {
    shape: "circle",
    center: {lat:-13.850414,lng:-172.109756},
    radius: 1923
  },
  "Apolima Island": {
    shape: "circle",
    center: {lat:-13.823412,lng:-172.1512},
    radius: 1336
  },
}

export function getHazardArea(areaName, direction){
  if( areaName == "Manono Island" || areaName == "Apolima Island"){
    return HazardAreaMap[areaName];
  }
  else{
    return HazardAreaMap[areaName][direction];
  }
}

export const Shape = {
  polygon: "polygon",
  circle: "circle"
}
