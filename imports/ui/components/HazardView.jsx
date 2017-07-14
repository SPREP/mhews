import React from 'react';
import Card from 'material-ui/Card/Card';
import CardMedia from 'material-ui/Card/CardMedia';
import CardText from 'material-ui/Card/CardText';
import CardActions from 'material-ui/Card/CardActions';
import FlatButton from 'material-ui/FlatButton';
import {WarningCard} from './WarningCard.jsx';

/* i18n */
import { translate } from 'react-i18next';

class HazardView extends React.Component {

  // FIXME The HazardView.render() method is called twice for each WarningList.render() call.
  // It should be only once.
  render(){
    console.log("HazardView.render()");

    return(
      <Card
        onExpandChange={this.props.onExpandChange}
        expanded={this.props.expanded}
        >
        <WarningCard
          t={this.props.t}
          warning={this.props.warning}
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
  t: React.PropTypes.func,
  avatar: React.PropTypes.string,
  headerTitle: React.PropTypes.string,
  headerSubTitle: React.PropTypes.string,
  description: React.PropTypes.string,
  onCancel: React.PropTypes.func,
  children: React.PropTypes.element.isRequired,
  level: React.PropTypes.string,
  onExpandChange: React.PropTypes.func,
  expanded: React.PropTypes.bool,
  warning: React.PropTypes.object
}

export default translate(['common'])(HazardView);
