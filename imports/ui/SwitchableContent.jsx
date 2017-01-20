import React from 'react';

/* Imports the mhews's components */
import {getReactComponentByName} from '../api/client/componentHelper.js';
import { createContainer } from 'meteor/react-meteor-data';

class SwitchableContent extends React.Component {

  shouldComponentUpdate(nextProps, _nextState){
    // Suppress rendering if the drawer is open. Otherwise it is too slow.
    if(nextProps.drawerOpen){
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
  t: React.PropTypes.func,
  onPageSelection: React.PropTypes.func,
  drawerOpen: React.PropTypes.bool
}

function getPageConfig(page){
  const config = Meteor.settings.public.pages[page];
  config.key = page;
  return config;
}

const SwitchableContentContainer = createContainer(({t, page, onPageSelection})=>{

  return {
    page,
    t,
    onPageSelection
  }
}, SwitchableContent);

export default SwitchableContentContainer;
