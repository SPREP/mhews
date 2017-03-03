import {Meteor} from 'meteor/meteor';
import i18n from 'i18next';
import {toTitleCase} from '../strutils.js';
import {sprintf} from 'sprintf-js';

// Warning levels in the significance order.
const levels = ["information", "advisory", "watch", "warning"];

export class Warning {
  constructor(phenomena){
    _.extend(this, phenomena);
  }

  check(){
    check(this.bulletinId, Number);
    check(this.level, Match.OneOf(...levels));
    check(this.in_effect, Match.OneOf(true, false));
    check(this.issued_at, Date);
    Meteor.settings.public.languages.forEach((lang)=>{
      check(this["description_"+lang], String);
    });
  }

  getHeaderTitle(t){
    let title = toTitleCase(this.doGetHeaderTitle(t));
    if( this.is_exercise ){
      title = t("exercise").toUpperCase() + " " + title;
    }
    return title;
  }

  doGetHeaderTitle(t){
    return sprintf(t("warning_description.header"), t(this.type), t("level."+this.level));
  }

  getSubTitle(){
    return moment(this.issued_at).format("YYYY-MM-DD HH:mm");
  }

  getDescription(){
    return this["description_"+i18n.language];
  }

  // Method to identify if two warnings are about the same event.
  // This method is used to determine if a new warning can obsolete a former warning.
  // Subclass should implement this method properly.
  isSameEvent(_another){
    return false;
  }

  isMoreSignificant(another){
    const level1 = this.level;
    const level2 = typeof another == "string" ? another : another.level;
    const l1 = levels.indexOf(level1.toLowerCase());
    const l2 = levels.indexOf(level2.toLowerCase());
    return l1 > l2;
  }

  isForSameArea(another){
    return this.type == another.type &&
    this.area == another.area &&
    this.direction == another.direction;
  }

  hasNoSignificantChange(another){
    return this.isForSameArea(another) &&
    this.level == another.level;
  }

  // User should be notified by using a strong sound effect if
  // 1) The watch or warning for this area and direction is newly in effect, or
  // 2) The same warning remains in effect but the level has raised.
  // (e.g. Raised from Watch to Warning.)
  changeNeedsAttention(oldWarning){
    if( !this.in_effect ){
      return false;
    }
    let needsAttention = this.isMoreSignificant("advisory");
    if( oldWarning ){
      needsAttention = needsAttention && this.isMoreSignificant(oldWarning);
    }
    return needsAttention;
  }

  toPushMessage(needsAttention){
    const fcmMessage = this.toFcmMessage();
    fcmMessage.notification.sound = soundEffectFile(this, needsAttention);
    return fcmMessage;
  }

  // Subclass can override this method to customize the fcm message properties.
  // In case of overriding, the subclass must call the superclass's toFcmMessage() method,
  // update and return the fcmMessage returned by the superclass's method.
  toFcmMessage(){
    let title = this.type + " " + this.level;
    if( this.is_exercise == undefined ){
      this.is_exercise = false;
    }
    if( this.is_exercise ){
      title = "exercise".toUpperCase() + " " + title;
    }

    // Destination topics are set by the send function. Don't set "to" here.
    // "click_action" is needed for cordova-plugin-fcm. However, setting it will prevent
    // the app launch from tapping the notification if cordova-plugin-firebase is used.
    //
    // notification.body must be set by a subclass.
    const fcmMessage = {
      "priority": "high",
      "notification" : {
        "title" : title,
        "icon" : "myicon"
      },
      "data" : {
        "type": this.type,
        "level": this.level,
        "bulletinId": this.bulletinId,
        "in_effect": this.in_effect,
        "is_exercise": this.is_exercise,
        "issued_at": this.issued_at
      }
    };

    Meteor.settings.public.languages.forEach((lang)=>{
      fcmMessage.data["description_"+lang] = this["description_"+lang];
    })

    if( !this.in_effect ){
      fcmMessage.notification.title = "Cancel "+title;
    }

    return fcmMessage;

  }
}

function soundEffectFile(warning, needsAttention){
  let soundFile;
  if( needsAttention ){
    soundFile = Meteor.settings.public.notificationConfig[warning.type].sound;
  }

  return soundFile ? soundFile : "default";
}
