import { Meteor } from 'meteor/meteor';

export const ReceptionTrackerCollection = new Meteor.Collection("receptionTracker");

if(Meteor.isServer){
  ReceptionTrackerCollection.allow({
    insert: ()=>{ return true }
  })
}

export class ReceptionTrackerClass {

  constructor(){
    this.queue = [];
    this.trackerId = new ReactiveVar();
    this.hasNewData = new ReactiveVar(false);

    Tracker.autorun(()=>{
      if( this.trackerId.get() && this.hasNewData.get()){
        this.queue.forEach((message)=>{
          message.trackerId = this.trackerId;
          ReceptionTrackerCollection.insert(message);
        });
        this.queue = [];
        this.hasNewData.set(false);
      }
    });
  }

  onBackgroundReception(bulletinId){
    this.insert({
      bulletinId: bulletinId,
      event: "backgroundReception",
      reception_date: new Date()
    });
  }

  onForegroundReception(bulletinId){
    this.insert({
      bulletinId: bulletinId,
      event: "foregroundReception",
      reception_date: new Date()
    });
  }

  onAccessingDetails(bulletinId){
    this.insert({
      bulletinId: bulletinId,
      event: "accessDetails",
      reception_date: new Date()
    });
  }

  setTrackerId(trackerId){
    this.trackerId.set(trackerId);
  }

  insert(message){
    this.queue.push(message);
    this.hasNewData.set(true);
  }
}

const ReceptionTracker = new ReceptionTrackerClass();
export default ReceptionTracker;
