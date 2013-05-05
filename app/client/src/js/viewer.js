(function (exports) {
  var Viewer = function (game, user) {
    if (!(this instanceof Viewer)) return new Viewer(game, user);
    this.game = game;
    this.user = user;
    this.cB = {
      size: 0.1,
      height: 0.01,
      curveSegments: 4,
      font: 'helvetiker',
      weight: 'bold',
      style: 'normal',
      material: 0,
      extrudeMaterial: 1
    };

    this.cR = {};
    extend(this.cR, this.cB);
    this.cR.weight = 'normal';
    this.cR.size = 0.07;
  };


  Viewer.prototype.show = function (pos, data) {
    var game = this.game;
    var aPos = avatar.position;
    var sideView = 'left';
    if (aPos.z > pos[2] + 0.5) {
      sideView = 'right';
    }

    // remove old viewer
    game.scene.remove(this.group);
    // new viewer group
    this.group = new game.THREE.Object3D();//create an empty container
    // material
    var glassMaterial = new game.THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
    // create canvas
    var geometry = new game.THREE.CubeGeometry(2, 3, 0.01);

    this.sheet = new game.THREE.Mesh(geometry, glassMaterial);
    this.group.add(this.sheet);

    // create canvas pointer
    var geometry = new game.THREE.CubeGeometry(1, 1, 0.01);
    this.pointer = new game.THREE.Mesh(geometry, glassMaterial);
    this.pointer.position.x = -1;
    this.pointer.position.y = -1;
    this.pointer.position.z = -0.5;
    if (sideView === 'right') {
      this.pointer.position.x = 1;
    }
    this.pointer.rotation.y = -Math.PI / 2;
    this.group.add(this.pointer);

    // create wrapper
    // 1
    var geometry = new game.THREE.CubeGeometry(1.05, 1.05, 1.05);
    this.wrap = new game.THREE.Mesh(geometry, glassMaterial);
    this.wrap.position.x = -1.5;
    this.wrap.position.y = -1;
    this.wrap.position.z = -1.5;
    if (sideView === 'right') {
      this.wrap.position.x = 1.5;
    }
    window.megaWrap = this.wrap;
    this.group.add(this.wrap);

    // group setting
    this.group.position.set(0, -10, 0);
    this.group.rotation.y = Math.PI / 2;
    //when done, add the group to the scene
    game.scene.add(this.group);

    window.group1 = this.group;

    this.lS = 1.3;
    //console.log(pos);
    //console.log(data);

    this.group.position.set(pos[0] + 2, pos[1] + 1.5, pos[2] - 1);
    if (sideView === 'right') {
      this.group.position.z = pos[2] + 2;
    }
    var cB = this.cB;

    if (data.loading) {
      this.lS -= 0.6;
      this._writeLine(data.loadingBody, this.cB);
    } else if (data.error) {
      this.lS -= 0.6;
      this._writeLine(data.errorBody, this.cB);
    } else {
      this._writeLine(data.created_at_format);
      this._writeLine(this.user, this.cB);
      this.__typeTranslate(data);
      if (data.repository && data.repository.name) {
        var rep = data.repository;
        this.lS -= 0.15;
        var lang = (rep.language) ? rep.language + ' ' : '';
        this._writeLine(lang + 'Repository', this.cB);
        this._writeLine(rep.name);
        if (rep.description && typeof rep.description === 'string') {
          this._writeLine(rep.description.substring(0,36).toLowerCase() + '...');
        }
        if (rep.owner) {
          this._writeLine('Owned by ' + rep.owner);
        }
        if (rep.organization) {
          this._writeLine('Org: ' + rep.organization);
        }
        if (data.type === 'ForkEvent' && data.repository.forks) {
          this._writeLine('Has ' + data.repository.forks + ' forks');
        }
      }
      if (data.url && data.url !== 'https://github.com/') {
        this.lS -= 0.15;
        this._writeLine('Press [Enter] for details...', this.cB);
        window.viewerActiveUrl = data.url;
      } else {
        window.viewerActiveUrl = '';
      }
    }

  };


  Viewer.prototype._writeLine = function (text, config) {
    var text = new this.game.THREE.Mesh(new this.game.THREE.TextGeometry(text, (config) ? config : this.cR), new this.game.THREE.MeshBasicMaterial({color: 0x3a3a41}));
    text.rotation.y = Math.PI;
    text.position.x = 0.9;
    text.position.y = this.lS;
    this.lS -= 0.15;
    this.group.add(text);
  };


  Viewer.prototype.__typeTranslate = function (data) {
    var t = '';
    var type = data.type;
    var p = data.payload;
    switch (type) {
      case 'CommitCommentEvent':
        this._writeLine('Commit Comment', this.cB);
        if (p.comment_id) {
          this._writeLine('#' + p.comment_id);
        }
        break;
      case 'CreateEvent':
        this._writeLine('Created a ' + p.ref_type, this.cB);
        if (p.ref && typeof p.ref === 'string') {
          this._writeLine(p.ref);
        }
        if (p.master_branch && typeof p.master_branch === 'string') {
          this._writeLine(p.master_branch);
        }
        break;
      case 'DeleteEvent':
        this._writeLine('Deleted a ' + p.ref_type, this.cB);
        if (p.ref && typeof p.ref === 'string') {
          this._writeLine('Ref: ' + p.ref);
        }
        break;
      case 'DownloadEvent':
        this._writeLine('Downloaded a File', this.cB);
        if (p.url) {
          var u = p.url.split('/').slice(-1)[0];
          if (u) {
            this._writeLine(u);
          }
        }
        break;
      case 'FollowEvent':
        this._writeLine('Followed', this.cB);
        this._writeLine(p.target.login, this.cB);
        if (p.target.repos && typeof p.target.repos === 'number') {
          this._writeLine(p.target.repos + ' repos');
        }
        this._writeLine(p.target.followers + ' followers');
        this._drawImage('/avatar?s=' + p.target.gravatar_id);
        break;
      case 'ForkEvent':
        this._writeLine('Forked ', this.cB);
        break;
      case 'ForkApplyEvent':
        this._writeLine('Applied Patch', this.cB);
        if (p.head) {
          this._writeLine('to ' + p.head, this.cB);
        }
        break;
      case 'GistEvent':
        if (p.action) {
          if(p.action === 'create') {
            this._writeLine('Created a Gist', this.cB);
          } else if (p.action === 'update') {
            this._writeLine('Updated a Gist', this.cB);
          } else {
            this._writeLine(p.action + ' a Gist', this.cB);
          }
          if (p.name) {
            this._writeLine(p.name);
          }
          if (p.desc) {
            this._writeLine(p.desc.substring(0,36).toLowerCase() + '...');
          }
        }
        break;
      case 'GollumEvent':
        this._writeLine(p.pages.action + ' a wiki page', this.cB);
        this._writeLine(p.pages.page_name);
        break;
      case 'IssueCommentEvent':
        this._writeLine('Issue Comment', this.cB);
        break;
      case 'IssuesEvent':
        this._writeLine(p.action + ' issue' + p.number, this.cB);
        break;
      case 'MemberEvent':
        this._writeLine(p.action + ' ' + p.member.login, this.cB);
        this._drawImage('/avatar?s=' + p.member.avatar_url);
        break;
      case 'PublicEvent':
        this._writeLine('OPEN SOURCED! ', this.cB);
        break;
      case 'PullRequestEvent':
        this._writeLine('Pull Request: ' + p.action, this.cB);
        if (p.title && typeof p.title === 'string') {
          this._writeLine(p.title.substring(0,36).toLowerCase() + '...');
        }
        if (p.additions && typeof p.additions === 'number') {
          this._writeLine('Additions: ' + p.additions);
        }
        if (p.deletions && typeof p.deletions === 'number') {
          this._writeLine('Deletions: ' + p.deletions);
        }
        if (p.commits && typeof p.commits === 'number') {
          this._writeLine('Commits: ' + p.commits);
        }
        break;
      case 'PullRequestReviewCommentEvent':
        this._writeLine('Pull Request Comment', this.cB);
        if (p.comment && p.comment.position) {
          this._writeLine('#' + p.comment.position);
        }
        break;
      case 'PushEvent':
        t = 'Pushed Code';
        this._writeLine('Pushed Code To', this.cB);
        this._writeLine(p.ref);
        this._writeLine(p.size + ' commit(s)');
        break;
      case 'TeamAddEvent':
        this._writeLine('Added to Team', this.cB);
        break;
      case  'WatchEvent':
        this._writeLine(p.action + ' watching', this.cB);
        break;
    }
    return t;
  };


  Viewer.prototype._drawImage = function (url) {
    var scope = this;
    var image = new Image();

    image.addEventListener('load', function () {
      var texture = new scope.game.THREE.Texture(image);
      texture.needsUpdate = true;
      var geometry = new scope.game.THREE.CubeGeometry(1, 1, 0.01);
      var mesh = new scope.game.THREE.Mesh(geometry, new scope.game.THREE.MeshBasicMaterial({ map: texture }));
      mesh.rotation.y = Math.PI;
      mesh.position.x = -0.5;
      mesh.position.y = 2;
      scope.group.add(mesh);
    }, false);

    image.src = url;
  };

  module.exports = Viewer;

})(window);
