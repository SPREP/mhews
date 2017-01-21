import { check } from 'meteor/check';
import {WarningCollection} from '../warnings.js';

class WarningCollectionClient extends WarningCollection {

  constructor(...args){
    super(...args);
    this.cancelWarning = this.cancelWarning.bind(this);
  }

  // This method can be called by a client or a server.
  cancelWarning(type, bulletinId){
    check(type, String);
    check(bulletinId, Number);

    // Remote call from a client
    Meteor.call("cancelWarning", type, bulletinId, (err, res)=>{
      if( err ){
        console.log("cancelWarning remote call failed.");
        console.log(JSON.stringify(err));
      }
      if( res ){
        console.log(JSON.stringify(res));
      }
    });

  }


}

export const Warnings = new WarningCollectionClient("warnings");
