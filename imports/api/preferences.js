/* global Ground */

class PreferencesClass {

  init(){
    if( !this.collection ){
      this.collection = new Ground.Collection("preferences");
    }
  }

  save(key, value){
    this.collection.upsert({key: key}, {key: key, value: value});
  }

  load(key){
    if( !this.collection ) return undefined;

    const keyValue = this.collection.findOne({key: key});
    return keyValue ? keyValue.value: undefined;
  }

  isLoaded(){
    return this.collection ? this.collection.isLoaded : false;
  }
}

export const Preferences = new PreferencesClass();
