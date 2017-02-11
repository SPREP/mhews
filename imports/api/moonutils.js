import SunCalc from 'suncalc';

export class Moon {
  constructor(date){
    this.date = adjustDate(date);
    const moonIllumination = SunCalc.getMoonIllumination(this.date);
    this.moonPhase = moonIllumination.phase;
    this.adjustedMoonPhase = adjustMoonPhase(this.moonPhase, this.date);
  }

  getIcon(){
    return getMoonIcon(this.adjustedMoonPhase);
  }

  getName(){
    return getMoonName(this.adjustedMoonPhase);
  }
}

// According to wikipedia, 12:00 at the local standard time should be used for the moon phase calculation.
// In Samoa, +1500 during the summer time, +1400 otherwise
// TODO: Adjust depending on the summer time or not.
function adjustDate(date){
  const dateStr = moment(date).format("YYYY-MM-DD");
  return moment(dateStr+" 12:00 +1500", "YYYY-MM-DD HH:mm Z").toDate();
}

function getMoonIcon(adjustedMoonPhase){

  const fileIndex = adjustedMoonPhase;
  return "images/moon/moon-phase-"+fileIndex+".svg";
}

const moonNames = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent"
];

function adjustMoonPhase(moonPhase, date){
  if( isClosest(moonPhase, 0.0, date)){
    return 0;
  }
  else if( isClosest(moonPhase, 0.25, date)){
    return 2;
  }
  else if( isClosest(moonPhase, 0.5, date)){
    return 4;
  }
  else if( isClosest(moonPhase, 0.75, date)){
    return 6;
  }
  else if( moonPhase > 0.0 && moonPhase < 0.25 ){
    return 1;
  }
  else if( moonPhase > 0.25 && moonPhase < 0.5 ){
    return 3;
  }
  else if( moonPhase > 0.5 && moonPhase < 0.75 ){
    return 5;
  }
  else{
    return 7;
  }
}

function getMoonName(adjustedMoonPhase){

  return moonNames[adjustedMoonPhase];
}

// Check if moonPhase of the given date is closest to the targetPhase,
// compared to the previous and next day of the given day.
function isClosest(moonPhase, targetPhase, date){
  const phasePrevDay = SunCalc.getMoonIllumination(moment(date).subtract(1, 'days')).phase;
  const phaseNextDay = SunCalc.getMoonIllumination(moment(date).add(1, 'days')).phase;

  return phaseDelta(moonPhase, targetPhase) < phaseDelta(phasePrevDay, targetPhase) &&
         phaseDelta(moonPhase, targetPhase) < phaseDelta(phaseNextDay, targetPhase);
}

// This function adjust the modulous
function phaseDelta(phase1, phase2){
  const delta = Math.abs(phase1 - phase2);
  return Math.min(delta, Math.abs(delta - 1.0));
}
