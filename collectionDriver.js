var ObjectID = require('mongodb').ObjectID;

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
            the_collection.find({'_id': { '$gt': startDateObjectId, '$lt': endDateObjectId}})
                .toArray(function(error, results){
                    callback(null, results);
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