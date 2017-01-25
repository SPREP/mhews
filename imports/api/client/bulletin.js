import {BulletinCollection} from "../bulletin.js";

export const CycloneBulletins = new BulletinCollection("cycloneBulletins", function(bulletin){
  return {"$and": [
      {in_effect: true},
      {"$or":[
        {id: bulletin.id},
        {tc_info: {name: bulletin.tc_info.name}}
      ]}
    ]}
});
