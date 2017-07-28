import PushClientOneSignalPlugin from './pushclientOneSignalPlugin';
import PushClientOneSignalWebPush from './pushclientOneSignalWebPush';

/*
 Factory class to return a suitable pushclient for the message dissemination method.
 */

class PushClientFactory {

  constructor(){
    this.instance = Meteor.isCordova ? new PushClientOneSignalPlugin() : new PushClientOneSignalWebPush();
  }

  getInstance(){
    return this.instance;
  }
}

const factory = new PushClientFactory();
export default factory;
