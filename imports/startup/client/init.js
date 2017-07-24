
/* This plugin captures the tap event in React. */
import injectTapEventPlugin from 'react-tap-event-plugin';

import {initFlowRouter} from '../../api/client/flowroute.jsx';

/* global navigator */

Meteor.startup(()=>{

  // These initializations are needed before rendering GUI.
  initTapEventPlugin();

  // Call this function after the initTapEventPlugin().
  // Otherwise, some material-ui components won't work.
//  initRouterWithAdminPage();
  initFlowRouter();

  // TODO: Try to move this after component mounted,
  // so that the load of moment is done after the top page is rendered.
  loadMoment();

  hideSplashScreen();
});

function loadMoment(){
  // Set the global variable moment.
  import("moment").then(({default: m})=>{
    moment = m;
  })
  import("geolib").then(({default: m})=>{
    geolib = m;
  })

}

function initTapEventPlugin(){

  /**
  * This is needed for the material-ui components handle click event.
  * shouldRejectClick disables the onClick, but this is needed to avoid ghost click.
  */
  if( Meteor.isCordova ){
    injectTapEventPlugin({
      shouldRejectClick: function () {
        return true;
      }
    });
  }
  else{
    injectTapEventPlugin();
  }

}

function hideSplashScreen(){
  if( Meteor.isCordova ){
    Meteor.defer(()=>{
      navigator.splashscreen.hide();
    })
  }
}
