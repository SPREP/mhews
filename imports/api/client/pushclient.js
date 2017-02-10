import { Meteor } from 'meteor/meteor';
import ReceptionTracker from '../receptionTracker.js';

/*

Topic structure
/${topicPrefix}_samoa
/${topicPrefix}_samoa_upolu
/${topicPrefix}_samoa_upolu_north
/${topicPrefix}_samoa_upolu_highland

Logic is like this:
- Server only sends to the specific area.
- Client should subscribe for all the areas covering the current location.
(e.g. /samoa_upolu_north, /samoa_upolu, /samoa_north, and /samoa)

However, use "/${topicPrefix}" as the special topic to receive all the messages,
so that the user don't have to subscribe all the possible topics when the location is unknown.

*/

const topicPrefix = Meteor.settings.public.topicPrefix;

export class PushClient {

  start(callback){

    // The callback function is called even for the initial token setting.
    window.FirebasePlugin.onTokenRefresh((token)=>{
      console.log("FCM token refreshed: "+token);
      ReceptionTracker.setTrackerId(token);
    });

    // TODO The client should regularly get the current location,
    // and subscribe to more specific area.
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
}
