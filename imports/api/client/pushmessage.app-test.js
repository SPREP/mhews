import {chai} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import {Meteor} from 'meteor/meteor';
import Warnings from '/imports/api/client/warnings.js';

import tsunamiInfo from './test_data/tsunamiInfo.js';
import tsunamiWarning from './test_data/tsunamiWarning.js';
import tsunamiWatch from './test_data/tsunamiWatch.js';
import heavyRainWarning from './test_data/heavyRainWarning.js';
import windAdvisory from './test_data/windAdvisory.js';

const _ = require("lodash");

function parseDate(str){
  return moment(str, 'YYYY-MM-DD HH:mm:ss').toDate();
}

// This test suite will test end to end warning message delivery,
// from the publish by a client to the reception by a client
// in both meteor collection and fcm (to be implemented).
describe('pushmessage-app', function() {

  if( Meteor.isClient ){

    beforeEach(function(){
      // TODO Empty the warnings collection.
    })

    afterEach(function(){
    })

    describe('#publishWarning', function() {
      it('publish a valid tsunami info.', function(done) {
        this.timeout(5000);
        testPublish(done, loadPhenomena(tsunamiInfo));
      })

      it('cancel the tsunami info.', function(done){
        this.timeout(5000);
        testCancel(done, loadPhenomena(tsunamiInfo));
        // This should not send the cancellation push message
       })

      it('publish a valid tsunami watch.', function(done) {
        this.timeout(5000);
        testPublish(done, loadPhenomena(tsunamiWatch));
      })

      it('cancel the tsunami watch.', function(done){
        this.timeout(5000);
        testCancel(done, loadPhenomena(tsunamiWatch));
       })

      it('publish a valid tsunami warning.', function(done) {
        this.timeout(5000);
        testPublish(done, loadPhenomena(tsunamiWarning));
      })

      it('cancel the tsunami warning.', function(done){
        this.timeout(5000);
        testCancel(done, loadPhenomena(tsunamiWarning));
       })

      it('publish a valid heavy rain warning.', function(done) {
        this.timeout(5000);
        testPublish(done, loadPhenomena(heavyRainWarning));
      })

      it('cancel the heavy rain warning.', function(done){
        this.timeout(5000);
        testCancel(done, loadPhenomena(heavyRainWarning));
       })

      it('publish a wind advisory.', function(done) {
        this.timeout(5000);
        testPublish(done, loadPhenomena(windAdvisory));
      })

      it('cancel the wind advisory.', function(done){
        this.timeout(5000);
        testCancel(done, loadPhenomena(windAdvisory));
       })
    });

  }
});

function loadPhenomena(phenomena){
  if( phenomena.issued_at ){
    phenomena.issued_at = parseDate(phenomena.issued_at);
  }
  if( phenomena.date_time ){
    phenomena.date_time = parseDate(phenomena.date_time);
  }

  return phenomena;
}

function testPublish(done, phenomena){

  const callback = sinon.spy();
  Meteor.call("publishWarning", phenomena, callback);
  setTimeout(function(){
    sinon.assert.calledOnce(callback);
    checkWarningList([phenomena]);

    done();
  }, 1000);
}

function testCancel(done, phenomena){

  const cancellation = _.extend({}, phenomena, {in_effect: false});
  const callback = sinon.spy();

  Meteor.call("publishWarning", cancellation, callback);
  setTimeout(function(){
    sinon.assert.calledOnce(callback);
    checkEmptyWarningList();

    done();
  }, 1000);
}

function testPublishAndCancel(done, phenomena){
  const callback = sinon.spy();
  Meteor.call("publishWarning", phenomena, callback);
  setTimeout(function(){
    sinon.assert.calledOnce(callback);
    checkWarningList([phenomena]);

    testCancel(done, phenomena);
  }, 1000);
}

function checkEmptyWarningList(){
  chai.assert.equal(0, Warnings.find().count());
}

function checkWarningList(phenomenaList){
  const warnings = Warnings.find().fetch();
  chai.assert.equal(warnings.length, phenomenaList.length);
  warnings.sort(function(a, b){ return a.bulletinId - b.bulletinId});
  phenomenaList.sort(function(a, b){ return a.bulletinId - b.bulletinId});
  warnings.forEach(function(warning, index){
    chai.assert.equal(warning.bulletinId, phenomenaList[index].bulletinId);
  });
}
