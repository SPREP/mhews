/* global geolib */

const HazardAreaMap = {
  "Samoa": {
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
    // FIXME: To be defined.
//    "Town Area": {},
//    "Highlands": {},
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
    // FIXME: To be defined.
//    "Town Area": {},
//    "Highlands": {},
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

export function findAreas(areaName, direction){
  if( !areaName ){
    console.error("areaName must be specified.");
    return [];
  }
  if( areaName == "Samoa"){
    let areas = [];
    if( direction == "North" || direction == "South") {
      ["Upolu Island", "Savaii Island"].forEach((areaName) => {
        areas = areas.concat(findAreas(areaName, direction));
      });
    }
    else if( direction == "East"){
      areas = areas.concat(findAreas("Upolu Island"));
    }
    else if( direction == "West"){
      areas = areas.concat(findAreas("Savaii Island"));
    }
    else if( direction == "Whole Area"){
      areas = areas.concat(findAreas("Upolu Island"));
      areas = areas.concat(findAreas("Savaii Island"));
    }
    // Always include Manono and Apolima just in case.
    ["Manono Island", "Apolima Island"].forEach((areaName) => {
        areas = areas.concat(findAreas(areaName));
    });

    return areas;
  }
  if( areaName == "Manono Island" || areaName == "Apolima Island"){
    return [HazardAreaMap[areaName]];
  }
  else {
    const area = HazardAreaMap[areaName];
    if( area ){
      if( direction && direction != "Whole Area"){
        return [area[direction]];
      }
      else{
        let areas = [];
        for(let direction in area){
          areas.push(area[direction]);
        }
        return areas;
      }
    }
  }
}

export function maybeInHazardArea(position, data){
  if( !data.area ){
    console.error("data does not have the area property. Returning true for safety.");
    return true;
  }
  const areaList = findAreas(data.area, data.direction);
  for(let i= 0; i< areaList.length; i++){
    let area = areaList[i];
    if(area.shape == Shape.circle){
      if(geolib.isPointInCircle(position, area.center, area.radius)){
        return true;
      }
    }
    else if(area.shape == Shape.polygon){
      if(geolib.isPointInside(position, area.vertices)){
        return true;
      }
    }
    else{
      console.error("Unknown shape "+area.shape);
      return true;
    }
  }
  // Either areaList is empty, or position is not in any of the areas.
  return false;
}

export function getAreaId(area, direction){
  const areaIdComponents = ["samoa"];

  if( area == "Samoa"){
    // Nothing to do
  }
  else if( area == "Upolu Island" ){
    areaIdComponents.push("upolu");
  }
  else if( area == "Savaii Island" ){
    areaIdComponents.push("savaii");
  }
  else if( area == "Manono Island" ){
    areaIdComponents.push("manono");
  }
  else if( area == "Apolima Island" ){
    areaIdComponents.push("apolima");
  }
  else {
    console.error("Unknown area "+area+" was given to getAreaId()");
    return undefined;
  }

  if( direction ){
    areaIdComponents.push(direction.toLowerCase());
  }

  return areaIdComponents.join("_");
}

export const Shape = {
  polygon: "polygon",
  circle: "circle"
}
