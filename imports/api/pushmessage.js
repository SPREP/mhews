import { Meteor } from 'meteor/meteor';

var request = require('request');

const _ = require('lodash');

export class PushMessage {

  constructor(warning, body){
    this.warning = warning;
    this.body = body;
    this.serverError = {
      retryCount : 0,
      maxRetry : 6,
      intervalBase : 3 // Seconds
    }
    this.resend = {
      count: 0,
      repeated: 0,
      interval: 60, // seconds
      isCancelled: function(){ return false; }
    }
    // Set the default TTL (4 hours)
    this.body.time_to_live = 4 * 3600;

    this.sendToTopic = this.sendToTopic.bind(this);
    this.sendToToken = this.sendToToken.bind(this);
  }

  // Set the number of times to resend. 0 means that a message is sent once without resend.
  repeat(count){
    this.resend.count = count;
    return this;
  }

  // Set the interval between resend in seconds
  interval(interval){
    this.resend.interval = interval;
    return this;
  }

  // Set the collapse key on which the messages of the same kind is collapsed in the notification tray.
  collapse(key){
    if( key ){
      this.resend.collapseKey = key;
    }
    return this;
  }

  cancelIf(func){
    this.resend.isCancelled = func;
    return this;
  }

  // onSuccess: Callback when the FCM message was accepted by the Firebase server.
  // onError: Callback when the FCM message was not accepted after retry by the Firebase server.
  sendToTopic(topic, onSuccess, onError){
    this.topic = topic;
    this.body.to = "/topics/"+ topic;

//    this.sendWithRepetition(onSuccess, onError);
    this.sendOnce(Meteor.bindEnvironment(onSuccess), onError);
  }

  sendToToken(token, onSuccess, onError){
    this.body.to = token;

    this.sendWithRepetition(onSuccess, onError);
  }

  sendWithRepetition(onSuccess, onError){

    Meteor.defer(()=>{
      this.sendOnce(onSuccess, onError);
    });

    this.resend.timerId = Meteor.setInterval(()=>{
      if( this.resend.repeated++ < this.resend.count &&
        ( this.resend.isCancelled && !this.resend.isCancelled()) ){
        // Don't call the callback functions for the repetitions.
        this.sendOnce();
      }
      else{
        Meteor.clearInterval(this.resend.timerId);
      }

    }, this.resend.interval * 1000);
  }

  sendOnce(onSuccess, onError){

    if( this.resend.collapseKey ){
      this.body.collapse_key = this.resend.collapseKey;
    }
    if( this.resend.count > 0 ){
      // The TTL must be equal or shorter than the interval
      const interval = this.resend.interval;
      this.body.time_to_live = this.body.time_to_live > interval ? interval : this.body.time_to_live;
    }

    console.log(JSON.stringify(this.body));

    /*
      Send the message to both OneSignal and Fcm, until all the FCM client will be replaced by OneSignal client.
    */
    this.postOneSignalMessage(onSuccess, onError);
    this.postFcmMessage(onSuccess, onError);
  }

  postOneSignalMessage(onSuccess, onError){

    const restApiKey = Meteor.settings.oneSignalRestApiKey;
    const appId = Meteor.settings.public.oneSignalAppId;

    const oneSignalHeaders = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Basic "+restApiKey
    };

    const oneSignalOptions = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: oneSignalHeaders
    }

    const filters = [
      {"field": "tag", "key": this.topic, "relation": "=", "value": "true"}
    ]

    // https://documentation.onesignal.com/reference
    // OneSignal requires that the sound file excludes the file extension.
    const message = {
      app_id: appId,
      contents: {"en": this.body.notification.title},
      headings: {"en": this.body.notification.title},
      data: this.body.data,
      android_sound: removeFileExtension(this.body.notification.sound),
      ttl: this.body.time_to_live,
      priority: 10,
      filters: filters
    }

    console.log("Sending message to OneSignal "+JSON.stringify(message));

    const https = require('https');

    const req = https.request(oneSignalOptions,  (res)=> {
      res.on('data', function(data) {
        console.log("Response:");
        console.log(JSON.parse(data));
        if( onSuccess ){
          onSuccess(data);
        }
      });
    });

    req.on('error', function(e) {
      console.log("ERROR:");
      console.log(e);
      if( onError ){
        onError(e);
      }
    });

    req.write(JSON.stringify(message));
    req.end();
  }

  postFcmMessage(onSuccess, onError){
    const fcmApiKey = Meteor.settings.fcmApiKey;

    const fcmHeaders = {
      "Content-Type": "application/json",
      "Authorization": "key="+fcmApiKey
    };

    const options = {
      url: "https://fcm.googleapis.com/fcm/send",
      method: "POST",
      headers: fcmHeaders
    }

    const httpRequest = _.merge(options, {json: this.body});

    request.post(httpRequest, Meteor.bindEnvironment((error, response, body)=>{
      if (!error && response.statusCode == 200) {
        console.log("FCM message was successfully sent for warning "+this.warning.bulletinId);
        console.log("Response body = "+ JSON.stringify(body));
        if( onSuccess ){
          onSuccess(this.warning);
        }
      }
      else {
        if( error ){
          console.log("error: "+error);
        }
        if( response ){
          console.log('error response: '+ response.statusCode+ " "+response.statusMessage);
        }

        if( isServerError(response.statusCode) && this.serverError.retryCount++ < this.serverError.maxRetry ){
          this.scheduleRetryOnError();
        }
        else{
          console.error("FCM message couldn't be sent for warning "+this.warning.bulletinId);
          if( onError ){
            onError(this.warning, response);
          }
        }
      }
    }));
  }

  scheduleRetryOnError(){
    console.log("Retry sending FCM message after "+this.getInterval()+" seconds");
    Meteor.setTimeout(this.send, this.getInterval()*1000);

  }

  // Firebase requests that the App server must implement exponential backoff.
  getInterval(){
    return Math.pow(this.serverError.intervalBase, this.serverError.retryCount);
  }
}

function isServerError(statusCode){
  return statusCode >= 500;
}

function removeFileExtension(soundFile){
  soundFile = soundFile.replace(new RegExp("\.wav$"), "");
  soundFile = soundFile.replace(new RegExp("\.mp3$"), "");

  return soundFile;
}
