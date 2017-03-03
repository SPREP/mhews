import React from 'react';
import { Meteor } from 'meteor/meteor';
import Paper from 'material-ui/Paper';

import { createContainer } from 'meteor/react-meteor-data';

/* i18n */
import { translate } from 'react-i18next';

import Warnings from '../api/client/warnings.js';
import {WarningCard} from './components/WarningCard.jsx';

import ReceptionTracker from '../api/receptionTracker.js';
import {Preferences} from '../api/client/preferences.js';

export class WarningList extends React.Component {

  constructor(props){
    super(props);
    this.onExpandChange = this.onExpandChange.bind(this);
    this.state = {expandedWarningId : null};
  }

  getWarningSummary(warning){
    const t = this.props.t;

    return t(warning.type) + " " + t(warning.level);
  }

  getWarningDetails(warning){
    return warning.description_en;
  }

  componentDidMount(){
    updateReceptionTracker(this.props.warnings);
  }

  render(){
    console.log("WarningList.render()");
    const warnings = this.props.warnings;
    const t = this.props.t;

    let itemlist = [];
    if( warnings && warnings.length > 0 ){
      itemlist = warnings.map((warning, index) => {
        return (
          <WarningCard key={index} t={t} warning={warning} />
        )
      })
    }
    else{
      itemlist.push(
        <WarningCard t={t} />
      )
    }

    return (
      <Paper zDepth={1}>
        {itemlist}
      </Paper>
    );
  }

  onExpandChange(newExpandState, warningId){
    if( newExpandState == true ){
      this.setState({expandedWarningId: warningId});
    }
    else if( newExpandState == false ){
      if( this.state.expandedWarningId == warningId ){
        this.setState({expandedWarningId: null});
      }
    }
  }

  getExpanded(warningId){
    return this.state.expandedWarningId == warningId;
  }
}

WarningList.propTypes = {
  warnings: React.PropTypes.array,
  t: React.PropTypes.func,
  isAdmin: React.PropTypes.bool,
  cancelWarning: React.PropTypes.func
}

const WarningListContainer = createContainer(()=>{
  const isAdmin = !Meteor.isCordova; // FIXME This is not at all correct logic (^^;
  const joinExercise = Preferences.load("exercise") == "true";

  return {
    isAdmin,
    warnings: Warnings.findWarningsInEffect(undefined, undefined, undefined, joinExercise).fetch(),
    cancelWarning: Warnings.cancelWarning
  }

}, WarningList);

function updateReceptionTracker(warnings){
  Meteor.defer(()=>{
    warnings.forEach((warning)=>{
      ReceptionTracker.onForegroundReception({
        bulletinId: warning.bulletinId,
        type: warning.type,
        level: warning.level,
        in_effect: warning.in_effect,
        issued_at: warning.issued_at
      });
    });
  });
}

export default translate(['common'])(WarningListContainer);
