import React from 'react';
import { Meteor } from 'meteor/meteor';

import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import i18n from 'i18next';
import { createContainer } from 'meteor/react-meteor-data';
import {Preferences} from '../api/preferences.js';

const districts = [
  "upolu-north-northwest",
  "upolu-east-southwest",
  "savaii-east-northeast",
  "savaii-northwest",
  "savaii-south"
];

class PreferencesPage extends React.Component {

  render(){
    const lang = this.props.language;
    const district = this.props.district;
    console.log("lang = "+lang);

    return(
      <div>
        <Subheader>Language</Subheader>
        <RadioButtonGroup name="language" onChange={(e, v)=>{this.changeLanguage(v)}} defaultSelected={lang}>
          <RadioButton
            label="English"
            value="en"/>
          <RadioButton
            label="Samoan"
            value="ws"/>
        </RadioButtonGroup>
        <Divider />
        <Subheader>District</Subheader>
        <RadioButtonGroup name="district" onChange={(e, v)=>{this.changeDistrict(v)}} defaultSelected={district}>
          {
            districts.map((district)=>(
              <RadioButton
                label={this.props.t("district."+district)}
                value={district} />
            ))
          }
          </RadioButtonGroup>
      </div>

    );
  }
  changeLanguage(lang) {
    const topPageName = Meteor.settings.public.topPage;
    i18n.changeLanguage(lang, (error, t) => {
      console.log("Callback from i18n.changeLanguage");
      if( error ){
        console.error(error);
      }
      else{
        this.savePreferences("language", lang);
      }
    })
  }
  changeDistrict(district){
    this.savePreferences("district", district);
  }
  savePreferences(key, value){
    if( !Preferences ){
      console.error("Preferences local collection is not defined!!");
      return;
    }
    Preferences.upsert({key: key}, {key: key, value: value});
  }
}


PreferencesPage.propTypes = {
  language: React.PropTypes.string,
  district: React.PropTypes.district
}

export default PreferencesPageContainer = createContainer(() => {
  let districtPreference;
  let languagePreference;

  if( Preferences ){
    districtPreference = Preferences.findOne({key: "district"});
    languagePreference = Preferences.findOne({key: "language"});
  }
  else{
    console.error("Preferences local collection is not defined!!");
    // TODO show an error message to the user.
  }
  let district = districtPreference ? districtPreference.value : districts[0];
  let language = languagePreference ? languagePreference.value : "en";

  return {
    language,
    district
  }

}, PreferencesPage);
