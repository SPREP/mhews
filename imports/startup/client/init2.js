import {Preferences} from '../../api/client/preferences.js';
import {playSound} from '../../api/client/mediautils.js';
import Config from '/imports/config.js';

const surfaceChartUrl = Config.cacheFiles.surfaceChart;

const satelliteImageUrl = Config.cacheFiles.satelliteImage;

let pushClient = null;

// Initializations that can be deferred after the GUI is rendered.
// To be executed in the componentDidMount() of the App.
export function initAfterComponentMounted(){

  initPushClient();
  subscribeForCollections();
  startWarningObserver();
  cacheFiles();

//  configReloader();
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
  Meteor.defer(()=>{
    // To receive the data from the warnings collection
    Meteor.subscribe('warnings');

    // To receive the data from the cycloneBulletin collection
    Meteor.subscribe('cycloneBulletins');

    Meteor.subscribe('tideTable');
  })

}

let handleForWarningObserver;

function startWarningObserver(){

  Tracker.autorun(()=>{
    const joinExercise = Preferences.load("exercise") == "true";

    if( handleForWarningObserver ){
      handleForWarningObserver.stop();
    }

    import('../../api/client/warnings.js').then(({default: Warnings})=>{
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
      })
    })

  })
}

function onPushReceive(data){
  console.log("Push message received."+JSON.stringify(data));

  import('../../api/receptionTracker.js').then(({default: ReceptionTracker})=>{
    ReceptionTracker.onBackgroundReception({
      bulletinId: data.bulletinId,
      type: data.type,
      level: data.level,
      in_effect: data.in_effect,
      issued_at: data.issued_at
    });
  })

}

function cacheFiles(){

  import('../../api/client/filecache.js').then(({default: FileCache})=>{
    const cacheFiles = Config.cacheFiles;
    for(let key in cacheFiles ){
      const url = cacheFiles[key];
      console.log("Adding file cache for "+url);
      FileCache.add(url).refresh();
    }
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
