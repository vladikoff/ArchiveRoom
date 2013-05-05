// week space
var zS = 2 * 12 + 35;
// day space
var xD = 2 * 31 + 5;
// side space
var zZ = -15;
var eventData = [];
var __moving = false;
// fancy viewer
// our world started this day!
var worldStart = moment("2012-03-01T00:00:00Z", "YYYY-MM-DD HH:mm");
// get the username
var user = location.pathname.split('/')[2];
// store positions and locations
var savedLocs = {};
var posStack = {};

module.exports = function (opts, setup) {
  setup = setup || defaultSetup;
  var defaults = {
    generate: function (x, y, z) {
      //walls
      if ((x === -10 || x === xD) && y > -4 && y < 120 && z >= zZ && z < zS) {
        return 1;
      }

      if ((z === zZ || z === zS) && y > -4 && y < 120 && x >= -10 && x < xD) {
        return 1;
      }

      // plate
      if (y === -2 && x >= -20 && x < xD && z >= zZ && z < zS) {
        return 1;
      }

      if ((y === 65 ) && x > -20 && x < xD && z > zZ && z < zS) {
        return 2;
      }
      return 0;
    },
    texturePath: '/textures/',
    chunkSize: 32,
    chunkDistance: 3,
    materials: [
      ['floor'],  // 1
      ['around'], // 2
      'eWatch', // 3
      'eFork', // 4
      'eGist', // 5
      'eCreate', // 6
      'eFollow', // 7
      'eDownload', // 8
      'eTeam', // 9
      'ePush', // 10
      'eComment', // 11
      'ePublic', // 12
      'ePull', // 13
      'eDelete', // 14
      'eCommentCommit', // 15
      'eIssueAction', // 16
      'ePullComment' // 17
    ],
    statsDisabled: true,
    fogDisabled: false,
    worldOrigin: [0, 0, 0],
    controls: {
      discreteFire: true,
      speed: Number(0.010),
      maxSpeed: Number(0.015),
      jumpSpeed: Number(0.015)
    }
  };

  opts = extend({}, defaults, opts || {});

  // setup the game and add some trees
  var game = createGame(opts);
  var createPlayer = player(game);
  // for debugging
  window.game = game;
  // set typeface js
  window._typeface_js = {faces: game.THREE.FontUtils.faces, loadFace: game.THREE.FontUtils.loadFace};
  game.THREE.typeface_js = this._typeface_js;
  // shim layer with setTimeout fallback
  window.requestAnimFrame = (function(){
    return window.requestAnimationFrame  ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame    ||
      window.oRequestAnimationFrame      ||
      window.msRequestAnimationFrame     ||
      function( callback ){
        window.setTimeout(callback, 1000 / 60);
      };
  })();
  // throw this here
  window.THREE = game.THREE;

  var container = opts.container || document.body;
  game.startingPosition = [0, 10, 0];
  game.appendTo(container);
  var makeFly = fly(game);
  var avatar = createPlayer('/img/player.png');
  avatar.possess();
  avatar.yaw.position.set(66, 15, 56);
  avatar.yaw.rotation.set(0, 0.90, 0);
  makeFly(avatar);
  window.avatar = avatar;
  setup(game, avatar);

  // player start platform
  game.setBlock([66, 14, 56], 1);

  return game

};


function defaultSetup(game, avatar) {
  var blockViewer;
  var TABKEY = 9;
  var ENTERKEY = 13;
  var pos;
  var hl = game.highlighter = highlight(game, {wireframeLinewidth: 20});

  hl.on('highlight', function (voxelPos) {
    pos = voxelPos;
    //console.log(voxelPos);
  });

  window.addEventListener('keydown', function (ev) {
    __moving = true;

    if (ev.keyCode === 69) {
      $("#card").animate({right: -300});
    }
    // take a screenshot
    else if (ev.keyCode === TABKEY) {
      stop.shutter();
    }
    // open active url
    else if (ev.keyCode === ENTERKEY && viewerActiveUrl && viewerActiveUrl.length > 0) {
      window.open(viewerActiveUrl);
    }
  });

  window.addEventListener('keyup', function (ev) {
    __moving = false;
  });

  function animate () {
    if (eventData.length > 0 && !__moving) {
      // TODO: lol, stress test
      for (var i=0; i < 25; i++) {
        renderBlocks(eventData);
      }
    }
    window.requestAnimFrame(animate);
  }

  game.once('tick', function () {

    animate();

    if (user.length > 0) {
      $.getJSON('/user/' + user)
       .done(function (data) {
          eventData = data.result;
       })
       .fail(function () {
          alert('Sorry, user not found.');
       });
    }
    // fancy labels
    var labels = require('./labels')(game, user);
    // fancy viewer
    blockViewer = require('./viewer')(game, user);
    var screenshot = require('./screenshot')(game);
    window.stop = screenshot;
  });


  game.on('fire', function (target, state) {
    var firePos = pos;
    var errorData = {
      error: true,
      errorBody: 'Sorry, no data available.'
    };
    var loadingData = {
      loading: true,
      loadingBody: 'Loading event data ...'
    };
    if (firePos) {
      var timeFrame = savedLocs[firePos[0] + '_' + firePos[1] + '_' + firePos[2]];
      if (timeFrame) {
        var timeQuery = timeFrame.replace(/ /g, '-').replace(/:/g, '-');
        blockViewer.show(firePos, loadingData);
        $.getJSON('/entry/' + user + '/' + timeQuery)
         .done(function (data) {
            var context = data.result;
            if (context && context.created_at) {
              context.created_at_format = moment(context.created_at).format('MMMM Do YYYY');
              blockViewer.show(firePos, data.result);
            } else {
              blockViewer.show(firePos, errorData);
            }
         })
         .fail(function(jqxhr, textStatus, error) {
            blockViewer.show(firePos, errorData);
         });
      }
    }
  })
}


function getWorldPosition(d) {
  var eventDate = moment(d);
  return 3 * Math.abs(worldStart.diff(eventDate, 'months'));
}


function renderBlocks(data) {
  var entry = data.pop();

  if (entry) {
    var month = getWorldPosition(entry[1]);
    var type = entry[0];
    // default texture
    var t = 1;
    switch (type) {
      case 'CommitCommentEvent':
        t = 15;
        break;
      case 'CreateEvent':
        t = 6;
        break;
      case 'DeleteEvent':
        t = 14;
        break;
      case 'DownloadEvent':
        t = 8;
        break;
      case 'FollowEvent':
        t = 7;
        break;
      case 'ForkEvent':
        t = 4;
        break;
      case 'ForkApplyEvent':
        t = 4; // same as fork event
        break;
      case 'GistEvent':
        t = 5;
        break;
      case 'GollumEvent':
        t = 5; // same as gist
        break;
      case 'IssueCommentEvent':
        t = 11;
        break;
      case 'IssuesEvent':
        t = 16;
        break;
      case 'MemberEvent':
        t = 9; // same as Team event
        break;
      case 'PublicEvent':
        t = 12;
        break;
      case 'PullRequestEvent':
        t = 13;
        break;
      case 'PullRequestReviewCommentEvent':
        t = 17;
        break;
      case 'PushEvent':
        t = 10;
        break;
      case 'TeamAddEvent':
        t = 9;
        break;
      case  'WatchEvent':
        t = 3;
        break;
      default:
        t = 0;
        //console.log('unmatched event: ' + type);
    }

    var day = moment(entry[1]).date();
    var pos = [day * 2, -1, month];

    if (pos[0] + "_" + pos[1] + "_" + pos[2] in posStack) {
      posStack[pos[0] + "_" + pos[1] + "_" + pos[2]] = posStack[pos[0] + "_" + pos[1] + "_" + pos[2]] + 1;
    } else {
      posStack[pos[0] + "_" + pos[1] + "_" + pos[2]] = -1;
    }
    var stack = posStack[pos[0] + "_" + pos[1] + "_" + pos[2]];
    pos = [day * 2, stack, month];

    if (stack < 65) {
      try {
        savedLocs[pos[0] + "_" + pos[1] + "_" + pos[2]] = entry[1];
        game.setBlock(pos, t);
      } catch (e) {

      }
    }
  }
}
