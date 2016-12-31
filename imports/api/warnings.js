import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

// Warning levels in the significance order.
const levels = ["information", "advisory", "watch", "warning"];

class WarningCollection extends Mongo.Collection {

  findWarningsInEffect(type, area, direction){
    check(type, Match.Maybe(String));
    check(area, Match.Maybe(String));
    check(direction, Match.Maybe(String));

    let selector = {in_effect: true};
    if(type){
      selector.type = type;
    }
    if(area){
      selector.area = area;
    }
    if(direction){
      selector.direction = direction;
    }
    // Return the Cursor instead of the result.
    return super.find(selector, {sort: [["issued_at", "desc"]]});
  }

  findLatestWarningInEffect(type){
    check(type, Match.Maybe(String));

    let selector = {in_effect: true};
    if(type){
      selector.type = type;
    }
    return super.findOne(selector, {sort: [["issued_at", "desc"]]});
  }

  findSameWarningInEffect(warning){
    // At most one previousWarning of the same type, area, and direction should be in effect.
    return super.findOne({
      in_effect: true,
      type: warning.type,
      area: warning.area,
      direction: warning.direction
    });
  }

  findByBulletinId(type, bulletinId){
    check(type, String);
    check(bulletinId, Number);

    let selector = {type: type, bulletinId: bulletinId};
    return super.findOne(selector);
  }

  cancelWarning(warning){
    check(warning, Object);
    check(warning.bulletinId, Number);

    let selector = {type: warning.type, bulletinId: warning.bulletinId, in_effect: true};
    super.update(selector, {"$set": {in_effect: false}});
  }

  insert(warning){
    check(warning.bulletinId, Number);
    check(warning.type, String);
    check(warning.issued_at, Date);

    let selector = {type: warning.type, bulletinId: warning.bulletinId, in_effect: true};
    super.upsert(selector, warning);
  }

  getHazardTypes(){
    let hazardTypes = [];

    const config = Meteor.settings.public.notificationConfig;
    for(let key in config){
      hazardTypes.push(key);
    }

    return hazardTypes;
  }

  listLevels(){
    return levels;
  }

  isMoreSignificant(level1, level2){
    const l1 = levels.indexOf(level1.toLowerCase());
    const l2 = levels.indexOf(level2.toLowerCase());
    return l1 > l2;
  }

  toFcmMessage(warning, soundFile){
    const title = warning.type + " " + warning.level;
    const body = warning.direction ? warning.area + " " + warning.direction : warning.area;
    const ttl = 10 * 60; // 10min time to live
    // Destination topics are set by the fcm.js. Don't set "to" here.
    const fcmMessage = {
      "priority": "high",
      "time_to_live": ttl,
      "notification" : {
        "title" : title,
        "body" : body,
        "click_action" : "FCM_PLUGIN_ACTIVITY",
        "sound": soundFile,
        "icon" : "myicon"
      },
      "data" : {
        "type": warning.type,
        "level": warning.level,
        "in_effect": warning.in_effect,
        "issued_at": warning.issued_at,
        "description": warning.description
      }
    };

    if( !warning.in_effect ){
      fcmMessage.notification.title = "Cancel "+title;
    }

    if( warning.type == "tsunami" || warning.type == "earthquake" ){
      const mw = warning.mw;
      fcmMessage.notification.body = body + " (Magnitude "+mw+")";
      fcmMessage.data.epicenter_lat = warning.epicenter.lat;
      fcmMessage.data.epicenter_lng = warning.epicenter.lng;
      fcmMessage.data.mw = mw;
      fcmMessage.data.depth = warning.epicenter.depth;
    }
    else if( warning.type == "heavyRain" ){
      fcmMessage.data.area = warning.area;
      fcmMessage.data.direction = warning.direction;
    }
    else if( warning.type == "cyclone" ){
      fcmMessage.data.name = warning.name; // Name of the TC
      fcmMessage.data.category = warning.category;
    }

    return fcmMessage;
  }

  // FCM cannot deliver layered JSON, so epicenter is represented by two attributes.
  // This function put them back into the same data structure as a client publishes to the server.
  fromFcmMessage(data){
    data.issued_at = moment(data.issued_at).toDate();
    data.epicenter = {
      lat: parseFloat(data.epicenter_lat),
      lng: parseFloat(data.epicenter_lng),
    }
    data.mw = parseFloat(data.mw);
    data.depth = parseFloat(data.depth);

    return data;
  }

  isForSameArea(warning1, warning2){
    return warning1.type == warning2.type &&
    warning1.area == warning2.area &&
    warning1.direction == warning2.direction;
  }

  hasNoSignificantChange(warning1, warning2){
    return this.isForSameArea(warning1, warning2) &&
    warning1.level == warning2.level;
  }

  // User should be notified by using a strong sound effect if
  // 1) The watch or warning for this area and direction is newly in effect, or
  // 2) The same warning remains in effect but the level has raised.
  // (e.g. Raised from Watch to Warning.)
  changeNeedsAttention(newWarning, oldWarning){
    if( !newWarning.in_effect ){
      return false;
    }
    let needsAttention = this.isMoreSignificant(newWarning.level, "advisory");
    if( oldWarning ){
      needsAttention = needsAttention && this.isMoreSignificant(newWarning.level, oldWarning.level);
    }
    return needsAttention;
  }
}

export const Warnings = new WarningCollection("warnings");
