import { Meteor } from 'meteor/meteor'
import {getAreaId} from '../hazardArea.js';

//var request = require('request');
var request;

if( Meteor.isServer ){
  request = require('request');
}

const topicPrefix = Meteor.settings.public.topicPrefix;

export const sendFcmNotification = (jsonBody, area, direction) => {
  const fcmApiKey = Meteor.settings.fcmApiKey;
  // For some reason, sending to multiple topics by using the "condition" attribute
  // didn't work. Send the same message twice to two topics by using the "to" attribute.

  const areaId = topicPrefix +"_" + getAreaId(area, direction);
//  jsonBody.condition = "'"+topicPrefix+"' in topics || '"+areaId+"' in topics";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": "key="+fcmApiKey
  };

  [topicPrefix, areaId].forEach((topic)=>{

    jsonBody.to = "/topics/"+topic;

    console.log(JSON.stringify(jsonBody));

    const options = {
      url: "https://fcm.googleapis.com/fcm/send",
      method: "POST",
      headers: headers,
      json: jsonBody,
    }
    request.post(options, function(error, response){
      if (!error && response.statusCode == 200) {
        console.log("FCM notification was sent for a warning successfully.");
      } else {
        console.log('error: '+ response.statusCode+ " "+response.statusMessage);
      }
    });
  });
}
