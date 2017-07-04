import {Meteor} from 'meteor/meteor';
import ReceptionTracker from '../receptionTracker.js';
import Config from '/imports/config.js';

/*

Push Client receives push message from the server.
Currently it relies on the Google Firebase Messaging and uses the cordova-plugin-firebase.

*/
const topicPrefix = Meteor.settings.public.topicPrefix;

export class PushClient {

  // PushClient starts receiving the messages.
  // The given callback function is called after a message is received.
  start(callback){

    if( Meteor.isCordova ){
      this.initOneSignalPlugin(callback);
//    this.initFirebasePlugin(callback);
    }

  }

  initOneSignalPlugin(callback){
    const appId = Meteor.settings.public.oneSignalAppId;

    window.plugins.OneSignal
    .startInit(appId)
    .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.None)
    .handleNotificationReceived(callback)
    .handleNotificationOpened(callback)
    .endInit();

    window.plugins.OneSignal.getIds(function(ids) {
      console.log('getIds: ' + JSON.stringify(ids));
    });

    this.subscribe(topicPrefix);
  }

  initFirebasePlugin(callback){

    // Get the token as the temporary id to identify the mobile terminal.
    // onTokenRefresh is called even for the initial token setting.
    window.FirebasePlugin.onTokenRefresh((token)=>{
      console.log("FCM token refreshed: "+token);
      ReceptionTracker.setTrackerId(token);
    });

    this.subscribe(topicPrefix);

    window.FirebasePlugin.onNotificationOpen(
      (notification)=>{
        console.log("onNotificaitonOpen received "+notification);
        callback(notification)
      },
      (err) => {
        console.error('Error registering onNotification callback: ' + err);
        // TODO Need to handle this error. Try to re-subscribe to the topic until it succeeds?
      }
    );

    window.FirebasePlugin.getInfo((info)=>{
      console.log("FCM info = "+JSON.stringify(info));
    });
  }

  // Call this method to receive exercise messages in addition to normal messages.
  receiveExerciseMessages(joinExercise){
    const topic = topicPrefix + "_exercise";

    if( joinExercise ){
      this.subscribe(topic);
    }
    else{
      this.unsubscribe(topic);
    }
  }

  subscribe(topic){
    window.plugins.OneSignal.sendTag(topic, "true");
//    window.FirebasePlugin.subscribe(topic);
  }

  unsubscribe(topic){
    window.plugins.OneSignal.deleteTag(topic);
//    window.FirebasePlugin.unsubscribe(topic);
  }

  // TODO This method is not currently used.
  // FCM cannot deliver layered JSON, so epicenter is represented by two attributes.
  // This function put them back into the same data structure as a client publishes to the server.
  createWarningFromFcmMessage(data){
    data.issued_at = moment(data.issued_at).toDate();
    data.epicenter = {
      lat: parseFloat(data.epicenter_lat),
      lng: parseFloat(data.epicenter_lng),
    }
    data.mw = parseFloat(data.mw);
    data.depth = parseFloat(data.depth);

    return data;
  }

}
