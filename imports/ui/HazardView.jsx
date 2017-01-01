import React from 'react';
import {Card, CardHeader, CardMedia, CardText, CardActions} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

/* i18n */
import { translate } from 'react-i18next';

class HazardView extends React.Component {

  render(){
    return(
      <Card>
        <CardHeader
          avatar={this.props.avatar}
          actAsExpander={true}
          title={this.props.headerTitle}
          subtitle={this.props.headerSubTitle}
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

HazardView.propTypes = {
  avatar: React.PropTypes.string,
  headerTitle: React.PropTypes.string,
  headerSubTitle: React.PropTypes.string,
  description: React.PropTypes.string,
  onCancel: React.PropTypes.func,
  children: React.PropTypes.element.isRequired
}

export default translate(['common'])(HazardView);
