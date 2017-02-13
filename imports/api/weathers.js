import { Mongo } from 'meteor/mongo';

const collectionName = "weatherForecast";

export const WeatherForecasts = new Mongo.Collection(collectionName);
