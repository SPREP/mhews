import {createContainer} from 'meteor/react-meteor-data';
import Warnings from '../../api/client/warnings.js';

export function createWarningContainer(warningPage){
  return createContainer(({params})=>{
    const id = params.id;

    return {
      phenomena: Warnings.findOne({"_id": id}),
      expanded: true
    }
  }, warningPage);
}
