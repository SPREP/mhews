import React from 'react';
import { Meteor } from 'meteor/meteor';
import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import HighlightOff from 'material-ui/svg-icons/action/highlight-off';
import {Card, CardHeader} from 'material-ui/Card';

import { createContainer } from 'meteor/react-meteor-data';
//import i18n from 'i18next';

import {Warnings} from '../api/warnings.js';
import HeavyRainPage from './HeavyRain.jsx';
import CyclonePage from './Cyclone.jsx';
import EarthquakePage from './Earthquake.jsx';

const noWarningKey = "no_warning_in_effect";

export class WarningList extends React.Component {

  getWarningSummary(warning){
    const t = this.props.t;

    return t(warning.type) + " " + t(warning.level);
  }

  getWarningDetails(warning){
    return warning.description_en;
  }

  getWarningTypeIcon(type){
    const config = Meteor.settings.public.notificationConfig[type];
    if(config){
      return config.icon;
    }
    else if( type == noWarningKey ){
      return "images/no_warning.png";
    }
    else{
      return "images/warning.png";
    }
  }

  getCapitalLetter(string){
    return string.slice(0,0);
  }

  renderAvatar(warning){
    const avatarImage = this.getWarningTypeIcon(warning ? warning.type : noWarningKey );

    if( avatarImage ){
      return (<Avatar src={avatarImage}></Avatar>);
    }
    else {
      return (<Avatar>{this.getCapitalLetter(warning.type)}</Avatar>)
    }
  }

  render(){
    const warnings = this.props.warnings;
    const t = this.props.t;
    const isAdmin = this.props.isAdmin;

    if( this.props.loading ){
      return (<p>{"Loading warning list..."}</p>);
    }

    let itemlist = [];
    if( warnings && warnings.length > 0 ){
      itemlist = warnings.map((warning) => {
        const cancelButton = (
          <IconButton onTouchTap={()=>{this.props.cancelWarning(warning.type, warning.bulletinId)}}>
            <HighlightOff />
          </IconButton>
        );

        if( warning.type == "heavyRain"){
          return (<HeavyRainPage {...this.props} phenomena={warning} />);
        }
        else if( warning.type == "cyclone"){
          return (<CyclonePage {...this.props} phenomena={warning} />);
        }
        else if( warning.type == "earthquake" || warning.type == "tsunami"){
          return (<EarthquakePage {...this.props} phenomena={warning} />);
        }
        else{
          console.log("Unknown warning type "+warning.type);
        }

      })
    }
    else{
      itemlist.push(
        <Card>
          <CardHeader
            key={noWarningKey}
            avatar={this.renderAvatar()}
            title={t(noWarningKey)}
            style={getWarningStyle()}
          />
        </Card>
      )
    }

    return (
      <Paper zDepth={1}>
        {itemlist}
      </Paper>
    );
  }
  renderWarningDetailsPage(warning){
    const config = Meteor.settings.public.notificationConfig;
    for(let hazardType in config){
      if( warning.type == hazardType ){
        this.props.onPageSelection(config[hazardType].page, warning);
        return;
      }
    }
    console.error("Unknown hazard type "+warning.type);
  }
}

function getWarningStyle(level){
  if( level == "warning" ){
    return {color: "#ff0000"};
  }
  else if( level == "watch"){
    return {color: "#ffff00"};
  }
  return {color: "#000000"};
}

WarningList.propTypes = {
  loading: React.PropTypes.bool,
  warnings: React.PropTypes.array,
  t: React.PropTypes.func,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func,
  onPageSelection: React.PropTypes.func
}

function cancelWarning(type, bulletinId){
  Meteor.call("cancelWarning", type, bulletinId, (err, res)=>{
    if( err ){
      console.log("cancelWarning remote call failed.");
      console.log(JSON.stringify(err));
    }
    if( res ){
      console.log(JSON.stringify(res));
    }
  });
}

const WarningListContainer = createContainer(({t, handles})=>{
  const handle = handles["warnings"];
  if( !handle ){
    console.error("handle for warnings was not given!");
    return;
  }
  const loading = !handle.ready();
  const isAdmin = !Meteor.isCordova; // FIXME This is not at all correct logic (^^;

  return {
    loading,
    t,
    isAdmin,
    warnings: loading? null : Warnings.findWarningsInEffect(),
    cancelWarning
  }

}, WarningList);

export default WarningListContainer;
