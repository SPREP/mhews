import React from 'react';
import { Meteor } from 'meteor/meteor';
import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper';
import {Card, CardHeader} from 'material-ui/Card';

import { createContainer } from 'meteor/react-meteor-data';

/* i18n */
import { translate } from 'react-i18next';

import {Warnings} from '../api/client/warnings.js';
import {Earthquake} from '../api/client/earthquake.js';
import {HeavyRain} from '../api/client/heavyRain.js';
import {Cyclone} from '../api/client/cyclone.js';

import {WarningCard} from './WarningCard.jsx';

import ReceptionTracker from '../api/receptionTracker.js';

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

  componentDidMount(){
    updateReceptionTracker(this.props.warnings);
  }

  render(){
    console.log("WarningList.render()");
    const warnings = this.props.warnings;
    const t = this.props.t;

    let itemlist = [];
    if( warnings && warnings.length > 0 ){
      itemlist = warnings.map((warning, index) => {
        return (
          <WarningCard key={index} t={t} warning={getPhenomena(warning)} />
        )
      })
    }
    else{
      itemlist.push(
        <Card key={noWarningKey}>
          <CardHeader
            avatar={renderAvatar()}
            title={t(noWarningKey)}
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

function getPhenomena(warning){
  if( warning.type == "earthquake"){
    return new Earthquake(warning);
  }
  else if( warning.type == "tsunami"){
    return new Earthquake(warning);
  }
  else if( warning.type == "heavyRain"){
    return new HeavyRain(warning);
  }
  else if( warning.type == "cyclone"){
    return new Cyclone(warning);
  }
  else{
    return warning;
  }

}

function getWarningTypeIcon(type){
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

function getCapitalLetter(string){
  return string.slice(0,0);
}

function renderAvatar(warning){
  const avatarImage = getWarningTypeIcon(warning ? warning.type : noWarningKey );

  if( avatarImage ){
    return (<Avatar src={avatarImage}></Avatar>);
  }
  else {
    return (<Avatar>{getCapitalLetter(warning.type)}</Avatar>)
  }
}

WarningList.propTypes = {
  warnings: React.PropTypes.array,
  t: React.PropTypes.func,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func
}

const WarningListContainer = createContainer(()=>{
  const isAdmin = !Meteor.isCordova; // FIXME This is not at all correct logic (^^;

  return {
    isAdmin,
    warnings: Warnings.findWarningsInEffect().fetch(),
    cancelWarning: Warnings.cancelWarning
  }

}, WarningList);

function updateReceptionTracker(warnings){
  Meteor.defer(()=>{
    warnings.forEach((warning)=>{
      ReceptionTracker.onForegroundReception(warning.bulletinId);
    });
  });
}

export default translate(['common'])(WarningListContainer);
