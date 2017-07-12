import PushClientOneSignalPlugin from './pushclientOneSignalPlugin';
import PushClientOneSignalWebPush from './pushclientOneSignalWebPush';

/*
 Factory class to return a suitable pushclient for the message dissemination method.
 */

class PushClientFactory {

  getInstance(){
    if( Meteor.isCordova ){
      return new PushClientOneSignalPlugin();
    }
    else{
      return new PushClientOneSignalWebPush();
    }
  }
}

const factory = new PushClientFactory();
export default factory;
