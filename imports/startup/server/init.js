import { Meteor } from 'meteor/meteor';

import {Warnings} from '../../api/warnings.js';
import {CycloneBulletins} from '../../api/bulletin.js';
import {WeatherForecasts, AdminWeatherForecasts, publishWeatherForecast} from '../../api/weather.js';
import {sendFcmNotification} from '../../api/fcm.js';

Meteor.startup(() => {

  Meteor.methods({
    publishWeatherForecast: publishWeatherForecast,
    publishWarning: Warnings.publishWarning,
    cancelWarning: Warnings.cancelWarning,
    publishBulletin: CycloneBulletins.publishBulletin,
    cancelBulletin: CycloneBulletins.cancelBulletin
  });

  startPublishingCycloneBulletins();
  startPublishingWarnings();
  startPublishingWeather();
});

function startPublishingCycloneBulletins(){

  // The 2nd argument must use "function", not the arrow notations.
  // See this guide https://guide.meteor.com/data-loading.html
  Meteor.publish('cycloneBulletins', function() {
    // Only publish the forecasts which is in effect.
    // Returns the Cursor, not each document.
    return CycloneBulletins.find({'in_effect': true});
  });
}

function startPublishingWeather(){

  // The 2nd argument must use "function", not the arrow notations.
  // See this guide https://guide.meteor.com/data-loading.html
  Meteor.publish('weatherForecast', function() {
    // Publish the recent 3 forecasts regardless if it is in effect,
    // so that the admin dashboard can receive the forecasts that hasn't been in effect yet.
    // Returns the Cursor, not each document.
    return WeatherForecasts.find({}, {
      sort: {issued_at: -1},
      limit: 3
    });
  });

}

function startPublishingWarnings(){
  // Start the timer which invalidates old information every 10min.
  setInterval(Meteor.bindEnvironment(function(){
    const before24hours = moment().subtract(24, 'hours').toDate();
    Warnings.update(
      {"type": "information", "in_effect": true, "issued_at": {"$lt": before24hours}},
      {"$set": {"in_effect": false}},
      {multi: true});
  }), 600 * 1000);

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
  if( !warning.in_effect && warning.level == "information"){
    // Don't send notification for expiry of Information.
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
