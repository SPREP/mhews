import {Meteor} from 'meteor/meteor';

import Warnings from '../warnings.js';
import WarningFactory from '../model/warningFactory.js';

import PushMessageSenderFcm from './pushmessageSenderFcm.js';
import PushMessageSenderOneSignal from './pushmessageSenderOneSignal.js';

const topicPrefix = Meteor.settings.public.topicPrefix;

// Push message services used for sending push message.
const senders = [
  {
    name: "OneSignal",
    sender: PushMessageSenderOneSignal
  },{
    name: "FCM",
    sender: PushMessageSenderFcm
  }
];

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

  if( !warning.in_effect && warning.level == "information"){
    // Don't send notification for expiry of Information.
    return;
  }

  const topics = [];

  // Special handling for PACWAVE17 exercise to avoid sounding the tsunami alarm
  // by the old version of the app which cannot display exercise message properly.
  // To be removed after new versions have been deployed.
  if( warning.is_exercise ){
    topics.push(topicPrefix + "_exercise");
  }
  else{
    topics.push(topicPrefix);
  }

  topics.forEach((topic)=>{
    console.log("Sending push message to topic "+topic+" needsAttention = "+needsAttention);

    senders.forEach(({name, sender})=>{
      if( warning.in_effect && warning.notified_by[name] ){
        // This warning message has already been sent by this sender.
        return;
      }

      const message = warning.toPushMessage(needsAttention);
      message.sender(sender).sendToTopic(topic, (warning)=>{
        console.log("Sending push message to topic "+topic+" over "+name+" succeeded.");
        // This will prevent the server from sending the push message twice or more.
        const notifiedBy = {};
        notifiedBy[name] = true;
        Warnings.update({_id: warning._id}, {"$set": {notified_by: notifiedBy}});
      });
    })

  })
}

const instance = new PushServer();
export default instance;
