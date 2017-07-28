import { Meteor } from 'meteor/meteor';

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

  sender(sender){
    this.sender = sender;
    return this;
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

    this.sender.post(this, onSuccess, onError);
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
