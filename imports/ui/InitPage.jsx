import React from 'react';
import {
  Step,
  Stepper,
  StepLabel,
  StepContent,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import i18n from 'i18next';
import { createContainer } from 'meteor/react-meteor-data';
import {Preferences} from '../api/preferences.js';

const districts = [
  "upolu-north-northwest",
  "upolu-east-southwest",
  "savaii-east-northeast",
  "savaii-northwest",
  "savaii-south"
];

/**
 * Vertical steppers are designed for narrow screen sizes. They are ideal for mobile.
 *
 * To use the vertical stepper with the contained content as seen in spec examples,
 * you must use the `<StepContent>` component inside the `<Step>`.
 *
 * <small>(The vertical stepper can also be used without `<StepContent>` to display a basic stepper.)</small>
 */
class InitPage extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      finished: false,
      stepIndex: 0
    };
  }

  handleNext(){
    let {stepIndex} = this.state;
    stepIndex ++;
    const finished = stepIndex > 2;
    if( finished ){
      this.props.handleFinished();
    }
    this.setState({
      stepIndex: stepIndex,
      finished: finished,
    });
  }

  handlePrev(){
    const {stepIndex} = this.state;
    if (stepIndex > 0) {
      this.setState({stepIndex: stepIndex - 1});
    }
  }

  renderStepActions(step) {
    const {stepIndex} = this.state;

    return (
      <div style={{margin: '12px 0'}}>
        <RaisedButton
          label={stepIndex === 2 ? 'Finish' : 'Next'}
          disableTouchRipple={true}
          disableFocusRipple={true}
          primary={true}
          onTouchTap={()=>{this.handleNext()}}
          style={{marginRight: 12}}
        />
        {step > 0 && (
          <FlatButton
            label="Back"
            disabled={stepIndex === 0}
            disableTouchRipple={true}
            disableFocusRipple={true}
            onTouchTap={()=>{this.handlePrev()}}
          />
        )}
      </div>
    );
  }

  render() {
    const {_finished, stepIndex} = this.state;
    const props = this.props;

    return (
      <div style={{maxWidth: 380, maxHeight: 400, margin: 'auto'}}>
        <p>Initial settings</p>
        <Stepper activeStep={stepIndex} orientation="vertical">
          <Step>
            <StepLabel>Select the language</StepLabel>
            <StepContent>
              <p>
                Please choose the language in which the application shows the contents.
              </p>
              <RadioButtonGroup name="language" onChange={(e, v)=>{props.onSelection("language", v)}} defaultSelected={this.props.selectedLanguage}>
                <RadioButton
                  key="en"
                  label="English"
                  value="en"/>
                <RadioButton
                  key="ws"
                  label="Samoan"
                  value="ws"/>
              </RadioButtonGroup>
              {this.renderStepActions(0)}
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Select the district</StepLabel>
            <StepContent>
              <p>Please choose the district where you usually are. The app shows the contents for the selected district.</p>
              <RadioButtonGroup name="district" onChange={(e, v)=>{props.onSelection("district", v)}} defaultSelected={this.props.selectedDistrict}>
                {
                  districts.map((district)=>(
                    <RadioButton
                      key={district}
//                      label={this.props.t("district."+district)}
                      label={district}
                      value={district} />
                  ))
                }
              </RadioButtonGroup>
              {this.renderStepActions(1)}
            </StepContent>
          </Step>
          <Step>
            <StepLabel>Start the app</StepLabel>
            <StepContent>
              <p>The app uses the language {props.language} and district {props.district} as your preferences.
                You can change them in the Preferences menu of the side menu.
              </p>
              {this.renderStepActions(2)}
            </StepContent>
          </Step>
        </Stepper>
      </div>
    );
  }
}

let selectedLanguage = new ReactiveVar();

let selectedDistrict = new ReactiveVar();

InitPage.propTypes = {
  onSelection: React.PropTypes.func,
  handleFinished: React.PropTypes.func,
  selectedLanguage: React.PropTypes.string,
  selectedDistrict: React.PropTypes.string,
  t: React.PropTypes.func
}

const InitPageContainer = createContainer(({onFinished, t})=>{
  return {
    onFinished,
    selectedLanguage: selectedLanguage.get(),
    selectedDistrict: selectedDistrict.get(),
    onSelection: (key, value)=>{
      if( key == "language" ){
        selectedLanguage.set(value);
      }
      else if( key == "district" ){
        selectedDistrict.set(value);
      }
      else{
        console.error("onSelection was called with unknown key "+key+" and value="+value+" pair.");
      }
    },
    handleFinished: ()=>{
      const language = selectedLanguage.get();
      Preferences.save("language", language);
      Preferences.save("district", selectedDistrict.get());
      onFinished();
    },
    t
  }

}, InitPage);

export default InitPageContainer;
