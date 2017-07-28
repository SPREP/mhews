import { Meteor } from 'meteor/meteor';
import i18n from 'i18next';

class PushMessageSenderOneSignal {

  post(pushMessage, onSuccess, onError){

    const restApiKey = Meteor.settings.oneSignalRestApiKey;
    const appId = Meteor.settings.public.oneSignalAppId;
    const warning = pushMessage.warning;
    const body = pushMessage.body;

    const oneSignalHeaders = {
      "Content-Type": "application/json; charset=utf-8",
      "Authorization": "Basic "+restApiKey
    };

    const oneSignalOptions = {
      host: "onesignal.com",
      port: 443,
      path: "/api/v1/notifications",
      method: "POST",
      headers: oneSignalHeaders
    }

    const filters = warning.getOneSignalFilters(pushMessage.topic);

    // https://documentation.onesignal.com/reference
    // OneSignal requires that the sound file excludes the file extension.
    const message = {
      app_id: appId,
      contents: {"en": warning.getHeaderTitle((word)=>{return i18n.t(word, {lang: "en"})})},
      headings: {"en": body.notification.title},
      data: body.data,
      android_sound: removeFileExtension(body.notification.sound),
      ttl: body.time_to_live,
      priority: 10,
      filters: filters
    }

    console.log("Sending message to OneSignal "+JSON.stringify(message));

    import('https').then(({default: https})=>{

      const req = https.request(oneSignalOptions,  (res)=> {
        res.on('data', function(data) {
          console.log("Response:");
          console.log(JSON.parse(data));
          if( onSuccess ){
            onSuccess(data);
          }
        });
      });

      req.on('error', function(e) {
        console.log("ERROR:");
        console.log(e);
        if( onError ){
          onError(e);
        }

        // FIXME: It must try to resend the message depending on the error.
        // Example) Connection failure due to unstable connection.
        // I20170718-23:31:28.033(13)? ERROR:
        // I20170718-23:31:28.037(13)? { [Error: socket hang up] code: 'ECONNRESET' }
      });

      req.write(JSON.stringify(message));
      req.end();
    })

  }
}

function removeFileExtension(soundFile){
  soundFile = soundFile.replace(new RegExp("\.wav$"), "");
  soundFile = soundFile.replace(new RegExp("\.mp3$"), "");

  return soundFile;
}

const instance = new PushMessageSenderOneSignal();
export default instance;
