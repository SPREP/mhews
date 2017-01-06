export function isClientIpAllowed(connection){
  if( !connection ) return true; // Connection from the server itself
  const address = connection.clientAddress;

  // Accept from local network
  if( address == "127.0.0.1" ) return true;
  if( address.startsWith("10.1.") ) return true;
  if( address.startsWith("10.2.") ) return true;
  if( address.startsWith("192.168.") ) return true;

  const ipList = getAllowedClientIpList();
  for(let i= 0; i< ipList.length; i++){
    if( address == ipList[i]){
      return true;
    }
  }

  return false;
}

function getAllowedClientIpList(){
  if( Meteor.settings.allowedClientIPList ){
    return Meteor.settings.allowedClientIPList;
  }
  else{
    return [];
  }
}
