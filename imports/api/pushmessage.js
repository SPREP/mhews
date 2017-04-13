import { Meteor } from 'meteor/meteor';

const topicPrefix = Meteor.settings.public.topicPrefix;
const fcmApiKey = Meteor.settings.fcmApiKey;

const headers = {
  "Content-Type": "application/json",
  "Authorization": "key="+fcmApiKey
};

var request = require('request');

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

    this.send = this.send.bind(this);
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
  send(onSuccess, onError){

    Meteor.defer(()=>{
      this.doSend(onSuccess, onError);
    });

    this.resend.timerId = Meteor.setInterval(()=>{
      if( this.resend.repeated++ < this.resend.count &&
        ( this.resend.isCancelled && !this.resend.isCancelled()) ){
        // Don't call the callback functions for the repetitions.
        this.doSend();
      }
      else{
        Meteor.clearInterval(this.resend.timerId);
      }

    }, this.resend.interval * 1000);
  }

  doSend(onSuccess, onError){
    const topics = [];

    // Special handling for PACWAVE17 exercise to avoid sounding the tsunami alarm
    // by the old version of the app which cannot display exercise message properly.
    // To be removed after new versions have been deployed.
    if( this.body.data.is_exercise ){
      topics.push(topicPrefix + "_exercise");
    }
    else{
      topics.push(topicPrefix);
    }

    topics.forEach((topic)=>{

      this.body.to = "/topics/"+ topic;


      if( this.resend.collapseKey ){
        this.body.collapse_key = this.resend.collapseKey;
      }
      if( this.resend.count > 0 ){
        // The TTL must be equal or shorter than the interval
        const interval = this.resend.interval;
        this.body.time_to_live = this.body.time_to_live > interval ? interval : this.body.time_to_live;
      }

      console.log(JSON.stringify(this.body));

      const options = {
        url: "https://fcm.googleapis.com/fcm/send",
        method: "POST",
        headers: headers,
        json: this.body
      }
      request.post(options, Meteor.bindEnvironment((error, response)=>{
        if (!error && response.statusCode == 200) {
          console.log("FCM message was successfully sent on topic "+topic+" for warning "+this.warning.bulletinId);
          if( onSuccess ){
            console.log("FCM server response: "+JSON.stringify(response));
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
    })

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
