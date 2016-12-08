import React from 'react';
import { Meteor } from 'meteor/meteor';

import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import i18n from 'i18next';

class SettingPage extends React.Component {

  render(){
    const districts = [
      "upolu-north-northwest",
      "upolu-east-southwest",
      "savaii-east-northeast",
      "savaii-northwest",
      "savaii-south"
    ];

    const lang = getCurrentLanguage();
    const district = getCurrentDistrict();

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
        if( typeof(Storage) !== 'undefined'){
          localStorage.setItem("language", lang);
        }
      }
//      this.props.onPageSelection(topPageName);
    })
  }
  changeDistrict(district){
    if( typeof(Storage) !== 'undefined'){
      localStorage.setItem("district", district);
    }
  }
}

function getCurrentDistrict(){
  if( typeof(Storage) !== 'undefined'){
    return localStorage.getItem("district");
  }
  else{
    return "upolu-north-northwest";
  }
}

function getCurrentLanguage(){
  if( typeof(Storage) !== 'undefined'){
    return localStorage.getItem("language");
  }
  else{
    return "en";
  }
}

export default SettingPage;
