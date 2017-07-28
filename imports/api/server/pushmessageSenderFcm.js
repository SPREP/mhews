import { Meteor } from 'meteor/meteor';

class PushMessageSenderFcm {

  post(pushMessage, onSuccess, onError){
    const fcmApiKey = Meteor.settings.fcmApiKey;

    const fcmHeaders = {
      "Content-Type": "application/json",
      "Authorization": "key="+fcmApiKey
    };

    const httpRequest = {
      url: "https://fcm.googleapis.com/fcm/send",
      method: "POST",
      headers: fcmHeaders,
      json: pushMessage.body
    }

    this.withRequest((request)=>{

      const warning = pushMessage.warning;

      request.post(httpRequest, Meteor.bindEnvironment((error, response, body)=>{
        if (!error && response.statusCode == 200) {
          console.log("FCM message was successfully sent for warning "+warning.bulletinId);
          console.log("Response body = "+ JSON.stringify(body));
          if( onSuccess ){
            onSuccess(warning);
          }
        }
        else {
          if( error ){
            console.log("error: "+error);
          }
          if( response ){
            console.log('error response: '+ response.statusCode+ " "+response.statusMessage);
          }

          if( isServerError(response.statusCode) && pushMessage.serverError.retryCount++ < pushMessage.serverError.maxRetry ){
            pushMessage.scheduleRetryOnError();
          }
          else{
            console.error("FCM message couldn't be sent for warning "+warning.bulletinId);
            if( onError ){
              onError(warning, response);
            }
          }
        }
      }));
    })

  }
  withRequest(func){
    import('request').then(({default: request})=>{
      func(request);
    });
  }

}

function isServerError(statusCode){
  return statusCode >= 500;
}

const instance = new PushMessageSenderFcm();
export default instance;
