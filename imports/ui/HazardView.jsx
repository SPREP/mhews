import React from 'react';
import {Card, CardHeader, CardMedia, CardText, CardActions} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

/* i18n */
import { translate } from 'react-i18next';

class HazardView extends React.Component {

  render(){
    const titleColor = getTitleColor(this.props.level);

    return(
      <Card
        onExpandChange={this.props.onExpandChange}
        expanded={this.props.expanded}
        >
        <CardHeader
          avatar={this.props.avatar}
          actAsExpander={true}
          title={this.props.headerTitle}
          subtitle={this.props.headerSubTitle}
          titleColor={titleColor}
        />
        <CardMedia expandable={true}>
          {this.props.children}
        </CardMedia>
        <CardText expandable={true}>{this.props.description}</CardText>
        {this.props.onCancel ? this.renderCancelButton() : ""}
      </Card>
    );
  }

  renderCancelButton(){
    return (
      <CardActions expandable={true}>
        <FlatButton label="Cancel" onTouchTap={this.props.onCancel}/>
      </CardActions>
    )
  }
}

function getTitleColor(level){
  console.log("level = "+level);
  switch(level){
    case "warning":
    return "#ff0000";
    case "watch":
    return "#ffff00";
    default:
    return "#000000";
  }
}

HazardView.propTypes = {
  avatar: React.PropTypes.string,
  headerTitle: React.PropTypes.string,
  headerSubTitle: React.PropTypes.string,
  description: React.PropTypes.string,
  onCancel: React.PropTypes.func,
  children: React.PropTypes.element.isRequired,
  level: React.PropTypes.string,
  onExpandChange: React.PropTypes.func,
  expanded: React.PropTypes.bool
}

export default translate(['common'])(HazardView);
