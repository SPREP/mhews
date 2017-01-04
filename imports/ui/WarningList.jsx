import React from 'react';
import { Meteor } from 'meteor/meteor';
import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';
import {Card, CardHeader} from 'material-ui/Card';

import { createContainer } from 'meteor/react-meteor-data';
//import i18n from 'i18next';

import {Warnings} from '../api/warnings.js';
import HeavyRainPage from './HeavyRain.jsx';
import CyclonePage from './Cyclone.jsx';
import EarthquakePage from './Earthquake.jsx';

const noWarningKey = "no_warning_in_effect";

export class WarningList extends React.Component {

  constructor(props){
    super(props);
    this.onExpandChange = this.onExpandChange.bind(this);
    this.state = {expandedWarningId : null};
  }

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

    let itemlist = [];
    if( warnings && warnings.length > 0 ){
      itemlist = warnings.map((warning) => {
        if( warning.type == "heavyRain"){
          return (
            <HeavyRainPage {...this.props}
              key={warning._id}
              phenomena={warning}
              onExpandChange={(state)=>{this.onExpandChange(state, warning._id)}}
              expanded={this.getExpanded(warning._id)}
            />);
        }
        else if( warning.type == "cyclone"){
          return (
            <CyclonePage {...this.props}
              key={warning._id}
              phenomena={warning}
              onExpandChange={(state)=>{this.onExpandChange(state, warning._id)}}
              expanded={this.getExpanded(warning._id)}
            />);
        }
        else if( warning.type == "earthquake" || warning.type == "tsunami"){
          return (
            <EarthquakePage {...this.props}
              key={warning._id}
              phenomena={warning}
              onExpandChange={(state)=>{this.onExpandChange(state, warning._id)}}
              expanded={this.getExpanded(warning._id)}
            />);
        }
        else{
          console.log("Unknown warning type "+warning.type);
        }

      })
    }
    else{
      itemlist.push(
        <Card key={noWarningKey}>
          <CardHeader
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

  onExpandChange(newExpandState, warningId){
    if( newExpandState == true ){
      this.setState({expandedWarningId: warningId});
    }
    else if( newExpandState == false ){
      if( this.state.expandedWarningId == warningId ){
        this.setState({expandedWarningId: null});
      }
    }
  }

  getExpanded(warningId){
    return this.state.expandedWarningId == warningId;
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
  warnings: React.PropTypes.array,
  t: React.PropTypes.func,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func
}

const WarningListContainer = createContainer(({t})=>{
  const isAdmin = !Meteor.isCordova; // FIXME This is not at all correct logic (^^;

  return {
    t,
    isAdmin,
    warnings: Warnings.findWarningsInEffect().fetch(),
    cancelWarning: Warnings.cancelWarning
  }

}, WarningList);

export default WarningListContainer;
