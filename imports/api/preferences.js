/* global Ground */

export const Preferences = new Ground.Collection("preferences");

Preferences.save = (key, value)=>{
  Preferences.upsert({key: key}, {key: key, value: value});
};

Preferences.load = (key)=>{
  const keyValue = Preferences.findOne({key: key});
  return keyValue ? keyValue.value: undefined;
};
