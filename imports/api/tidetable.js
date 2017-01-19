import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const TideTableCollection = new Mongo.Collection("tideTable");
