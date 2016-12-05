import React from 'react';
import { Meteor } from 'meteor/meteor';
import {GridList, GridTile} from 'material-ui/GridList';
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

import {Warnings, HazardType} from '../api/warnings.js';

export class WarningList extends React.Component {

  constructor(props){
    super(props);
  }

  getWarningSummary(warning){
    const t = this.props.t;

    return t(warning.type) + " " + t(warning.level);
  }

  getWarningDetails(warning){
    return warning.description;
  }

  getWarningTypeIcon(type){
    const config = Meteor.settings.public.notificationConfig[type];
    if(config){
      return config.icon;
    }
    else{
      // FIXME Set a generic warning icon
      return "images/warnings/storm.png";
    }
  }

  getCapitalLetter(string){
    return string.slice(0,0);
  }

  renderAvatar(warning){
    const avatarImage = this.getWarningTypeIcon(warning.type);
    if( avatarImage ){
      return (<Avatar src={avatarImage}></Avatar>);
    }
    else {
      return (<Avatar>{this.getCapitalLetter(warning.type)}</Avatar>)
    }
  }

  render(){
    const warnings = Warnings.findWarningsInEffect();
    const t = this.props.t;

    // FIXME The ListItem needs the key property set.
    if( warnings && warnings.length > 0 ){
      return (
        <List>
          {warnings.map((warning) => {
            return (
              <ListItem
                leftAvatar={this.renderAvatar(warning)}
                primaryText={this.getWarningSummary(warning)}
                secondaryText={this.getWarningDetails(warning)}
                onTouchTap={()=>{this.renderWarningDetailsPage(warning)}}
                />);
            })}
          </List>
        );

    }
    else{
      return <p>{t('no_warning_in_effect')}</p>
    }
  }
  renderWarningDetailsPage(warning){
    const config = Meteor.settings.notificationConfig;
    for(let hazardType in config){
      if( warning.type == hazardType ){
        this.props.onPageSelection(config[hazardType].page);
        return;
      }
    }
    console.error("Unknown hazard type "+warning.type);
  }
}

/**
 * Usage: <WarningsGridTile onClick={callback} />
 * This GridTile requires two columns to display the latest warning in effect.
 */
export class WarningsMenuTile extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      latestWarning: null
    };
  }

  componentDidMount(){
    const latestWarning = Warnings.findLatestWarningInEffect();
    this.setState({latestWarning: latestWarning});
  }

  getWarningMessage(warning){
    const t = this.props.t;

    if( warning ){
      return t(warning.type) + " " + t(warning.level) + " " + t("is in effect in") + " " + warning.region;
    }
    else{
      return t("no_warning_in_effect");
    }
  }

  render(){
    const latestWarning = this.state.latestWarning;

    return (
      <ListItem
        leftAvatar={<Avatar src="images/warning.png"></Avatar>}
        primaryText={this.getWarningMessage(latestWarning)}
        onTouchTap={(event) => {event.preventDefault(); this.props.onTouchTap()}}
        />
    );
  }
}
