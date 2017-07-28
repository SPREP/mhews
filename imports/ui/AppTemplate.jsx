import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

class AppTemplate extends React.Component {
  render(){
    return (
      <MuiThemeProvider>
        {this.props.children}
      </MuiThemeProvider>
    )
  }
}

AppTemplate.propTypes = {
  children: React.PropTypes.node
}

export default AppTemplate;
