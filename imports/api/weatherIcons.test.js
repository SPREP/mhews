import {chai} from 'meteor/practicalmeteor:chai';
import {selectPredominantWeatherSymbol} from './weatherIcons.js';

describe('weatherIcons', function() {
  // selectPredominantWeatherSymbol considers only the weather symbols between 6:00 and 20:00,
  // because less people are active between 0:00 and 6:00.
  describe('#selectPredominantWeatherSymbol', function() {
    it('should return sunny when it is sunny for the whole day.', function() {
      chai.assert.equal("clear", selectPredominantWeatherSymbol(["clear","clear","clear","clear"]))
    });
    it('should return sunny when it is sunny for the day time and rain during night time.', function() {
      chai.assert.equal("clear", selectPredominantWeatherSymbol(["moderate","clear","clear","moderate"]))
    });
    it('should return rainy when it is sunny in the morning and rainy in the afternoon and night.', function() {
      chai.assert.equal("moderate", selectPredominantWeatherSymbol(["clear","clear","moderate","moderate"]))
    });
    it('should return rainy when it is rainy in the morning and sunny in the afternoon and night.', function() {
      chai.assert.equal("moderate", selectPredominantWeatherSymbol(["clear","moderate","clear","moderate"]))
    });
    it('should return rainy when it is showerly in the morning and rainy in the afternoon.', function() {
      chai.assert.equal("moderate", selectPredominantWeatherSymbol(["clear","shower","moderate","clear"]))
    });
  })
});
