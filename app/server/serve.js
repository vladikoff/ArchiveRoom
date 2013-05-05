var express = require('express');
var app = express();
var _ = require('lodash');
var cluster = require('cluster');
var fs = require('fs');
var os = require('os');
var csv = require('csv');
var path = require('path');
var moment = require('moment');
var request = require('request');

var worker = require('./worker.js');
var f = "";
var port = 9987;
console.log('Cluster Port: ' + port);


function loadRecords(csvFile, res) {
  var records = [];
  csv().from(csvFile)
    .on('record', function (row, index) {
      records.push(row);
    })
    .on('end', function (count) {
      res.type('application/json');
      res.json(200, { result: _.uniq(records, function (i) {
        return i.toString();
      }) });
    })
}


if (cluster.isMaster) {
  os.cpus().forEach(function () {
    cluster.fork();
  });
} else {

  // enable express strict routing, see http://expressjs.com/api.html#app-settings
  // for more info
  app.set('env', 'production');
  app.enable('strict routing');

  /**
   * express app configuration
   */
  app.configure(function () {
    app.use(express.methodOverride());
    app.use(express.limit('3mb'));
    app.use(express.bodyParser());
    app.use(app.router);
    // use the static router
    app.use(express.static(__dirname + '/../client/out'));
    // if nothing matched, send 404

    app.use(express.errorHandler({
      dumpExceptions: false,
      showStack: false
    }));
  });

  app.listen(port);

  app.get('/view/:user', function (req, res) {
    var k = path.resolve('app/client/out/view.html');
    res.sendfile(k);
  });

  app.get('/user/:user', function (req, res) {

    var csvFile = 'data/csv/' + req.params.user + '.csv';

    fs.exists(csvFile, function (exists) {
      if (exists) {
        loadRecords(csvFile, res);
      } else {
        csvFile = path.join(__dirname, "uploads", req.params.user + '.csv');
        fs.exists(csvFile, function (exists) {
          if(exists) {
            loadRecords(csvFile, res);
          } else {
            res.send(404, '404');
          }
        });
      }
    });

  });

  app.get('/entry/:user/:event', function (req, res) {
    if (req.params.event && req.params.user) {
      var start = Date.now();
      var eventTime = moment(req.params.event, 'YYYY-MM-DD-HH-mm-ss');
      var dst = 7;
      if (eventTime.isDST()) {
        eventTime.subtract('hours', 7);
      } else {
        eventTime.subtract('hours', 8);
        dst = 8;
      }

      worker.load({ user: req.params.user, timeQuery: eventTime, dst: dst }, function (day) {
        console.log('Process Done in:', (Date.now() - start) / 1000, 'seconds.');
        if (day.length === 0) {
          res.json({success: false});
        } else {
          res.json({success: true, result: day });
        }
      });
    }
  });

  app.post('/upload-archive', function(req, res) {
    if (req.body && req.body.username && req.files && req.files.csv) {
      var username = req.body.username;
      var csvPath = path.join(__dirname, "uploads", username + ".csv");
      var file = req.files.csv;
      fs.rename( file.path , csvPath );
      res.redirect('/view/' + username);
    } else {
      res.send(404);
    }

  });

  app.get('/avatar', function(req, res) {
    if (req.query && req.query.s) {
      var avatar = req.query.s;
      if (avatar.match('https://')) {

      } else {
        avatar = 'http://gravatar.com/avatar/' + avatar + '?s=100';
      }
      request.get(avatar).pipe(res);
    } else {
      res.send(404);
    }
  });

}
