// TODO: update worker to scale
exports.load = function (m, cb) {
  var callback = cb;
  var fs = require('fs');
  var zlib = require('zlib');
  var clarnetStream = require("clarinet").createStream({});
  var previous = '';
  var buffer = {};
  var stack = [];
  var new_thing = false;
  var found = false;
  var sent = false;

  var event = m.timeQuery;
  var user = m.user;

  var file = 'data/raw/' + event.format('YYYY') + '-' + event.format('MM') + '-' + event.format('DD') + '-' + event.format('H') + '.json.gz';
  // stored in 3 diff formats or more lol
  //created_at:
  // 2012/03/23 18:33:54 -0700'
  // 2012-07-09T13:52:04-07:00
  // 2012/03/14 15:19:28 -0700
  var f1 = 'YYYY/MM/DD HH:mm:ss -700';
  var f2 = 'YYYY-MM-DDTHH:mm:ss-07:00';
  var f3 = 'YYYY/MM/DD HH:mm:ss -0700';
  if (m.dst == 8) {
    f1 = 'YYYY/MM/DD HH:mm:ss -800';
    f2 = 'YYYY-MM-DDTHH:mm:ss-08:00';
    f3 = 'YYYY/MM/DD HH:mm:ss -0800';
  }

  var timeFormat = event.format(f1);
  var timeFormat2 = event.format(f2);
  var timeFormat3 = event.format(f3);
  //console.log('Looking for', user, 'in file', file, 'at', timeFormat, 'or', timeFormat2);

  clarnetStream.on('openobject', function (name) {
    if (stack.length === 0) {
      buffer = {};
    }
    if (new_thing) {
      buffer = {};
      new_thing = false;
    }
    previous = name;
    stack.push(name);
  });

  clarnetStream.on('closeobject', function () {
    stack.pop();

    if (buffer.actor && buffer.created_at) {
      if (
        (timeFormat === buffer.created_at || timeFormat2 === buffer.created_at || timeFormat3 === buffer.created_at) &&
          buffer.actor === user &&
          buffer.type) {
        found = true;
      }
    }

    if (stack.length === 0 && found && !sent) {
      sent = true;
      callback(buffer);
      //console.log(buffer);
      new_thing = true;
    }
  });

  clarnetStream.on('key', function (name) {
    previous = name;
    stack.pop();
    stack.push(name);
  });

  clarnetStream.on('value', function (value) {
    if (previous === 'event') {
      value = JSON.parse(value);
    }
    var expected = stack.length - 1;
    stack.reduce(function (ac, x, i) {
      if (i === expected) {
        ac[x] = value;
      }
      ac[x] = ac[x] || {};
      return ac[x];
    }, buffer);
  });

  clarnetStream.on('error', function (e) {
    new_thing = true;
  });

  clarnetStream.on('end', function (d) {
    if (!found) callback([]);
  });

  fs.createReadStream(file)
    .on('error', function () {
      console.log('No File');
      if (!found) callback([]);
    })
    .pipe(zlib.createUnzip())
    .pipe(clarnetStream);
};
