import { Meteor } from 'meteor/meteor';

import { check } from 'meteor/check';
import ServerUtils from './serverutils.js';
import Warnings from '../warnings.js';
import WarningFactory from '../model/warningFactory.js';
import i18n from 'i18next';
import Config from '/imports/config.js';

// The dynamic import in the server/init.js seems not work for the deferred call of obsoleteOldInformation.
import moment from 'moment';

class WarningCollectionServer {

  constructor(collection){
    _.extend(this, collection);
    this.cancelWarning = this.cancelWarning.bind(this);
    this.publishWarning = this.publishWarning.bind(this);
  }

  start(){
    Meteor.publish('warnings', ()=>{
      // Only returns the effective warnings.
      return this.find({in_effect: true});
    });
    // Check if there are any obsolete information at the startup.
//    Meteor.defer(Meteor.bindEnvironment(this.obsoleteOldInformation));
    Meteor.defer(()=>{this.obsoleteOldInformation()});
    // Start the timer which invalidates old information every hour.
    Meteor.setInterval(()=>{this.obsoleteOldInformation()}, 3600 * 1000);

  }

  obsoleteOldInformation(){
    const before24hours = moment().subtract(24, 'hours').toDate();
    console.log("Earthquake info older than "+before24hours+" will be in_effect.");
    // Use the date_time instead of the issued_at, as the issued_at isn't reliable due to the IBL.
    this.update(
      {"level": "information", "in_effect": true, "date_time": {"$lt": before24hours}},
      {"$set": {"in_effect": false}},
      {multi: true}
    );

  }

  // TODO Move this method to the Admin app so that it is not accessed from the Internet side.
  publishWarning(warning){
    console.log("Enter publishWarning");

    check(this.connection, Match.Where(ServerUtils.isClientIpAllowed));

    warning = WarningFactory.create(warning);
    warning.check();

    // Old version of the app cannot show "Exercise" in the warning list title
    // Set it to the description.
    // This codes are to be removed after the new version of the app is well deployed.
    if( warning.is_exercise ){

      Config.languages.forEach((lang)=>{
        warning["description_"+lang] = i18n.t("exercise", {lng: lang}).toUpperCase()+" "+ warning["description_"+lang];
      });
    }

    if( warning.in_effect ){
      return this.upsert({bulletinId: warning.bulletinId, type: warning.type}, warning);
    }
    else {
      // FIXME: This cancellation does not work because IBL gives different bulletinNumber
      // from the warning bulletin to be cancelled.
      return this.cancelWarning(warning.type, warning.bulletinId);
    }
  }

  cancelWarning(type, bulletinId){
    check(type, String);
    check(bulletinId, Number);

    let selector = {type: type, bulletinId: bulletinId, in_effect: true};
    this.update(selector, {"$set": {in_effect: false}});
  }

}

const Server = new WarningCollectionServer(Warnings);
export default Server;
