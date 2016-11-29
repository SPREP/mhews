import React from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';

export class WarningList extends React.Component {
  constructor(props){
    super(props);
  }

  retrieveWarningsInEffect(){
      return [
        {type: 'Cyclone', level: 'Warning', description: 'TC Evan is approaching Apia. Maximum wind speed is 15m/s'},
        {type: 'HeavyRain', level: 'Watch', description: 'Strong down pour will be caused by TC Evan. Watch the water level.'},
      ]
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

  render(){
    const warnings = this.retrieveWarningsInEffect();

    return (
        <List>
          <Subheader inset={true}>Warnings currently in effect</Subheader>
          {warnings.map((warning) => {
            const avatarImage = this.getWarningTypeIcon(warning.type);
            let avatar;
            if( avatarImage ){
              avatar = (<Avatar src={avatarImage}></Avatar>);
            }
            else {
              avatar = (<Avatar>{this.getCapitalLetter(warning.type)}</Avatar>)
            }
            return (<ListItem
              leftAvatar={avatar}
              primaryText={this.getWarningSummary(warning)}
              secondaryText={this.getWarningDetails(warning)}
              />);
          })}
        </List>
    );

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
    // TODO This should be cached to avoid unnecessary server access.
    return {type: 'heavyRain', level: 'Warning', region: 'North Apia'}
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
        onClick={() => this.props.onClick()}
        />
    );
  }
}
