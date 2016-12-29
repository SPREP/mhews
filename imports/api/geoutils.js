/* global geolib */

/* Return the appropriate zoom level for the specified area size in km */
export function getZoomLevel(areaSize){
  const sizeList = [100, 200, 500, 1000];
  let level = 10;
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

/**
* Return the radius of the circle in which the mmi is greater than 3.
* The unit is km.
*/
export function getIntensityCircleRadius(mw, depth){
  let radiusResolution = 100;
  let maximumRadius = 1000;
  let radius = 0;
  for(let sx= radiusResolution; sx<= maximumRadius; sx += radiusResolution){
    let mmi = getMMI(calculatePGV(mw, depth, sx));
    if( mmi < 4 ){
      return radius;
    }
    radius = sx;
  }
  return radius;
}

/**
* According to the table in http://earthquake.usgs.gov/earthquakes/shakemap/background.php#wald99b.
* MMI=2 is skipped.
*/
export function getMMI(pgv){
  if( pgv < 0.1 ) return 1;
  else if( pgv < 1.1 ) return 3;
  else if( pgv < 3.4 ) return 4;
  else if( pgv < 8.1 ) return 5;
  else if( pgv < 16  ) return 6;
  else if( pgv < 31  ) return 7;
  else if( pgv < 60  ) return 8;
  else if( pgv < 116 ) return 9;
  else return 10;
}
/**
* Calculate PGV at the surface distance sx from the epicenter.
* According to http://www.data.jma.go.jp/svd/eew/data/nc/katsuyou/reference.pdf
*/
export function calculatePGV(mw, depth, sx){
  let l = Math.pow(10, 0.5*mw-1.85);
  let x = Math.max(sx / Math.cos(Math.atan2(depth, sx)) - l * 0.5, 3);
  let pgv600 = Math.pow(10, 0.58*mw+0.0038*depth-1.29-log10(x+0.0028*Math.pow(10,0.5*mw)-0.002*x));
  let pgv700 = pgv600 * 0.9;
  let avs = 600;
  let arv = Math.pow(10, 1.83-0.66*log10(avs));
  let pgv = arv*pgv700;

  return pgv;
}

/**
* Math.log10 seems not yet supported by all devices, so we define it here.
*/
function log10(value){
  return Math.log(value) / Math.log(10);
}
