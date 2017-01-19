import React from 'react';

export class SmallCard extends React.Component {
  render(){
    return(
      <div style={{"paddingRight": "16px", display: "inline-block", "verticalAlign": "top"}}
        onTouchTap={this.props.onTouchTap}>
        <img src={this.props.icon} style={{width: "32px", height: "32px"}}/>
        <div style={{"fontSize": "10pt", width: "34px", "textAlign": "center"}}>
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
