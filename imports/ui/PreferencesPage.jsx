import React from 'react';

import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';

import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import { createContainer } from 'meteor/react-meteor-data';
import {Preferences} from '../api/client/preferences.js';
import browserHistory from 'react-router/lib/browserHistory';

/* i18n */
import { translate } from 'react-i18next';

const districts = [
  "upolu-north-northwest",
  "upolu-east-southwest",
  "savaii-east-northeast",
  "savaii-northwest",
  "savaii-south"
];

class PreferencesPage extends React.Component {

  render(){
    const t = this.props.t;
    const lang = this.props.language;
    const district = this.props.district;
    this.selectedLanguage = lang;
    this.selectedDistrict = district;
    this.exercise = this.props.exercise;
    console.log("PreferencesPage.render() lang = "+lang);

    return(
      <div>
        <Subheader>Language / Gagana</Subheader>
        <RadioButtonGroup name="language" onChange={(e, v)=>{this.changeLanguage(v)}} defaultSelected={lang}>
          <RadioButton
            key="en"
            label="English"
            value="en"/>
          <RadioButton
            key="ws"
            label="Samoan"
            value="ws"/>
        </RadioButtonGroup>
        <Divider />
        <Subheader>District / Vaega</Subheader>
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
        <Divider />
        <Subheader>Exercise / Faataitaiga</Subheader>
        <Toggle
          label={t("take_part_in_exercise")}
          labelPosition="right"
          defaultToggled={this.exercise}
          onToggle={(e, v)=>{this.changeExercise(v)}}
        />
        <Divider />
        <RaisedButton
          label="Save"
          disableTouchRipple={true}
          disableFocusRipple={true}
          primary={true}
          onTouchTap={()=>{this.savePreferences()}}
          style={{marginRight: 12}}
        />

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
