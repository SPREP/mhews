import { Meteor } from 'meteor/meteor';
import ReceptionTracker from '../receptionTracker.js';

/*

Push Client receives push message from the server.
Currently it relies on the Google Firebase Messaging and uses the cordova-plugin-firebase.

*/
const topicPrefix = Meteor.settings.public.topicPrefix;

export class PushClient {

  // PushClient starts receiving the messages.
  // The given callback function is called after a message is received.
  start(callback){

    // Get the token as the temporary id to identify the mobile terminal.
    // onTokenRefresh is called even for the initial token setting.
    window.FirebasePlugin.onTokenRefresh((token)=>{
      console.log("FCM token refreshed: "+token);
      ReceptionTracker.setTrackerId(token);
    });

    window.FirebasePlugin.subscribe(topicPrefix);

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
      window.FirebasePlugin.subscribe(topic);
    }
    else{
      window.FirebasePlugin.unsubscribe(topic);
    }

  }
}
