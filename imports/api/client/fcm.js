import { Meteor } from 'meteor/meteor';

/* global FCMPlugin */
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

// Initialize the FCM plugin. To be called by client.
export const initFcmClient = (callback) => {

  // TODO The client should regularly get the current location,
  // and subscribe to more specific area.
  FCMPlugin.subscribeToTopic(topicPrefix);

  FCMPlugin.onNotification(
    callback,
    (msg) => {
      console.log('onNotification callback successfully registered: ' + msg);
    },
    (err) => {
      console.error('Error registering onNotification callback: ' + err);
      // TODO Need to handle this error. Try to re-subscribe to the topic until it succeeds?
    }
  );
}
