import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

/* i18n */
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';

class AppTemplate extends React.Component {
  render(){
    return (
      <I18nextProvider i18n={ i18n }>
        <MuiThemeProvider>
          {this.props.children}
        </MuiThemeProvider>
      </I18nextProvider>
    )
  }
}

AppTemplate.propTypes = {
  children: React.PropTypes.node
}

export default AppTemplate;
