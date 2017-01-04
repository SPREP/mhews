import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check'

import {Warnings} from '../imports/api/warnings.js';
import {WeatherForecasts} from '../imports/api/weather.js';
import {sendFcmNotification} from '../imports/api/fcm.js';

Meteor.startup(() => {

  Meteor.methods({
    publishWeatherForecast: publishWeatherForecast,
    publishWarning: publishWarning,
    cancelWarning: Warnings.cancelWarning
  });

  startPublishingWarnings();
  startPublishingWeather();
});

function startPublishingWeather(){

  // Start the timer which invalidates old forecasts every 10min.
  setInterval(Meteor.bindEnvironment(function(){
    const before24hours = moment().subtract(24, 'hours').toDate();
    WeatherForecasts.update(
      {"in_effect": true, "issued_at": {"$lt": before24hours}},
      {"$set": {"in_effect": false}},
      {multi: true});
  }), 600 * 1000);

  // The 2nd argument must use "function", not the arrow notations.
  // See this guide https://guide.meteor.com/data-loading.html
  Meteor.publish('weatherForecast', function() {
    // Only publish the forecasts which is in effect.
    // Returns the Cursor, not each document.
    return WeatherForecasts.find({'in_effect': true});
  });
}

function startPublishingWarnings(){
  // The 2nd argument must use "function", not the arrow notations.
  // See this guide https://guide.meteor.com/data-loading.html
  Meteor.publish('warnings', function(){
    // Only returns the effective warnings.
    return Warnings.find({in_effect: true});
  });

  // Observe the Warnings collection to send FCM when the result set has changed.
  // FIXME This code will be executed by two or more servers.
  Warnings.find({in_effect: true}).observe({
    added: function(warning){
      console.log("Enter observe.added()");
      sendFcm(warning, Warnings.changeNeedsAttention(warning));
    },
    changed: function(newWarning, oldWarning){
      console.log("Enter observe.changed()");
      if( Warnings.hasNoSignificantChange(newWarning, oldWarning)){
        return;
      }
      sendFcm(newWarning, Warnings.changeNeedsAttention(newWarning, oldWarning));
    },
    removed: function(warning){
      console.log("Enter observe.removed()");
      // Here, the warning is effective document when it was in the result set (i.e. in_effect = true)
      // Change it to false so that the fcm.js chooses the right cancellation message.
      warning.in_effect = false;
      sendFcm(warning, false);
    }

  });
}

function sendFcm(warning, needsAttention){
  if( warning.in_effect && warning.is_user_notified ){
    // FCM message has already been sent for this warning.
    return;
  }
  Meteor.defer(function(){
    if( !warning.area ){
      // If a warning was issued without area specified, let's set it to the whole Samoa.
      warning.area = "Samoa";
    }
    sendFcmNotification(
      Warnings.toFcmMessage(warning, soundEffectFile(warning, needsAttention)),
      warning.area,
      warning.direction
    );
    // This will prevent the server from sending the FCM message twice or more.
    Warnings.update({_id: warning._id}, {"$set": {is_user_notified: true}});
  })
}

function soundEffectFile(warning, needsAttention){
  let soundFile;
  if( needsAttention ){
    soundFile = Meteor.settings.public.notificationConfig[warning.type].sound;
  }

  return soundFile ? soundFile : "default";
}

function checkWarningType(type){
  const hazardTypes = Warnings.getHazardTypes();
  for(let i= 0; i< hazardTypes.length; i++ ){
    if( hazardTypes[i] == type ) return true;
  }
  return false;
}

function isClientIpAllowed(connection){
  if( !connection ) return true; // Connection from the server itself
  const address = connection.clientAddress;

  // Accept from local network
  if( address == "127.0.0.1" ) return true;
  if( address.startsWith("10.1.") ) return true;
  if( address.startsWith("10.2.") ) return true;
  if( address.startsWith("192.168.") ) return true;

  const ipList = getAllowedClientIpList();
  for(let i= 0; i< ipList.length; i++){
    if( address == ipList[i]){
      return true;
    }
  }

  return false;
}

function getAllowedClientIpList(){
  if( Meteor.settings.allowedClientIPList ){
    return Meteor.settings.allowedClientIPList;
  }
  else{
    return [];
  }
}

/*
  Definitions of remote methods.

*/

function publishWarning(warning){
  console.log("Enter publishWarning");

  check(this.connection, Match.Where(isClientIpAllowed));
  check(warning.bulletinId, Number);
  check(warning.type, Match.Where(checkWarningType));
  check(warning.level, Match.OneOf(...Warnings.listLevels()));
  check(warning.in_effect, Match.OneOf(true, false));
  check(warning.issued_at, Date);
  check(warning.description_en, String);
  check(warning.description_ws, String);

  if( warning.type == "tsunami"){
    check(warning.epicenter, {lat: Number, lng: Number});
    check(warning.mw, Number);
    check(warning.depth, Number);
  }
  else if( warning.type == "heavyRain"){
    check(warning.area, String);
    check(warning.direction, String);
  }

  if( warning.in_effect ){
    return Warnings.insert(warning);
  }
  else {
    // FIXME: This cancellation does not work because IBL gives different bulletinNumber
    // from the warning bulletin to be cancelled.
    return Warnings.cancelWarning(warning);
  }
}

function publishWeatherForecast(forecast){
  console.log("Enter publishWeatherForecast.");

  check(this.connection, Match.Where(isClientIpAllowed));
//  check(forecast.bulletinId, Number);
  check(forecast.issued_at, Date);
  check(forecast.lang, Match.OneOf("en", "ws"));
  check(forecast.situation, String);
  check(forecast.forecasts, [{
    district: String,
    date: Date,
    forecast: String
  }]);

  forecast.in_effect = true;

  return WeatherForecasts.insert(forecast);
}
