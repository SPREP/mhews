import React from 'react';

/* Imports the mhews's components */
import {getReactComponentByName} from '../api/client/componentHelper.js';

class SwitchableContent extends React.Component {

  shouldComponentUpdate(nextProps, _nextState){
    // Suppress rendering if the drawer is open for better performance.
    if(nextProps.drawerOpen){
      return false;
    }
    // Suppress rendering if the drawer was open but is closed without changing the page.
    if(this.props.drawerOpen && !nextProps.drawerOpen && this.props.page == nextProps.page){
      return false;
    }

    return true;
  }

  /**
  * Handle state change caused by the user choosing a menu.
  */
  render(){
    const page = this.props.page;
    const pageConfig = getPageConfig(page);
    const props = this.props;

    if( pageConfig ){
      if( pageConfig.component ){
        return React.createElement(
          getReactComponentByName(pageConfig.component),
          props
        );
      }
      else{
        console.error("Config for page " + page +" does not contain component property. Check your settings.json.");
      }
    }
    else{
      console.error("Unknown page state:" + this.state.page);
    }
    return (<div>Choose a content from the top-left menu</div>);
  }

}

SwitchableContent.propTypes = {
  page: React.PropTypes.string,
  onPageSelection: React.PropTypes.func,
  drawerOpen: React.PropTypes.bool
}

function getPageConfig(page){
  const config = Meteor.settings.public.pages[page];
  config.key = page;
  return config;
}

export default SwitchableContent;
