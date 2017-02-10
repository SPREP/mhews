import { Meteor } from 'meteor/meteor';

import {Warnings} from '../../api/server/warnings.js';
import {CycloneBulletins} from '../../api/server/bulletin.js';
import {WeatherForecasts, publishWeatherForecast} from '../../api/server/weather.js';
import {TideTableCollection} from '../../api/tidetable.js';
import {PushServer} from '../../api/server/pushserver.js';
import {ReceptionTrackerCollection} from '../../api/receptionTracker.js';

Meteor.startup(() => {

  Meteor.methods({
    publishWeatherForecast: publishWeatherForecast,
    publishWarning: Warnings.publishWarning,
    cancelWarning: Warnings.cancelWarning,
    publishBulletin: CycloneBulletins.publishBulletin,
    cancelBulletin: CycloneBulletins.cancelBulletin
  });

  startPublishingCycloneBulletins();
  startObsoleteOldInformation();
  startPublishingWarnings();
  startPublishingWeather();
  startPublishingTideTable();
  startObservingReceptionTracker();
});

function startObservingReceptionTracker(){
  ReceptionTrackerCollection.find({reception_date: {"$gte": new Date()}}).observe({
    added: (message)=>{
      console.log("Reception tracker message : "+JSON.stringify(message));
    }
  });
}

function startPublishingCycloneBulletins(){

  // The 2nd argument must use "function", not the arrow notations.
  // See this guide https://guide.meteor.com/data-loading.html
  Meteor.publish('cycloneBulletins', function() {
    // Only publish the forecasts which is in effect.
    // Returns the Cursor, not each document.
    return CycloneBulletins.find({'in_effect': true});
  });
}

function startPublishingTideTable(){

  TideTableCollection.find({
    dateTime: {"$exists": false}
  }).observe({
    added: function(tide){
      const dateTime = moment(tide.date+" "+tide.time, "MM/DD/YY HH:mm");
      // Add 1 hour during the daylight saving time.
      // Reference: http://www.bom.gov.au/ntc/IDO60008/IDO60008.201701.pdf
      if( dateTime.isDST() ){
        dateTime.add(1, "hours");
      }
      TideTableCollection.update({"_id": tide._id}, {"$set": {dateTime: dateTime.utc().toDate()}});
    }
  });

  // The 2nd argument must use "function", not the arrow notations.
  // See this guide https://guide.meteor.com/data-loading.html
  Meteor.publish('tideTable', function() {
    const now = moment();

    return TideTableCollection.find(
      {
        dateTime: {"$gte": now.subtract(5, "days").toDate(), "$lt": now.add(3, "months").toDate()}
      }
    );
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

function obsoleteOldInformation(){
  const before24hours = moment().subtract(24, 'hours').toDate();
  console.log("Earthquake info older than "+before24hours+" will be in_effect.");
  // Use the date_time instead of the issued_at, as the issued_at isn't reliable due to the IBL.
  Warnings.update(
    {"level": "information", "in_effect": true, "date_time": {"$lt": before24hours}},
    {"$set": {"in_effect": false}},
    {multi: true}
  );

}

function startObsoleteOldInformation(){
  // Check if there are any obsolete information at the startup.
  Meteor.defer(Meteor.bindEnvironment(obsoleteOldInformation));
  // Start the timer which invalidates old information every hour.
  Meteor.setInterval(Meteor.bindEnvironment(obsoleteOldInformation), 3600 * 1000);

}

function startPublishingWarnings(){

  // The 2nd argument must use "function", not the arrow notations.
  // See this guide https://guide.meteor.com/data-loading.html
  Meteor.publish('warnings', function(){
    // Only returns the effective warnings.
    return Warnings.find({in_effect: true});
  });

  new PushServer().start();
}
