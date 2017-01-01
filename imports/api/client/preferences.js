/* global Ground */

const keys = ["language", "district", "appInitialized"];

class PreferencesClass {

  constructor(){
    this.cache = {};
    keys.forEach((key)=>{
      this.cache[key] = new ReactiveVar(undefined);
    });
    this.collection = new Ground.Collection("preferences");
    this.collection.find({}).observe({
      added: ({key, value})=>{this.cache[key].set(value)},
      changed: ({key, value})=>{this.cache[key].set(value)},
      removed: ({key})=>{this.cache[key].set(undefined)}
    });
    this.loaded = new ReactiveVar(false);

    // FIXME Better way to catch this event??
    const intervalId = setInterval(()=>{
      if(this.collection.isLoaded){
        this.loaded.set(true);
        clearInterval(intervalId);
      }
    }, 100);
  }

  save(key, value){
    check(key, Match.OneOf(...keys));
    this.collection.upsert({key: key}, {key: key, value: value});
  }

  // Reactive function to return the latest value for the key
  // TODO Rename this to "get"
  load(key){
    return this.cache[key].get();
  }

  isLoaded(){
    return this.loaded.get();
  }
}

export const Preferences = new PreferencesClass();
