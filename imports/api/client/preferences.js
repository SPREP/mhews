import Config from '../../config.js';

const keys = ["language", "district", "appInitialized", "exercise", "quakeDistance"];

// Developer's note:
// Tried two implementations: LocalStorage and GroundDB.
// The startup time of the LocalStorage was faster than the GroundDB,
// so LocalStorage was chosen.

const defaultPreferences = Config.defaultPreferences;

// Class to save and load user preferences such as the language in a local storage,
// so that the user does not have to specify those preferences every time when app is used.
class PreferencesClass {

  constructor(){
    this.cache = {};
    this.loaded = new ReactiveVar(false);
    keys.forEach((key)=>{
      this.cache[key] = new ReactiveVar(undefined);
    });
    Meteor.defer(()=>{
      keys.forEach((key)=>{
        this.cache[key].set(window.localStorage.getItem(key));
      })
      this.loaded.set(true);
    })
  }

  save(key, value){
    check(key, Match.OneOf(...keys));
    this.cache[key].set(value);
    Meteor.defer(()=>{
      window.localStorage.setItem(key, value);
    })
  }

  load(key){
    const value = this.cache[key].get();
    return value != undefined ? value : defaultPreferences[key];
  }

  isLoaded(){
    return this.loaded.get();
  }

  onChange(key, callback){
    // Tracker to change the i18n setting when the language preference is changed.
    Tracker.autorun(()=>{
      callback(Preferences.load(key));
    });

  }

}

export const Preferences = new PreferencesClass();
