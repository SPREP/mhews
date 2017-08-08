import {Warning} from './warning.js';

export class Wind extends Warning {

  check(){
    super.check();

    check(this.area, String);
    check(this.direction, String);

  }
  isSameEvent(another){
    return this.area == another.area && this.direction == another.direction;

  }
  toFcmMessage(){
    const fcmMessage = super.toFcmMessage();
    fcmMessage.notification.body = this.area + (this.direction ? " " + this.direction : "");
    fcmMessage.data.area = this.area;
    fcmMessage.data.direction = this.direction;
    return fcmMessage;
  }

}
