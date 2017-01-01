import {Warnings} from '../../api/warnings.js';
import {Preferences} from '../../api/preferences.js';
import {playSound} from '../../api/mediautils.js';
/* i18n */
import i18nConfig from '../../api/i18n.js';
import i18n from 'i18next';

Meteor.startup(()=>{
  // To receive the data from the warnings collection
  Meteor.subscribe('warnings');

  // To receive the data from the cycloneBulletin collection
  Meteor.subscribe('cycloneBulletins');


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

  i18n.init(i18nConfig);
  starti18nTracker();

})

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

function playSoundEffect(warning, oldWarning){
  console.log("WarningList.playSoundEffect()");

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
