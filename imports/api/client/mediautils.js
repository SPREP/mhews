/* global Media */

let soundEffectQueue = [];
let timer = null;

// Play the given alarm sound file for warning the user.
// To avoid multiple sound files to be played in parallel, this function waits for a certain period
// and play the most significant alarm sound file given during the period.
export function playSound(soundFile){
  soundEffectQueue.push(soundFile);
  let selectedSound = null;
  if( timer == null ){
    timer = window.setTimeout(()=>{
      soundEffectQueue.forEach((sound)=>{
        selectedSound = selectedSound == null ? sound : selectMoreSignificant(selectedSound, sound);
      });
      soundEffectQueue = [];
      timer = null;
      playSoundNoDelay(selectedSound);
    }, 1000);
  }
}

export function playSoundNoDelay(file){
  // TODO It seems the code below does not work well with iOS
  // http://stackoverflow.com/questions/36291748/play-local-audio-on-cordova-in-meteor-1-3

  if( !Meteor.isCordova ){
    return;
  }

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

// TODO: To be generalized by using a property indicating the significance.
function selectMoreSignificant(sound1, sound2){
  if( sound1 == "tsunami_warning.wav"){
    return sound1;
  }
  else{
    return sound2;
  }
}
