import React from 'react';
import RightArrowIcon from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import browserHistory from 'react-router/lib/browserHistory';

import Paper from 'material-ui/Paper';

export class WarningCard extends React.Component {

  render(){
    const warning = this.props.warning;
    const t = this.props.t;
    const avatarImage = getWarningTypeIcon(warning.type);

    return (
      <Paper style={getWarningStyle(warning.level)} zDepth={1}>
        <div style={{padding: "16px"}}>
          <img src={avatarImage} style={{display: "inline-block", width: "32px", height: "32px"}}/>
          <div style={{display: "inline-block", paddingLeft: "8px", maxWidth: "70%"}}>
            <div style={{fontSize: "11pt"}}>{warning.getHeaderTitle(t)}</div>
            <div style={{fontSize: "9pt"}}>{warning.getSubTitle(t)}</div>
          </div>
          <div style={{width: "32px", height: "32px", float: "right"}}
            onTouchTap={()=>{openLink(warning.type+"/"+warning._id)}}>
            <RightArrowIcon style={{display: "inline-block", width: "32px"}} />
          </div>
        </div>
      </Paper>
    )
  }
}

WarningCard.propTypes = {
  t: React.PropTypes.func,
  warning: React.PropTypes.object
}

function getWarningStyle(level){
  if( level && typeof level == "string"){
    const str = level.toLowerCase();
    if( str == "warning" ){
      return {color: "#ff0000"};
    }
    else if( str == "watch"){
      return {color: "#ffff00"};
    }
  }
  return {color: "#000000"};
}

function openLink(path){
  browserHistory.push("/app/"+path);
}

function getWarningTypeIcon(type){
  const config = Meteor.settings.public.notificationConfig[type];
  if(config){
    return config.icon;
  }
  else{
    return "images/warning.png";
  }
}
