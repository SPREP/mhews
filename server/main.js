import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check'

import {Warnings} from '../imports/api/warnings.js';
import {WeatherForecasts} from '../imports/api/weather.js';

var request = require('request');

Meteor.startup(() => {

  Meteor.methods({
    publishWeatherForecast: publishWeatherForecast,
    publishWarning: publishWarning,
    cancelWarning: cancelWarning
  })
});

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

function publishWarning(warning){

  check(this.connection, Match.Where(isClientIpAllowed));
  check(warning.type, Match.Where(checkWarningType));
  check(warning.level, String);
  check(warning.in_effect, Match.OneOf(true, false));
  check(warning.issued_at, Date);
  check(warning.description, String);

  if( warning.type == "tsunami"){
    check(warning.epicenter, {lat: Number, lng: Number});
    check(warning.mw, Number);
    check(warning.depth, Number);
  }

  Meteor.defer(function(){
    sendFcmNotification(warning);
  })

  return Warnings.insert(warning);
}

function cancelWarning(bulletinId, type){
  const bulletin = Warnings.findByBulletinId(bulletinId);
  check(bulletin, Object);
  if( bulletin.in_effect ){
    Warnings.cancelWarning(bulletin);
  }
}

function publishWeatherForecast(forecast){
  console.log("Enter publishWeatherForecast.");

  check(this.connection, Match.Where(isClientIpAllowed));
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

function sendFcmNotification(warning){
  const fcmApiKey = Meteor.settings.fcmApiKey;

  const headers = {
    "Content-Type": "application/json",
    "Authorization": "key="+fcmApiKey
  }
  const options = {
    url: "https://fcm.googleapis.com/fcm/send",
    method: "POST",
    headers: headers,
    json: getWarningMessageForFcm(warning)
  }
  request.post(options, function(error, response){
    if (!error && response.statusCode == 200) {
      console.log("FCM notification was sent for a warning successfully.");
    } else {
      console.log('error: '+ response.statusCode+ " "+response.statusMessage);
    }
  });
}

function getWarningMessageForFcm(warning){
  const fcmMessage = {
    "to": "/topics/disaster",
    "priority": "high",
    "notification" : {
      "body" : warning.type + " " + warning.level,
      "title" : "Disaster",
      "click_action" : "FCM_PLUGIN_ACTIVITY",
      "sound": "default",
      "icon" : "myicon"
    },
    "data" : {
      "type": warning.type,
      "level": warning.level,
      "in_effect": warning.in_effect,
      "issued_at": warning.issued_at,
      "description": warning.description
    }
  };

  if( warning.type == "tsunami" || warning.type == "earthquake" ){
    const mw = warning.mw;
    fcmMessage.notification.body = "Earthquake (Magnitude "+mw+")";
    fcmMessage.data.epicenter_lat = warning.epicenter.lat;
    fcmMessage.data.epicenter_lng = warning.epicenter.lng;
    fcmMessage.data.mw = mw;
    fcmMessage.data.depth = warning.epicenter.depth;
  }
  else if( warning.type == "heavyRain" ){
    fcmMessage.data.area = warning.area;
    fcmMessage.data.direction = warning.direction;
  }
  else if( warning.type == "cyclone" ){
    fcmMessage.data.name = warning.name; // Name of the TC
    fcmMessage.data.category = warning.category;
  }

  console.log(JSON.stringify(fcmMessage));

  return fcmMessage;
}
