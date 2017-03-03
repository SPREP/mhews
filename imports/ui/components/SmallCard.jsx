import React from 'react';
import './css/SmallCard.css';

export class SmallCard extends React.Component {
  render(){
    return(
      <div className="smallcard_outerDiv"
        onTouchTap={this.props.onTouchTap}>
        <img src={this.props.icon} className="smallcard_image"/>
        <div className="smallcard_innerDiv">
          {this.props.text}
        </div>
      </div>
    );
  }
}

SmallCard.propTypes = {
  icon: React.PropTypes.string,
  text: React.PropTypes.string,
  onTouchTap: React.PropTypes.func
}
