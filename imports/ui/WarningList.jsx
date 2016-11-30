import React from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

import {Warnings} from '../api/warnings.js';

export class WarningList extends React.Component {
  constructor(props){
    super(props);
  }

  retrieveWarningsInEffect(){
    // List the effective warnings in descending order of the issued time.
    return Warnings.find({in_effect: true}, {sort: [["issued_time", "desc"]]}).fetch();
  }

  getWarningSummary(warning){
    const t = this.props.t;

    return t(warning.type) + " " + t(warning.level);
  }

  getWarningDetails(warning){
    return warning.description;
  }

  getWarningTypeIcon(type){
    if( type == 'Cyclone' ){
      return "images/warnings/tornade.png";
    }
    else if( type == 'HeavyRain') {
      return "images/warnings/storm.png";
    }
    return null;
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
    const warnings = this.retrieveWarningsInEffect();
    const t = this.props.t;

    if( warnings && warnings.length > 0 ){
      return (
        <List>
          {warnings.map((warning) => {
            return (<ListItem
              leftAvatar={this.renderAvatar(warning)}
              primaryText={this.getWarningSummary(warning)}
              secondaryText={this.getWarningDetails(warning)}
              />);
            })}
          </List>
        );

    }
    else{
      return <p>{t('no_warning_in_effect')}</p>
    }

  }
}

/**
 * Usage: <WarningsGridTile onClick={callback} />
 * This GridTile requires two columns to display the latest warning in effect.
 */
export class WarningsMenuTile extends React.Component {
  constructor(props){
    super(props);
  }

  retrieveLatestWarningInEffect(){
//    return Warnings.findOne({in_effect: true}, {sort: [["issued_time", "desc"]]}).fetch();
  return null;
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
    const latestWarning = this.retrieveLatestWarningInEffect();

    return (
      <ListItem
        leftAvatar={<Avatar src="images/warning.png"></Avatar>}
        primaryText={this.getWarningMessage(latestWarning)}
        onTouchTap={() => this.props.onTouchTap()}
        />
    );
  }
}
