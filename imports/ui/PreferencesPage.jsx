import React from 'react';

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
      </div>

    );
  }
  changeLanguage(lang) {
    i18n.changeLanguage(lang, (error, _t) => {
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
    Preferences.save(key, value);
  }
}


PreferencesPage.propTypes = {
  language: React.PropTypes.string,
  district: React.PropTypes.string,
  t: React.PropTypes.func
}

const PreferencesPageContainer = createContainer(() => {
  let district;
  let language;

  if( Preferences ){
    district = Preferences.load("district") || "";
    language = Preferences.load("language") || "";
  }
  else{
    console.error("Preferences local collection is not defined!!");
    // TODO show an error message to the user.
  }

  return {
    language,
    district
  }

}, PreferencesPage);

export default PreferencesPageContainer;
