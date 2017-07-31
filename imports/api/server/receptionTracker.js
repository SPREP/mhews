import {ReceptionTrackerCollection} from '../../api/receptionTracker.js';

class ReceptionTrackerServer {

  start(){
    ReceptionTrackerCollection.find({reception_date: {"$gte": new Date()}}).observe({
      added: (message)=>{
        console.log("Reception tracker message : "+JSON.stringify(message));
      }
    });

  }

}

const instance = new ReceptionTrackerServer();
export default instance;
