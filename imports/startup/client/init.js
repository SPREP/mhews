import {Warnings} from '../../api/warnings.js';
import {Preferences} from '../../api/client/preferences.js';
import {playSound} from '../../api/client/mediautils.js';
import {WeatherForecasts} from '../../api/weather.js';

/* i18n */
import i18nConfig from '../../api/i18n.js';
import i18n from 'i18next';

import {initFcmClient} from '../../api/fcm.js';

/* This plugin captures the tap event in React. */
import injectTapEventPlugin from 'react-tap-event-plugin';

import {initRouter} from '../../api/client/route.jsx';

/* global Reloader */

Meteor.startup(()=>{

  // These initializations are needed before rendering GUI.
  i18n.init(i18nConfig);
  starti18nTracker();
  initTapEventPlugin();

  // Call this function after the initTapEventPlugin().
  // Otherwise, some material-ui components won't work.
  initRouter();

  // Initializations that can be deferred. Hope it reduces the delay before the first screen appears.
  Meteor.defer(()=>{
    configReloader();
    initFcm();
    subscribeForCollections();
    startWarningObserver();
  })
})

function initTapEventPlugin(){

  /**
  * This is needed for the material-ui components handle click event.
  * shouldRejectClick disables the onClick, but this is needed to avoid ghost click.
  */
  if( Meteor.isCordova ){
    injectTapEventPlugin({
      shouldRejectClick: function () {
        return true;
      }
    });
  }
  else{
    injectTapEventPlugin();
  }

}

function initFcm(){

  if( Meteor.isCordova ){
    initFcmClient((data)=>{
      handleFcmNotification(data)
    });
  }
}

function configReloader(){
  Reloader.configure({
    check: false, // Check for new code every time the app starts
    refresh: 'start', // Refresh to already downloaded code on start (not on resume)
    idleCutoff: 1000 * 60 * 10  // Wait 10 minutes before treating a resume as a start
  });
}

function subscribeForCollections(){
  // To receive the data from the warnings collection
  Meteor.subscribe('warnings');

  // To receive the data from the cycloneBulletin collection
  Meteor.subscribe('cycloneBulletins');

  Meteor.subscribe('tideTable');

  WeatherForecasts.init();
}

function startWarningObserver(){

  // Observe the warnings collection and play the sound effect
  Warnings.findWarningsInEffect().observe({
    added: (warning)=>{
      console.log("observe.added");
      playSoundEffect(warning);
    },
    changed: (warning)=>{
      console.log("observe.changed");
      playSoundEffect(warning);
    },
    removed: (warning)=>{
      console.log("observe.removed");
      warning.in_effect = false;
      playSoundEffect(warning);
    }
  });
}

function starti18nTracker(){

  // Tracker to change the i18n setting when the language preference is changed.
  Tracker.autorun(()=>{
    i18n.changeLanguage(Preferences.load("language"), (error, _t) => {
      if( error ){
        console.error(error);
      }
    })
  });

}

// Enqueue the sound effect to avoid multiple sound files are played
// at the same time, especially when the app starts up.
function playSoundEffect(warning, oldWarning){
  console.log("WarningList.playSoundEffect()");
  if( !warning.in_effect && warning.type == "information"){
    // Don't play sound for the cancellation of information.
    return;
  }

  const config = Meteor.settings.public.notificationConfig[warning.type];
  if( !config ){
    console.error("Unknown hazard type "+warning.type);
    return;
  }
  if(Warnings.changeNeedsAttention(warning, oldWarning)){
    playSound(config.sound);
  }
  else{
    playSound("general_warning.mp3");
  }
}

// Unfortunately the FCM is unreliable.
// Don't rely on the FCM but observe the Meteor collection to notify the user of a new warning.
// So this function doesn't do anything.
function handleFcmNotification(fcmData){
  console.log("FCM data received."+JSON.stringify(fcmData));

}
