import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class Admin extends React.Component {

  componentDidMount(){
    Meteor.subscribe("weatherForecast");
  }

  componentWillUnmount(){
    Meteor.unsubscribe("weatherForecast");
  }

  render(){
    return (
      <MuiThemeProvider>
        {this.props.children}
      </MuiThemeProvider>

    )
  }
}

Admin.propTypes = {
  children: React.PropTypes.node
}

export default Admin;
