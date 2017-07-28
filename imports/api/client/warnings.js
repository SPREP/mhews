import { check } from 'meteor/check';
import Warnings from '../warnings.js';

class WarningCollectionClient {

  constructor(collection){
    console.log("============== WarningCollectionClient");

    _.extend(this, collection);
    this.cancelWarning = this.cancelWarning.bind(this);
  }

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

const Client = new WarningCollectionClient(Warnings);
export default Client;
