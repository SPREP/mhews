import {Warning} from './warning.js';

export class HeavyRain extends Warning {

  check(){
    super.check();
    
    check(this.area, String);
    check(this.direction, String);

  }
  isSameEvent(another){
    return this.area == another.area && this.direction == another.direction;

  }
}
