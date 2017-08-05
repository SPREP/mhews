import React from 'react';

import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';

import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import { createContainer } from 'meteor/react-meteor-data';
import {Preferences} from '../api/client/preferences.js';

import {toTitleCase} from '../api/strutils.js';

/* i18n */
import { translate } from 'react-i18next';

import Config from '../config.js';

const districts = Config.districts;
const quakeDistances = Config.quakeDistances;

const divStyle = {padding: "8px"};

class PreferencesPage extends React.Component {

  formatHeader(keywords){
    const sentences = [];
    Config.languages.forEach((lang)=>{
      const translated = [];
      keywords.forEach((keyword)=>{
        translated.push(this.props.t(keyword, {lng: lang}));
      })
      sentences.push(toTitleCase(translated.join(" ")));
    })

    return sentences.join("/");
  }

  render(){
    const t = this.props.t;
    const lang = this.props.language;
    const district = this.props.district;
    const quakeDistance = Number(this.props.quakeDistance);

    this.selectedLanguage = lang;
    this.selectedDistrict = district;
    this.exercise = this.props.exercise;
    this.quakeDistance = quakeDistance;

    const languageHeader = this.formatHeader(["language"]);
    const districtHeader = this.formatHeader(["district"]);
    const exerciseHeader = this.formatHeader(["exercise"]);
    const quakeInfoHeader = this.formatHeader(["earthquake","level.information"]);

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
          <Subheader>{quakeInfoHeader}</Subheader>
          <RadioButtonGroup name="quakeDistance" onChange={(e, v)=>{this.changeQuakeDistance(v)}} defaultSelected={quakeDistance}>
            {
              quakeDistances.map(({distance, description})=>(
                <RadioButton
                  key={distance}
                  label={description}
                  value={distance} />
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

  changeQuakeDistance(distance){
    this.quakeDistance = distance;
  }

  savePreferences(){
    this.savePreference("language", this.selectedLanguage);
    this.savePreference("district", this.selectedDistrict);
    this.savePreference("exercise", this.exercise ? "true" : "false");
    this.savePreference("quakeDistance", this.quakeDistance);
    history.back();
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

// FIXME: propTypes.quakeDistance sometimes number, sometimes string.
// To be unified.
PreferencesPage.propTypes = {
  language: React.PropTypes.string,
  district: React.PropTypes.string,
  exercise: React.PropTypes.bool,
  quakeDistance: React.PropTypes.number,
  t: React.PropTypes.func,
  onPageSelection: React.PropTypes.func
}

const PreferencesPageContainer = createContainer(({onPageSelection}) => {
  return {
    language: Preferences.load("language"),
    district: Preferences.load("district"),
    exercise: stringToBoolean(Preferences.load("exercise")),
    quakeDistance: Preferences.load("quakeDistance"),
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
