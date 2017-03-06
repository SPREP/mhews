import Warnings from '../warnings.js';
import WarningFactory from '../model/warningFactory.js';
import {PushMessage} from '../pushmessage.js';

// PushServer checks incoming warning messages in the Warning Collection,
// and send push notification to the mobile clients.
// The current implementation relies on the Google Firebase.
class PushServer {

  // TODO
  // The PushServer should be started on only one server when multiple servers are off-loading.
  start(){
    // Observe the Warnings collection to send push message when the result set has changed.
    this.handle = Warnings.find({in_effect: true}).observe(withTranslation({
      added: function(warning){
        console.log("Enter observe.added()");
        pushWarning(warning, warning.changeNeedsAttention());
      },
      changed: function(newWarning, oldWarning){
        console.log("Enter observe.changed()");
        if( newWarning.hasNoSignificantChange(oldWarning)){
          return;
        }
        pushWarning(newWarning, newWarning.changeNeedsAttention(oldWarning));
      },
      removed: function(warning){
        console.log("Enter observe.removed()");
        // Here, the warning is effective document when it was in the result set (i.e. in_effect = true)
        // Change it to false so that the pushWarning chooses the right cancellation message.
        warning.in_effect = false;
        pushWarning(warning, false);
      }

    }));

  }

  stop(){
    if( this.handle ){
      this.handle.stop();
      this.handle = null;
    }
  }
}

function withTranslation(observer){
  const observerWithTranslation = {};
  if( observer.added ){
    observerWithTranslation.added = (entity)=>{observer.added(WarningFactory.create(entity))};
  }
  if( observer.removed ){
    observerWithTranslation.removed = (entity)=>{observer.removed(WarningFactory.create(entity))};
  }
  if( observer.changed ){
    observerWithTranslation.changed = (newEntity, oldEntity)=>{observer.changed(WarningFactory.create(newEntity), WarningFactory.create(oldEntity))};
  }

  return observerWithTranslation;
}

function pushWarning(warning, needsAttention){
  if( warning.in_effect && warning.is_user_notified ){
    // FCM message has already been sent for this warning.
    return;
  }
  if( !warning.in_effect && warning.level == "information"){
    // Don't send notification for expiry of Information.
    return;
  }
  const message = new PushMessage(warning, needsAttention);
  if( warning.type == "tsunami" && warning.isMoreSignificant("information") && warning.in_effect ){
    message.repeat(5).interval(3*60).collapse(warning.type).cancelIf(()=>{
      return Warnings.isCancelled(warning._id) || Warnings.hasSevererWarning(warning._id);
    });
  }
  message.send((warning)=>{
    // This will prevent the server from sending the push message twice or more.
    Warnings.update({_id: warning._id}, {"$set": {is_user_notified: true}});
  });
}

export default new PushServer();
