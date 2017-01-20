import React from 'react';
import { Meteor } from 'meteor/meteor';

/* Imports from the material-ui */
import Snackbar from 'material-ui/Snackbar';

/* Imports the mhews's components */
import { createContainer } from 'meteor/react-meteor-data';

class ConnectionStatusIndicator extends React.Component {
  render(){
    const t = this.props.t;

    return (
      <Snackbar
        open={!this.props.connected}
        message={t("waiting-for-network")}
        bodyStyle={{"width": "100%"}}
        style={{"width": "100%"}}
      />
    );
  }
}

ConnectionStatusIndicator.propTypes = {
  t: React.PropTypes.func,
  connected: React.PropTypes.bool
}

const ConnectionStatusIndicatorContainer = createContainer(({t})=>{
  return {
    t,
    connected: Meteor.status().connected
  }
}, ConnectionStatusIndicator);

export default ConnectionStatusIndicatorContainer;
