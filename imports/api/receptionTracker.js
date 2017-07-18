import { Meteor } from 'meteor/meteor';

export const ReceptionTrackerCollection = new Meteor.Collection("receptionTracker");

if(Meteor.isServer){
  ReceptionTrackerCollection.allow({
    insert: ()=>{ return true }
  })
}

export class ReceptionTrackerClass {

  constructor(){
    console.log("============= ReceptionTrackerClass constructor.");
    
    this.queue = [];
    this.trackerId = new ReactiveVar();
    this.hasNewData = new ReactiveVar(false);

    Tracker.autorun(()=>{
      if( this.trackerId.get() && this.hasNewData.get()){
        const trackerId = this.trackerId.get();
        this.queue.forEach((message)=>{
          message.trackerId = trackerId;
          ReceptionTrackerCollection.insert(message);
        });
        this.queue = [];
        this.hasNewData.set(false);
      }
    });
  }

  onBackgroundReception(message){
    this.insert(createTrackerMessage("backgroundReception", message));
  }

  onForegroundReception(message){
    this.insert(createTrackerMessage("foregroundReception", message));
  }

  onAccessingDetails(message){
    this.insert(createTrackerMessage("accessDetails", message));
  }

  setTrackerId(trackerId){
    this.trackerId.set(trackerId);
  }

  insert(message){
    this.queue.push(message);
    this.hasNewData.set(true);
  }
}

function createTrackerMessage(event, ...message){
  return {
    message,
    event: event,
    reception_date: new Date()
  }
}

const ReceptionTracker = new ReceptionTrackerClass();
export default ReceptionTracker;
