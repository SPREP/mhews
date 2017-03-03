import {Meteor} from 'meteor/meteor';
var os = require('os');
var ip = require('ip');

const localSubnets = [];

class ServerUtilsClass {

  constructor(){
    getLocalNetworks();
  }

  isClientIpAllowed(connection){
    if( !connection ) return true; // Connection from the server itself
    const address = connection.clientAddress;

    if( this.inLocalSubnets(address)){
      return true;
    }
    return this.inAllowedClientIpList(address);
  }

  inLocalSubnets(address){
    return localSubnets.some(function(subnet){
      return subnet.contains(address);
    })
  }

  inAllowedClientIpList(address){

    return this.getAllowedClientIpList().some(function(allowedIp){
      return isCidr(allowedIp) ? ip.cidrSubnet(allowedIp).contains(address) : allowedIp == address;
    });
  }

  getAllowedClientIpList(){
    if( Meteor.settings.allowedClientIPList ){
      return Meteor.settings.allowedClientIPList;
    }
    else{
      return [];
    }
  }
}

function isCidr(address){
  return address.indexOf("/") > 0;
}

function getLocalNetworks(){
  var ifaces = os.networkInterfaces();

  Object.keys(ifaces).forEach(function (ifname) {

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family ) {
        return;
      }
      localSubnets.push(ip.subnet(iface.address, iface.netmask));
    });
  });
}

const ServerUtils = new ServerUtilsClass();
export default ServerUtils;
