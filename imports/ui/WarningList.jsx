import React from 'react';
import { Meteor } from 'meteor/meteor';
import {GridList, GridTile} from 'material-ui/GridList';
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';

import { createContainer } from 'meteor/react-meteor-data';
import i18n from 'i18next';

import {Warnings, HazardType} from '../api/warnings.js';

export class WarningList extends React.Component {

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
      return "images/warning.png";
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
    const warnings = this.props.warnings;
    const t = this.props.t;

    if( this.props.loading ){
      return (<p>{"Loading warning list..."}</p>);
    }
    else if( warnings && warnings.length > 0 ){
      return (
        <Paper zDepth={1}>
          <List>
            {
              warnings.map((warning) => {
                const style = getWarningStyle(warning.level);

                return (
                  // FIXME The ListItem needs the key property set.
                  <ListItem
                    leftAvatar={this.renderAvatar(warning)}
                    primaryText={this.getWarningSummary(warning)}
                    secondaryText={this.getWarningDetails(warning)}
                    style={style}
                    onTouchTap={()=>{this.renderWarningDetailsPage(warning)}}
                    />
                );
              })
            }
          </List>
      </Paper>
      );
    }
    else{
      return (<p>{t('no_warning_in_effect')}</p>);
    }
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
  t: React.PropTypes.func
}

export default WarningListContainer = createContainer(({t, handles})=>{
  const handle = handles["warnings"];
  if( !handle ){
    console.error("handle for warnings was not given!");
    return;
  }
  const loading = !handle.ready();
  const language = i18n.language;

  return {
    loading,
    t,
    warnings: loading? null : Warnings.findWarningsInEffect()
  }

}, WarningList);


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
        key={latestWarning._id}
        leftAvatar={<Avatar src="images/warning.png"></Avatar>}
        primaryText={this.getWarningMessage(latestWarning)}
        onTouchTap={(event) => {event.preventDefault(); this.props.onTouchTap()}}
        />
    );
  }
}
