import { Meteor } from 'meteor/meteor';
import Warnings from '../warnings.js';
import WarningFactory from '../model/warningFactory.js';

var request = require('request');

const topicPrefix = Meteor.settings.public.topicPrefix;
const fcmApiKey = Meteor.settings.fcmApiKey;

const headers = {
  "Content-Type": "application/json",
  "Authorization": "key="+fcmApiKey
};

// PushServer checks incoming warning messages in the Warning Collection,
// and send push notification to the mobile clients.
// The current implementation relies on the Google Firebase.
class PushServer {

  // TODO
  // The PushServer should be started on only one server when multiple servers are off-loading.
  start(){
    // Observe the Warnings collection to send push message when the result set has changed.
    this.handle = Warnings.find({in_effect: true}).observe(withTranslation({
      added: function(warning){
        console.log("Enter observe.added()");
        pushWarning(warning, warning.changeNeedsAttention());
      },
      changed: function(newWarning, oldWarning){
        console.log("Enter observe.changed()");
        if( newWarning.hasNoSignificantChange(oldWarning)){
          return;
        }
        pushWarning(newWarning, newWarning.changeNeedsAttention(oldWarning));
      },
      removed: function(warning){
        console.log("Enter observe.removed()");
        // Here, the warning is effective document when it was in the result set (i.e. in_effect = true)
        // Change it to false so that the pushWarning chooses the right cancellation message.
        warning.in_effect = false;
        pushWarning(warning, false);
      }

    }));

  }

  stop(){
    if( this.handle ){
      this.handle.stop();
      this.handle = null;
    }
  }
}

function withTranslation(observer){
  const observerWithTranslation = {};
  if( observer.added ){
    observerWithTranslation.added = (entity)=>{observer.added(WarningFactory.create(entity))};
  }
  if( observer.removed ){
    observerWithTranslation.removed = (entity)=>{observer.removed(WarningFactory.create(entity))};
  }
  if( observer.changed ){
    observerWithTranslation.changed = (newEntity, oldEntity)=>{observer.changed(WarningFactory.create(newEntity), WarningFactory.create(oldEntity))};
  }

  return observerWithTranslation;
}

function pushWarning(warning, needsAttention){
  if( warning.in_effect && warning.is_user_notified ){
    // FCM message has already been sent for this warning.
    return;
  }
  if( !warning.in_effect && warning.level == "information"){
    // Don't send notification for expiry of Information.
    return;
  }
  const message = new PushMessage(warning, needsAttention);
  if( warning.type == "tsunami" && warning.isMoreSignificant("information") && warning.in_effect ){
    message.repeat(5).interval(3*60).collapse(warning.type).cancelIf(()=>{
      return Warnings.isCancelled(warning._id) || Warnings.hasSevererWarning(warning._id);
    });
  }
  message.send((warning)=>{
    // This will prevent the server from sending the push message twice or more.
    Warnings.update({_id: warning._id}, {"$set": {is_user_notified: true}});
  });
}

export class PushMessage {

  constructor(warning, needsAttention){
    this.warning = warning;
    this.body = warningToFcmMessage(warning, soundEffectFile(warning, needsAttention));
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

          if( this.serverError.retryCount++ < this.serverError.maxRetry ){
            console.log("Retry sending FCM message after "+this.getInterval()+" seconds");
            Meteor.setTimeout(this.send, this.getInterval()*1000);
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

  // Firebase requests that the App server must implement exponential backoff.
  getInterval(){
    return Math.pow(this.serverError.intervalBase, this.serverError.retryCount);
  }
}

function warningToFcmMessage(warning, soundFile){
  let title = warning.type + " " + warning.level;
  if( warning.is_exercise ){
    title = "exercise".toUpperCase() + " " + title;
  }
  // FIXME: warning.area and warning.direction are not defined for Tsunami warning.
  if( !warning.area ){
    warning.area = "Samoa";
  }
  if( !warning.direction ){
    warning.direction = "Whole Area";
  }

  const body = warning.direction ? warning.area + " " + warning.direction : warning.area;
  // Destination topics are set by the send function. Don't set "to" here.
  // "click_action" is needed for cordova-plugin-fcm. However, setting it will prevent
  // the app launch from tapping the notification if cordova-plugin-firebase is used.
  const fcmMessage = {
    "priority": "high",
    "notification" : {
      "title" : title,
      "body" : body,
      //        "click_action" : "FCM_PLUGIN_ACTIVITY",
      "sound": soundFile,
      "icon" : "myicon"
    },
    "data" : {
      "type": warning.type,
      "level": warning.level,
      "bulletinId": warning.bulletinId,
      "in_effect": warning.in_effect,
      "is_exercise": warning.is_exercise,
      "issued_at": warning.issued_at
    }
  };

  Meteor.settings.public.languages.forEach((lang)=>{
    fcmMessage.data["description_"+lang] = warning["description_"+lang];
  })

  if( !warning.in_effect ){
    fcmMessage.notification.title = "Cancel "+title;
  }

  if( warning.type == "tsunami" || warning.type == "earthquake" ){
    const mw = warning.mw;
    fcmMessage.notification.body = body + " (Magnitude "+mw+")";
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

  return fcmMessage;
}

function soundEffectFile(warning, needsAttention){
  let soundFile;
  if( needsAttention ){
    soundFile = Meteor.settings.public.notificationConfig[warning.type].sound;
  }

  return soundFile ? soundFile : "default";
}

export default new PushServer();
