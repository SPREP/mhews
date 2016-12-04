/* Return the appropriate zoom level for the specified area size in km */
export function getZoomLevel(areaSize){
  const sizeList = [20, 50, 100, 200, 500, 1000];
  let level = 12;
  for(let i= 0; i< sizeList.length; i++){
    if( areaSize <= sizeList[i]){
      return level;
    }
    level--;
  }
  return level;
}

/* Get the longest diagonal of the polygon given as the list of points. */
export function getLongestDiagonal(points){
  let maxDistance = 0;
  for(let i= 0; i< points.length; i++){
    for(let j= i; j< points.length; j++){
      let distance = getDistanceFromLatLonInKm(points[i], points[j]);
      if( distance > maxDistance ){
        maxDistance = distance;
      }
    }
  }
  return maxDistance;
}

export function getDistanceFromLatLonInKm(point1, point2) {
  return geolib.getDistanceSimple(point1, point2) / 1000;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
