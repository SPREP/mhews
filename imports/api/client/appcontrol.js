
/* global device */

let quitAppVar;

Meteor.startup(()=>{
  if( Meteor.isCordova ){
    quitAppVar = new ReactiveVar(false);

    Tracker.autorun(()=>{
      if( quitAppVar.get() == true ){
        navigator.app.exitApp();
      }
    })
  }
});

export const quitApp = Meteor.isCordova ? ()=>{ quitAppVar.set(true);} : undefined;
