import Warnings from '../../api/client/warnings.js';
import {Preferences} from '../../api/client/preferences.js';
import {playSound} from '../../api/client/mediautils.js';
import ReceptionTracker from '../../api/receptionTracker.js';

/* i18n */
import i18nConfig from '../../api/i18n.js';
import i18n from 'i18next';

import {PushClient} from '../../api/client/pushclient.js';

/* This plugin captures the tap event in React. */
import injectTapEventPlugin from 'react-tap-event-plugin';

import {initRouter, initRouterWithAdminPage} from '../../api/client/route.jsx';

import FileCache from '../../api/client/filecache.js';

let pushClient = null;

/* global Reloader */

Meteor.startup(()=>{

  // These initializations are needed before rendering GUI.
  i18n.init(i18nConfig);
  starti18nTracker();
  initTapEventPlugin();

  // Call this function after the initTapEventPlugin().
  // Otherwise, some material-ui components won't work.
  if( Meteor.settings.public.withAdminDashboard ){
    initRouterWithAdminPage();
  }
  else{
    initRouter();
  }
});

// Initializations that can be deferred after the GUI is rendered.
// To be executed in the componentDidMount() of the App.
export function initAfterComponentMounted(){

  Meteor.setTimeout(()=>{
    initPushClient();
    subscribeForCollections();
    startWarningObserver();
    cacheFiles();

  }, 1000);
//  configReloader();
}

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

function initPushClient(){

  if( Meteor.isCordova ){
    pushClient = new PushClient();
    pushClient.start(onPushReceive);

    Tracker.autorun(()=>{
      pushClient.receiveExerciseMessages(Preferences.load("exercise") == "true");
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

}

function cacheFiles(){
  const cacheFiles = Meteor.settings.public.cacheFiles;
  for(let key in cacheFiles ){
    const url = cacheFiles[key];
    FileCache.add(url);
  }
}

let handleForWarningObserver;

function startWarningObserver(){

  Tracker.autorun(()=>{
    const joinExercise = Preferences.load("exercise") == "true";

    if( handleForWarningObserver ){
      handleForWarningObserver.stop();
    }

    // Observe the warnings collection and play the sound effect
    handleForWarningObserver = Warnings.findWarningsInEffect(undefined, undefined, undefined, joinExercise).observe({
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

  })
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
  if(warning.changeNeedsAttention(oldWarning)){
    playSound(config.sound);
  }
  else{
    playSound("general_warning.mp3");
  }
}

// Unfortunately the FCM is unreliable.
// Don't rely on the FCM but observe the Meteor collection to notify the user of a new warning.
// So this function doesn't do anything except for updating the tracker.
function onPushReceive(fcmData){
  console.log("FCM data received."+JSON.stringify(fcmData));

  Meteor.defer(()=>{
    ReceptionTracker.onBackgroundReception({
      bulletinId: fcmData.bulletinId,
      type: fcmData.type,
      level: fcmData.level,
      in_effect: fcmData.in_effect,
      issued_at: fcmData.issued_at
    });
  })

}
