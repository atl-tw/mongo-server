var http = require('http');
var express = require('express');
var path = require('path');

var mongoClient = require('mongodb').MongoClient,
Server = require('mongodb').Server,
CollectionDriver = require('./collectionDriver').CollectionDriver;

var app = express();
app.set('port', 4666);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var mongoHost = 'localHost'; //A
var mongoPort = 27017;
var collectionDriver;

mongoClient.connect('mongodb://localhost:27017/motionsensor', function(err, db) {
  if (!db) {
      console.error("Error! Exiting... Must start MongoDB first");
      process.exit(1);
  }
  console.log('connected to db');
  collectionDriver = new CollectionDriver(db);
});

app.get('/:collection', function(req, res) {
   var params = req.params;
   collectionDriver.findAll(req.params.collection, function(error, objs) {
    	  if (error) { res.status(400).send(error); }
	      else {
	          if (req.accepts('html')) {
    	          res.render('data',{objects: objs, collection: req.params.collection});
              } else {
	          res.set('Content-Type','application/json');
                  res.status(200).send(objs);
              }
         }
   	});
});

app.get('/:collection/distinct/:field', function(req, res) {
    var params = req.params;
    var collection = params.collection;
    var field = params.field;
    if (field) {
        collectionDriver.distinct(collection, field, function(error, objs) {
          if (error) { res.status(400).send(error); }
          else { res.status(200).send(objs); }
        });
    } else {
        res.status(400).send({error: 'bad url', url: req.url});
    }
});

app.get('/:collection/:entity', function(req, res) {
   var params = req.params;
   var entity = params.entity;
   var collection = params.collection;
   if (entity) {
       collectionDriver.get(collection, entity, function(error, objs) {
          if (error) { res.status(400).send(error); }
          else { res.status(200).send(objs); }
       });
   } else {
      res.status(400).send({error: 'bad url', url: req.url});
   }
});

app.use(function (req,res) {
    res.render('404', {url:req.url});
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
