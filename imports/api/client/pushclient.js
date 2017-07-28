import {Meteor} from 'meteor/meteor';

/*

Push Client receives push message from the server.
A subclass is defined for each push mechanism.
Subclasses must implement init(), subscribe(), and unsubscribe() methods.

*/
const topicPrefix = Meteor.settings.public.topicPrefix;

export default class PushClient {

  // PushClient starts receiving the messages.
  // The given callback function is called after a message is received.
  start(callback){
    this.init(callback);

    this.subscribe(topicPrefix);
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

}
