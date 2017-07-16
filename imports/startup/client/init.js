import Warnings from '../../api/client/warnings.js';
import {Preferences} from '../../api/client/preferences.js';
import {playSound} from '../../api/client/mediautils.js';
import ReceptionTracker from '../../api/receptionTracker.js';
import {FlowRouter} from 'meteor/kadira:flow-router';

/* i18n */
import i18n from '../../api/i18n.js';

/* This plugin captures the tap event in React. */
import injectTapEventPlugin from 'react-tap-event-plugin';

import {initFlowRouter} from '../../api/client/flowroute.jsx';

import Config from '/imports/config.js';

let pushClient = null;

FlowRouter.wait();

/* global navigator */

Meteor.startup(()=>{

  // These initializations are needed before rendering GUI.
  i18n.init();
  Preferences.onChange("language", i18n.changeLanguage);

  initTapEventPlugin();

  // Call this function after the initTapEventPlugin().
  // Otherwise, some material-ui components won't work.
//  initRouterWithAdminPage();
  initFlowRouter();
  FlowRouter.initialize();

  // TODO: Try to move this after component mounted,
  // so that the load of moment is done after the top page is rendered.
  loadMoment();

  hideSplashScreen();
});

// Initializations that can be deferred after the GUI is rendered.
// To be executed in the componentDidMount() of the App.
export function initAfterComponentMounted(){

  Meteor.setTimeout(()=>{
    initPushClient();
    subscribeForCollections();
    startWarningObserver();

  }, 5000);
//  configReloader();
}

function loadMoment(){
  // Set the global variable moment.
  import("moment").then(({default: m})=>{
    moment = m;
  })
  import("geolib").then(({default: m})=>{
    geolib = m;
  })

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

  if( pushClient ){
    return;
  }

  import('../../api/client/pushclientFactory.js').then(({default: PushClientFactory})=>{

    pushClient = PushClientFactory.getInstance();
    pushClient.start(onPushReceive);

    Tracker.autorun(()=>{
      pushClient.receiveExerciseMessages(Preferences.load("exercise") == "true");
    });

    // Maximum distance to receive earthquake information.
    Tracker.autorun(()=>{
      pushClient.subscribe("distance", Preferences.load("quakeDistance"));
    })
  });
}

function subscribeForCollections(){
  // To receive the data from the warnings collection
  Meteor.subscribe('warnings');

  // To receive the data from the cycloneBulletin collection
  Meteor.subscribe('cycloneBulletins');

  Meteor.subscribe('tideTable');

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

function onPushReceive(data){
  console.log("Push message received."+JSON.stringify(data));

  Meteor.defer(()=>{

    ReceptionTracker.onBackgroundReception({
      bulletinId: data.bulletinId,
      type: data.type,
      level: data.level,
      in_effect: data.in_effect,
      issued_at: data.issued_at
    });
  })

}

function hideSplashScreen(){
  if( Meteor.isCordova ){
    Meteor.defer(()=>{
      navigator.splashscreen.hide();
    })
  }
}
