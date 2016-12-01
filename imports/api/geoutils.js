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

/*
Google maps also has the method for calculating spherical distance named
google.maps.geometry.spherical.computeDistanceBetween().
However, this function will be called before the google map is loaded,
so I decided not to use it.
This function were taken from a question on the stackoverflow.
http://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates-shows-wrong
*/
export function getDistanceFromLatLonInKm(point1, point2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(point2.lat-point1.lat);  // deg2rad below
  var dLon = deg2rad(point2.lng-point1.lng);
  var a =
  Math.sin(dLat/2) * Math.sin(dLat/2) +
  Math.cos(deg2rad(point1.lat)) * Math.cos(deg2rad(point2.lat)) *
  Math.sin(dLon/2) * Math.sin(dLon/2)
  ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
