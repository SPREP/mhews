import React from 'react';

import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import { createContainer } from 'meteor/react-meteor-data';
import {Preferences} from '../api/preferences.js';

const districts = [
  "upolu-north-northwest",
  "upolu-east-southwest",
  "savaii-east-northeast",
  "savaii-northwest",
  "savaii-south"
];

const topPageName = Meteor.settings.public.topPage;

class PreferencesPage extends React.Component {

  render(){
    const lang = this.props.language;
    const district = this.props.district;
    this.selectedLanguage = lang;
    this.selectedDistrict = district;
    console.log("PreferencesPage.render() lang = "+lang);

    return(
      <div>
        <Subheader>Language</Subheader>
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
        <Subheader>District</Subheader>
        <RadioButtonGroup name="district" onChange={(e, v)=>{this.changeDistrict(v)}} defaultSelected={district}>
          {
            districts.map((district)=>(
              <RadioButton
                key={district}
                label={this.props.t("district."+district)}
                value={district} />
            ))
          }
        </RadioButtonGroup>
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

  savePreferences(){
    this.savePreference("language", this.selectedLanguage);
    this.savePreference("district", this.selectedDistrict);
    this.props.onPageSelection(topPageName);
  }

  savePreference(key, value){
    if( !Preferences ){
      console.error("Preferences local collection is not defined!!");
      return;
    }
    Preferences.save(key, value);
  }
}


PreferencesPage.propTypes = {
  language: React.PropTypes.string,
  district: React.PropTypes.string,
  t: React.PropTypes.func,
  onPageSelection: React.PropTypes.func
}

const PreferencesPageContainer = createContainer(({t, onPageSelection}) => {
  return {
    language: Preferences.load("language"),
    district: Preferences.load("district"),
    t,
    onPageSelection
  }

}, PreferencesPage);

export default PreferencesPageContainer;
