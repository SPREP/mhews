import PushClientOneSignalPlugin from './pushclientOneSignalPlugin';
import PushClientOneSignalWebPush from './pushclientOneSignalWebPush';

/*
 Factory class to return a suitable pushclient for the message dissemination method.
 */

const clientOneSignalPlugin = new PushClientOneSignalPlugin();

const clientOneSignalWebPush = new PushClientOneSignalWebPush();

export class PushClientFactory {

  getInstance(){
    if( Meteor.isCordova ){
      return clientOneSignalPlugin;
    }
    else{
      return clientOneSignalWebPush;
    }
  }
}

const factory = new PushClientFactory();

export default factory;
