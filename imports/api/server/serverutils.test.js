import {chai} from 'meteor/practicalmeteor:chai';
import ServerUtils from './serverutils.js';
import {sinon} from 'meteor/practicalmeteor:sinon';

describe('serverutils', function() {

  describe('#inAllowedClientIpList', function() {
    it('should return true if the given IP address is within the allowed ip range', sinon.test(function() {
      this.stub(ServerUtils, "getAllowedClientIpList", ()=>{
        return ["10.1.32.0/24"];
      });
      chai.assert.isTrue(ServerUtils.inAllowedClientIpList("10.1.32.10"));
    }))

    it('should return true if the given IP address is within one of the allowed ip range', sinon.test(function() {
      this.stub(ServerUtils, "getAllowedClientIpList", ()=>{
        return ["10.1.32.0/24", "10.1.34.0/24"];
      });
      chai.assert.isTrue(ServerUtils.inAllowedClientIpList("10.1.34.10"));
    }))

    it('should return false if the given IP address is not within any of the allowed ip range', sinon.test(function() {
      this.stub(ServerUtils, "getAllowedClientIpList", ()=>{
        return ["10.1.32.0/24", "10.1.34.0/24"];
      });
      chai.assert.isFalse(ServerUtils.inAllowedClientIpList("10.1.36.1"));
    }))
  })

  describe('#isClientIpAllowed', function(){
    it('should return true if the given IP address is within the allowed IP range', sinon.test(function(){
      this.stub(ServerUtils, "getAllowedClientIpList", ()=>{
        return ["10.1.32.0/24"];
      });
      chai.assert.isTrue(ServerUtils.isClientIpAllowed({clientAddress: "10.1.32.10"}));
    }))
    it('should return false if the given IP address is not within the allowed IP range', sinon.test(function(){
      this.stub(ServerUtils, "getAllowedClientIpList", ()=>{
        return ["10.1.32.0/24", "10.1.34.0/24"];
      });
      chai.assert.isFalse(ServerUtils.isClientIpAllowed({clientAddress: "10.2.32.10"}));
    }))
  })
});
