(function (exports) {
  var Labels = function (game, user) {
    if (!(this instanceof Labels)) return new Labels(game, user);
    this.makeLabel('GitHub ArchiveRoom', [-9, 46, 55], game, 2);
    this.makeLabel('2012', [-9, 10, 6], game, 3);

    this.makeLabel('2013', [-9, 10, 40], game, 3);

    this.makeLabel('March', [0, -1, 0], game);
    this.makeLabel('April', [0, -1, 3], game);
    this.makeLabel('May', [0, -1, 6], game);
    this.makeLabel('June', [0, -1, 9], game);
    this.makeLabel('July', [0, -1, 12], game);
    this.makeLabel('August', [0, -1, 15], game);
    this.makeLabel('September', [0, -1, 18], game);
    this.makeLabel('October', [0, -1, 21], game);
    this.makeLabel('November', [0, -1, 24], game);
    this.makeLabel('December', [0, -1, 27], game);

    this.makeLabel('January', [0, -1, 30], game);
    this.makeLabel('February', [0, -1, 33], game);

    this.makeLabel('March', [0, -1, 36], game);
    this.makeLabel('April', [0, -1, 39], game);
    this.makeLabel('May', [0, -1, 42], game);
    this.makeLabel('June', [0, -1, 45], game);
    this.makeLabel('July', [0, -1, 48], game);

    // quick opts
    if (location.hash.length === 0) {
      this.makeLabel(user + '\'s', [-9, 50, 55], game, 4);

      this.makeLabelLegend('Legend', [20, 30, -14], game);

      this.makeLabelLegend('Watch', [22, 1, -14], game);
      this.makeLabelLegend('Fork', [22, 3, -14], game);
      this.makeLabelLegend('Gist or Wiki', [22, 5, -14], game);
      this.makeLabelLegend('Created Ref', [22, 7, -14], game);
      this.makeLabelLegend('Followed User', [22, 9, -14], game);

      this.makeLabelLegend('Open Sourced', [22, 11, -14], game);
      game.setBlock([20, 11, -14], 12);

      this.makeLabelLegend('Organization', [22, 13, -14], game);
      this.makeLabelLegend('Pushed Code', [22, 15, -14], game);
      this.makeLabelLegend('Issue Comment', [22, 17, -14], game);

      this.makeLabelLegend('PR Action', [22, 19, -14], game);
      game.setBlock([20, 19, -14], 13);

      this.makeLabelLegend('PR Comment', [22, 21, -14], game);
      game.setBlock([20, 21, -14], 17);

      this.makeLabelLegend('Deleted Ref', [22, 23, -14], game);
      game.setBlock([20, 23, -14], 14);

      this.makeLabelLegend('Commit Comment', [22, 25, -14], game);
      game.setBlock([20, 25, -14], 15);

      this.makeLabelLegend('Issue Action', [22, 27, -14], game);
      game.setBlock([20, 27, -14], 16);

      // legend blocks
      game.setBlock([20, 1, -14], 3);
      game.setBlock([20, 3, -14], 4);
      game.setBlock([20, 5, -14], 5);
      game.setBlock([20, 7, -14], 6);
      game.setBlock([20, 9, -14], 7);
      game.setBlock([20, 13, -14], 9);
      game.setBlock([20, 15, -14], 10);
      game.setBlock([20, 17, -14], 11);

      this.makeLabelControl('Controls', [40, 30, -14], game);

      this.makeLabelControl('[LEFT CLICK] - Inspect Cube', [40, 27, -14], game);
      this.makeLabelControl('[W] [A] [S] [D] - Move', [40, 25, -14], game);
      this.makeLabelControl('[SPACE] - Jump', [40, 23, -14], game);
      this.makeLabelControl('Hold [SPACE] - Fly Up', [40, 21, -14], game);
      this.makeLabelControl('Hold [SHIFT] - Fly Down', [40, 19, -14], game);
      this.makeLabelControl('[TAB] - Screenshot', [40, 17, -14], game);

      // label sheet
      var glassMaterial = new game.THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
      var geometry = new game.THREE.CubeGeometry(41, 33, 0.01);
      this.s = new game.THREE.Mesh(geometry, glassMaterial);
      this.s.position.set(39, 15, -13.9);
      this.s.rotation.y = Math.PI;
      this.s.rotation.x = Math.PI;
      this.s.rotation.z = Math.PI;
      window.s = this.s;
      game.scene.add(this.s);

      for (var i = 1; i <= 31; i++) {
        this.makeLabel(i, [i * 2 + 1, -1, -1], game);
      }

      /*
       this.makeLabel('August', [0,5,57], game);
       this.makeLabel('September', [0,5,60], game);
       this.makeLabel('October', [0,5,63], game);
       this.makeLabel('November', [0,5,66], game);
       this.makeLabel('December', [0,5,69], game);
       */
    }
  };

  Labels.prototype.makeLabelControl = function (text, p, game) {
    this.makeLabel(text, p, game, 1, 'control');
  };

  Labels.prototype.makeLabelLegend = function (text, p, game) {
    this.makeLabel(text, p, game, 1, 'legend');
  };

  Labels.prototype.makeLabel = function (text, position, game, s, type) {

    var p = position;
    var text = text || "October",
      height = (s && !type) ? 0.5 : 0.1,
      size = s || 1,
      hover = 30,
      curveSegments = 4,
      bevelThickness = 1,
      bevelSize = 1,
      bevelSegments = 3,
      bevelEnabled = false,
      font = "helvetiker",
      weight = "bold",
      style = "normal";
    var material = new game.THREE.MeshNormalMaterial({color: 0x00ff00}); // side
    var textGeo = new game.THREE.TextGeometry(text, {

      size: size,
      height: height,
      curveSegments: curveSegments,

      font: font,
      weight: weight,
      style: style,

      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelEnabled: bevelEnabled,

      material: 0,
      extrudeMaterial: 1

    });

    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();

    var textMesh1 = new game.THREE.Mesh(textGeo, material);
    textMesh1.position.set(p[0], p[1], p[2] + 0.1);
    textMesh1.rotation.y = Math.PI;
    if (type && (type === 'legend' || type === 'control')) {
      textMesh1.rotation.x = Math.PI;
      textMesh1.rotation.z = Math.PI;
    } else {
      if (!s) {
        textMesh1.rotation.x = Math.PI / 2;
      } else {
        textMesh1.rotation.y = Math.PI / 2;
      }
    }

    game.scene.add(textMesh1);
  };

  module.exports = Labels;

})(window);
