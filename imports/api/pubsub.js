import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

/*
  PubSub mechanism by using the Google Firebase Cloud Messaging (FCM).
  Although the FCM has its own PubSub mechanism using "topic", it stopped working after the app has launched.
  And it has the drawback that a sent message cannot be tracked if it has been delivered to a client or not.
  Thus, decided to implement own PubSub mechanism.

  This class uses two Meteor Collections as follows:
  1) pushSubscriptions: Manages the subscribers (i.e. apps) who want to receive warning messages.
  2) pushTracker: Keep tracks of the message delivery. When a message is published to this class,
  the message is marked as "new" and added to this collection. After the delivery is acknowledged by the client,
  the message is marked as "delivered". After the TTL is elapsed, the message is marked as "timeout".
*/

const STATUS_NEW = "new";
const STATUS_DELIVERING = "delivering"; // FCM server accepted a message for delivery
const STATUS_DELIVERED = "delivered"; // Client acknowledged the message
const STATUS_FAILED = "failed"; // Failed to deliver for some reason.

export default class PubSub {

  constructor(){
    this.pushSubscriptions = new Mongo.Collection("pushSubscriptions");
    this.pushSubscriptions.allow({
      insert(){
        return true;
      },
      update(){
        return true;
      },
      remove(){
        return true;
      }
    })

    if( Meteor.isServer ){
      this.pushTracker = new Mongo.Collection("pushTracker");
    }
  }

  // subscribe for a topic by the client identfieid by the token.
  // A client can subscribe for multiple topics with the same token.
  subscribe(token, topic){
    this.pushSubscriptions.upsert({token: token, topic: topic}, {token: token, topic: topic});
  }

  // Unsubscribe from the topic by the client identified by the token.
  // If the subscription for the topic hasn't existed, it is safely ignored.
  unsubscribe(token, topic){
    this.pushSubscriptions.remove({token: token, topic: topic});
  }

  // The server publishes a message to the specified topic so that
  // the message is received by all the subscribers.
  publish(topic, message){
    if( Meteor.isClient ){
      throw new Error("PubSub.publish is only callable by a server.");
    }

    this.pushSubscriptions.find({topic: topic}).forEach(({token})=>{
      this.setMessageStatus(token, message, STATUS_NEW);

    })

//    this.startTrackingDelivery(topic);
  }

  sendToToken(token, message){
    message.sendToToken(token, ()=>{
      this.setMessageStatus(token, message, STATUS_DELIVERING);
    }, ()=>{
      this.setMessageStatus(token, message, STATUS_FAILED);
    });
  }

  setMessageStatus(token, message, status){
    this.pushTracker.insert({token: token, message_id: getMessageId(message), status: status});
  }

  startTrackingDelivery(message){
    this.trackAndResend(message, 0);
  }

  trackAndResend(message, n){
    setTimeout(()=>{
      this.pushTracker.find({
        message_id: getMessageId(message),
        status: {"$ne": STATUS_DELIVERED}
      }, {
        token: 1
      }).forEach(({token})=>{
        this.sendToToken(token, message);
      })
      this.trackAndResend(message, n+1);

    }, getTimeoutDuration(n));
  }
}

function getMessageId(message){
  return message.bulletin_id;
}

function getTimeoutDuration(n){
  // FIXME: Implement the exponential backoff algorithm.
  return n * 1000;
}
