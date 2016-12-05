import React from 'react';
import {List, ListItem} from 'material-ui/List';
import i18n from 'i18next';

class LanguageSetting extends React.Component {

  render(){
    return(
      <List>
        <ListItem primaryText="English" onTouchTap={()=>{this.changeLanguage("en")}}/>
        <ListItem primaryText="Samoan" onTouchTap={()=>{this.changeLanguage("ws")}} />
      </List>

    );
  }
  changeLanguage(lang) {
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
      this.props.onPageSelection("indexPage");
    })
  }
}

export default LanguageSetting;
