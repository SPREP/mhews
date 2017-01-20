const keys = ["language", "district", "appInitialized"];

// Tried two implementations: LocalStorage and GroundDB.
// The startup time of the LocalStorage was faster than the GroundDB,
// so LocalStorage was chosen.

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
    return this.cache[key].get();
  }

  isLoaded(){
    return this.loaded.get();
  }
}

export const Preferences = new PreferencesClass();
