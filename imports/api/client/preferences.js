const keys = ["language", "district", "appInitialized", "exercise"];

// Developer's note:
// Tried two implementations: LocalStorage and GroundDB.
// The startup time of the LocalStorage was faster than the GroundDB,
// so LocalStorage was chosen.

const defaultPreferences = {
  "language": "en",
  "district": "upolu-north-northwest",
  "exercise": "false"
};

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
    return value ? value : defaultPreferences[key];
  }

  isLoaded(){
    return this.loaded.get();
  }
}

export const Preferences = new PreferencesClass();
