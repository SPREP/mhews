import React from 'react';

import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';

import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import { createContainer } from 'meteor/react-meteor-data';
import {Preferences} from '../api/client/preferences.js';
import browserHistory from 'react-router/lib/browserHistory';

import {toTitleCase} from '../api/strutils.js';

/* i18n */
import { translate } from 'react-i18next';

import Config from '../config.js';

const districts = Config.districts;

const divStyle = {padding: "8px"};

class PreferencesPage extends React.Component {

  formatHeader(keyword){
    const words = [];
    Config.languages.forEach((lang)=>{
      words.push(toTitleCase(this.props.t(keyword, {lng: lang})));
    })

    return words.join("/");
  }

  render(){
    const t = this.props.t;
    const lang = this.props.language;
    const district = this.props.district;
    this.selectedLanguage = lang;
    this.selectedDistrict = district;
    this.exercise = this.props.exercise;
    console.log("PreferencesPage.render() lang = "+lang);

    const languageHeader = this.formatHeader("language");
    const districtHeader = this.formatHeader("district");
    const exerciseHeader = this.formatHeader("exercise");

    return(
      <div>
        <div style={divStyle}>
          <Subheader>{languageHeader}</Subheader>
          <RadioButtonGroup name="language" onChange={(e, v)=>{this.changeLanguage(v)}} defaultSelected={lang}>
            {
              Config.languages.map((lang)=>{
                return (
                  <RadioButton
                    key={lang}
                    label={t("lang."+lang)}
                    value={lang}/>
                )
              })
            }
          </RadioButtonGroup>
        </div>
        <Divider />
        <div style={divStyle}>
          <Subheader>{districtHeader}</Subheader>
          <RadioButtonGroup name="district" onChange={(e, v)=>{this.changeDistrict(v)}} defaultSelected={district}>
            {
              districts.map((district)=>(
                <RadioButton
                  key={district}
                  label={t("districts."+district)}
                  value={district} />
                ))
              }
            </RadioButtonGroup>
          </div>
        <Divider />
        <div style={divStyle}>
          <Subheader>{exerciseHeader}</Subheader>
          <div style={{fontSize: "10pt"}}>Please turn on if you're ok to receive earthquake/tsunami exercise messages.</div>
          <Toggle
            label={t("join_exercise")}
            labelPosition="right"
            defaultToggled={this.exercise}
            onToggle={(e, v)=>{this.changeExercise(v)}}
          />
        </div>
        <Divider />
        <div style={divStyle}>
          <RaisedButton
            label="Save"
            disableTouchRipple={true}
            disableFocusRipple={true}
            primary={true}
            onTouchTap={()=>{this.savePreferences()}}
            style={{marginRight: 12}}
          />
        </div>
      </div>

    );
  }
  changeLanguage(lang) {
    console.log("changeLanguage = "+lang);
    this.selectedLanguage = lang;
  }
  changeDistrict(district){
    console.log("changeDistrict = "+district);
    this.selectedDistrict = district;
  }

  changeExercise(isChecked){
    console.log("exercise = "+isChecked);
    this.exercise = isChecked;
  }

  savePreferences(){
    this.savePreference("language", this.selectedLanguage);
    this.savePreference("district", this.selectedDistrict);
    this.savePreference("exercise", this.exercise ? "true" : "false");
    browserHistory.goBack();
  }

  savePreference(key, value){
    if( !Preferences ){
      console.error("Preferences local collection is not defined!!");
      return;
    }
    console.log("Save preference "+key+" = "+value);
    Preferences.save(key, value);
  }
}


PreferencesPage.propTypes = {
  language: React.PropTypes.string,
  district: React.PropTypes.string,
  exercise: React.PropTypes.bool,
  t: React.PropTypes.func,
  onPageSelection: React.PropTypes.func
}

const PreferencesPageContainer = createContainer(({onPageSelection}) => {
  return {
    language: Preferences.load("language"),
    district: Preferences.load("district"),
    exercise: stringToBoolean(Preferences.load("exercise")),
    onPageSelection
  }

}, PreferencesPage);

function stringToBoolean(string){
  if( string == "true" ){
    return true;
  }

  return false;
}

export default translate(['common'])(PreferencesPageContainer);
