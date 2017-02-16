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
//    check(warning.type, Match.Where(checkWarningType));
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

}
