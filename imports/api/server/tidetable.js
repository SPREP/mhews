import { Meteor } from 'meteor/meteor';

import {TideTableCollection} from '../tidetable.js';
import moment from 'moment';

class TideTableServer {

  constructor(collection){
    _.extend(this, collection);
  }

  start(){
    console.log("TideTableServer started.");

    this.find({
      dateTime: {"$exists": false}
    }).observe({
      added: (tide)=>{
        const dateTime = moment(tide.date+" "+tide.time, "MM/DD/YY HH:mm");
        // Add 1 hour during the daylight saving time.
        // Reference: http://www.bom.gov.au/ntc/IDO60008/IDO60008.201701.pdf
        if( dateTime.isDST() ){
          dateTime.add(1, "hours");
        }
        this.update({"_id": tide._id}, {"$set": {dateTime: dateTime.utc().toDate()}});
      }
    });

    // The 2nd argument must use "function", not the arrow notations.
    // See this guide https://guide.meteor.com/data-loading.html
    Meteor.publish('tideTable', ()=>{
      const now = moment();

      return this.find(
        {
          dateTime: {"$gte": now.subtract(5, "days").toDate(), "$lt": now.add(3, "months").toDate()}
        }
      );
    });

  }
}

export default new TideTableServer(TideTableCollection);
