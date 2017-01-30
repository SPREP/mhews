import React from 'react';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {toTitleCase} from '../api/strutils.js';

/* i18n */
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';

class AppTemplate extends React.Component {
  render(){
    return (
      <I18nextProvider i18n={ tweakTFunc(i18n) }>
        <MuiThemeProvider>
          {this.props.children}
        </MuiThemeProvider>
      </I18nextProvider>
    )
  }
}

function tweakTFunc(i18n){
  i18n.t = (function(){
    const context = i18n;
    const originalT = i18n.t;

    return function(key, options){
      if( !key ){
        return key;
      }
      const lowerCaseKey = key.toLowerCase();
      const result = originalT.call(context, lowerCaseKey, options);

      // If the original key started with a capital letter, capitalize the result.
      return (key.charAt(0) == key.charAt(0).toUpperCase()) ? toTitleCase(result) : result;

    }
  })();

  return i18n;
}

AppTemplate.propTypes = {
  children: React.PropTypes.node
}

export default AppTemplate;
