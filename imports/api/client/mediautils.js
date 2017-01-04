/* global Media */

export const playSound = (file) => {
  // TODO It seems the code below does not work well with iOS
  // http://stackoverflow.com/questions/36291748/play-local-audio-on-cordova-in-meteor-1-3

  const url = document.location.origin+"/sounds/"+file;
  console.log("url = "+url);
  let media = new Media(url,
    ()=>{
      console.log("Media success.");
      media.release();
    },
    (err)=>{
      console.error("Media error: "+err.message);
    }
  );

  if( media ){
    media.setVolume(1.0);
    media.play();
  }
  else{
    console.error("media is not defined or null.");
  }
}
