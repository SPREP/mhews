import React from 'react';

/* global cordova */

export default class Link extends React.Component {

  render(){
    if( Meteor.isCordova ){
      return (
        <a href="#" onClick={()=>{cordova.InAppBrowser.open(this.props.href, '_system')}}>
          {this.props.children}
        </a>
      );
    }
    else{
      return (
        <a href={this.props.href}>
          {this.props.children}
        </a>
      );
    }
  }
}

Link.propTypes = {
  href: React.PropTypes.string,
  children: React.PropTypes.node
}
