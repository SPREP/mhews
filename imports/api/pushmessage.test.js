import {Earthquake} from './model/earthquake.js';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import PushMessageSenderFcm from './server/pushmessageSenderFcm.js';

var request = require('request');

const phenomena = {
  "type": "tsunami",
  "bulletinId": 29,
  "issued_at": "2016-12-08 11:55:00",
  "in_effect": true,
  "level": "warning",
  "epicenter": {
    "lat": -4.173686,
    "lng": 155.895308
  },
  "date_time": "2016-12-08 11:45:00",
  "direction_en": "South West",
  "direction_ws": "Saute Sisifo",
  "mw": 8.0,
  "depth": 10,
  "region": "PNG",
  "distance_km": 12345.6789,
  "distance_miles": 7200.12345,
  "description_en": "System test, please ignore.",
  "description_ws": "System test, please ignore."
}

describe('pushmessage', function() {

  if( Meteor.isServer ){

    describe('#doSend', function() {
      it('calls post method with correct options.', sinon.test(function() {
        stubPost(this, {statusCode: 200});
        stubWithRequest(this);

        const message = createSampleMessage();
        const onSuccess = this.spy();
        const onError = this.spy();
        const scheduleRetryOnError = this.spy(message, "scheduleRetryOnError");
        PushMessageSenderFcm.post(message, onSuccess, onError);

        sinon.assert.calledOnce(request.post);
        sinon.assert.calledWith(request.post, sinon.match({json: message.body}));
        sinon.assert.calledOnce(onSuccess);
        sinon.assert.notCalled(onError);
        sinon.assert.notCalled(scheduleRetryOnError);
      }))

      it('should not try resend in case of 400 response from FCM', sinon.test(function() {
        stubPost(this, {statusCode: 400});
        stubWithRequest(this);

        const message = createSampleMessage();
        const onSuccess = this.spy();
        const onError = this.spy();
        const scheduleRetryOnError = this.spy(message, "scheduleRetryOnError");
        PushMessageSenderFcm.post(message, onSuccess, onError);

        sinon.assert.calledOnce(request.post);
        sinon.assert.notCalled(onSuccess);
        sinon.assert.calledOnce(onError);
        sinon.assert.notCalled(scheduleRetryOnError);
      }))

      it('should retry in case of 500 response from FCM', sinon.test(function() {
        stubPost(this, {statusCode: 500});
        stubWithRequest(this);

        const message = createSampleMessage();
        const onSuccess = this.spy();
        const onError = this.spy();
        const scheduleRetryOnError = this.spy(message, "scheduleRetryOnError");
        PushMessageSenderFcm.post(message, onSuccess, onError);

        sinon.assert.calledOnce(request.post);
        sinon.assert.notCalled(onSuccess);
        sinon.assert.notCalled(onError);
        sinon.assert.calledOnce(scheduleRetryOnError);
      }))
    });

  }
});

function stubPost(thisSinon, response){
  thisSinon.stub(request, "post", (_options, callback)=>{
    callback(undefined, response);
  });
}

function stubWithRequest(thisSinon){
  thisSinon.stub(PushMessageSenderFcm, "withRequest", (func)=>{
    func(request);
  });
}

function createSampleMessage(){
  const quake = new Earthquake(phenomena);
  return quake.toPushMessage();
}
