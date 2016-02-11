var ObjectID = require('mongodb').ObjectID;
var _ = require('lodash');
var moment = require('moment');

CollectionDriver = function(db) {
  this.db = db;
}

CollectionDriver.prototype.getCollection = function(collectionName, callback) {
  this.db.collection(collectionName, function(error, the_collection) {
    if( error ) callback(error);
    else callback(null, the_collection);
  });
};

CollectionDriver.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
      if( error ) callback(error);
      else {
        the_collection.find().toArray(function(error, results) {
          if( error ) callback(error);
          else callback(null, results);
        });
      }
    });
};

CollectionDriver.prototype.findSensor = function(collectionName, sensorName, callback) {
    this.getCollection(collectionName, function(error, the_collection){
        if (error) callback(error);
        else {
            the_collection.find({'name':sensorName}).toArray(function(error, results){
                callback(null, results);
            });
        }
    });
};


CollectionDriver.prototype.get = function(collectionName, id, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if (error) callback(error);
        else {
            var checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$");
            if (!checkForHexRegExp.test(id)) callback({error: "invalid id"});
            else {
                the_collection.findOne({'_id':ObjectID(id)}, function(error, docs){
                    returnDocs(error, docs, callback);
                });
            }
        }
    });
};

CollectionDriver.prototype.distinct = function(collectionName, field, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
      if( error ) callback(error);
      else {
        the_collection.distinct(field, function(error, docs){
            returnDocs(error, docs, callback);
        });
      }
    });
};

CollectionDriver.prototype.findDates = function(collectionName, startDate, endDate, callback) {
    this.getCollection(collectionName, function(error, the_collection) {
        if(error) callback(error);
        else {
            var startDateObjectId = objectIdWithTimestamp(startDate);
            var endDateObjectId = objectIdWithTimestamp(endDate);
            var minDate, maxDate;
            the_collection.find({'_id': { '$gt': startDateObjectId, '$lt': endDateObjectId}, 'motion' : 'End'}, {'name':1, 'time':1})
                .toArray(function(error, results){
                    _(results).forEach(function(result){
                        result.endTimestamp = ObjectID(result._id).getTimestamp();
                        result.startTimestamp = moment(result.endTimestamp).subtract(result.time, 'seconds');
                        delete result._id;

                        if (minDate === undefined) {
                            minDate = result.startTimestamp;
                        } else {
                            if (moment(result.startTimestamp).isBefore(minDate)) {
                                minDate = result.startTimestamp;
                            }
                        }
                        if (maxDate === undefined) {
                            maxDate = result.endTimestamp;
                        } else {
                            if (moment(result.endTimestamp).isAfter(maxDate)) {
                                maxDate = result.endTimestamp;
                            }
                        }
                    });
                    callback(null, {'values': results, 'maxTimestamp': maxDate, 'minTimestamp': minDate});
                });
        }
    });
};

var returnDocs = function(error, doc, callback) {
    if (error) callback(error);
    else callback(null, doc);
}

var objectIdWithTimestamp = function(timestamp) {
    if (typeof(timestamp) == 'string') {
        timestamp = new Date(timestamp);
    }
    var hexSeconds = Math.floor(timestamp/1000).toString(16);
    var constructedObjectId = ObjectID(hexSeconds + "0000000000000000");
    return constructedObjectId;
}

exports.CollectionDriver = CollectionDriver;