import React from 'react';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import LeftArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import {FlowRouter} from 'meteor/kadira:flow-router';

import Paper from 'material-ui/Paper';

import Config from '/imports/config.js';

import './css/WarningCard.css';

const noWarningKey = "no_warning_in_effect";

export class WarningCard extends React.Component {

  render(){
    const warning = this.props.warning;
    const t = this.props.t;
    const avatarImage = getWarningTypeIcon(warning);
    const title = warning ? warning.getHeaderTitle(t) : t(noWarningKey);
    const subtitle = warning ? warning.getSubTitle(t) : "";

    return (
      <Paper style={getWarningStyle(warning)} zDepth={1}>
        <div className="warningcard_outerDiv">
          <img src={avatarImage} className="warningcard_image"/>
          <div className="warningcard_innerDiv1">
            <div className="warningcard_headerTitle">{title}</div>
            <div className="warningcard_subTitle">{subtitle}</div>
          </div>
          {
            warning ?
            <div className="warningcard_innerDiv2"
              onTouchTap={()=>{navigatePage(warning, !this.props.expanded)}}>
              {
                this.props.expanded ?
                <LeftArrowIcon style={{display: "inline-block", width: "32px"}} /> :
                <RightArrowIcon style={{display: "inline-block", width: "32px"}} />
              }
            </div>
            : ""
          }
        </div>
      </Paper>
    )
  }
}

WarningCard.propTypes = {
  t: React.PropTypes.func,
  warning: React.PropTypes.object,
  expanded: React.PropTypes.bool
}

function getWarningStyle(warning){
  if( warning ){
    const level = warning.level;
    if( level && typeof level == "string"){
      const str = level.toLowerCase();
      if( str == "warning" ){
        return {color: "#ff0000"};
      }
      else if( str == "watch"){
        return {color: "#FFBF00"};
      }
    }
  }
  return {color: "#000000"};
}

function navigatePage(warning, expand){
  if( expand ){
    openLink(warning.type+"/"+warning._id);
  }
  else{
    history.back();
  }
}

function openLink(page){
  const path = "/app/"+page;

  FlowRouter.go(path);
}

function getWarningTypeIcon(warning){
  if( !warning ){
    return "images/no_warning.png";
  }
  const config = Config.notificationConfig[warning.type];
  if(config){
    return config.icon;
  }
  else{
    return "/images/warning.png";
  }
}
