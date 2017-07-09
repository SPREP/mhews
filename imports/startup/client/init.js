import Warnings from '../../api/client/warnings.js';
import {Preferences} from '../../api/client/preferences.js';
import {playSound} from '../../api/client/mediautils.js';
import ReceptionTracker from '../../api/receptionTracker.js';
import PushClientFactory from '../../api/client/pushclientFactory.js';

/* i18n */
import i18n from '../../api/i18n.js';

/* This plugin captures the tap event in React. */
import injectTapEventPlugin from 'react-tap-event-plugin';

import {initRouterWithAdminPage} from '../../api/client/route.jsx';

import FileCache from '../../api/client/filecache.js';
import Config from '/imports/config.js';

let pushClient = null;

Meteor.startup(()=>{

  // These initializations are needed before rendering GUI.
  i18n.init();
  Preferences.onChange("language", i18n.changeLanguage);

  initTapEventPlugin();

  // Call this function after the initTapEventPlugin().
  // Otherwise, some material-ui components won't work.
  initRouterWithAdminPage();
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

  pushClient = PushClientFactory.getInstance();
  pushClient.start(onPushReceive);

  Tracker.autorun(()=>{
    pushClient.receiveExerciseMessages(Preferences.load("exercise") == "true");
  });

  // Maximum distance to receive earthquake information.
  Tracker.autorun(()=>{
    pushClient.subscribe("distance", Preferences.load("quakeDistance"));
  })
}

function subscribeForCollections(){
  // To receive the data from the warnings collection
  Meteor.subscribe('warnings');

  // To receive the data from the cycloneBulletin collection
  Meteor.subscribe('cycloneBulletins');

  Meteor.subscribe('tideTable');

}

function cacheFiles(){
  const cacheFiles = Config.cacheFiles;
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

// Enqueue the sound effect to avoid multiple sound files are played
// at the same time, especially when the app starts up.
function playSoundEffect(warning, oldWarning){
  console.log("WarningList.playSoundEffect()");
  if( !warning.in_effect && warning.type == "information"){
    // Don't play sound for the cancellation of information.
    return;
  }

  const config = Config.notificationConfig[warning.type];
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

/*
  Callback after a push message was received.
*/
function onPushReceive(data){
  console.log("Push data received."+JSON.stringify(data));

  Meteor.defer(()=>{
    ReceptionTracker.onBackgroundReception({
      bulletinId: data.bulletinId,
      type: data.type,
      level: data.level,
      in_effect: data.in_effect,
      issued_at: data.issued_at
    });
  })

  Warnings.upsert({_id: data._id}, data);
  

}
