var createCameraControl = require('voxel-camera');
var texture = require('voxel-texture');
module.exports = Screenshot;

function Screenshot(game, options) {
  if (!options) options = {};
  if (!(this instanceof Screenshot)) return new Screenshot(game, options);
  this.cameraTextures = options.cameraTextures || './camera/';
  this.game = game;

  this._materialEngine = texture({
    texturePath: this.cameraTextures,
    game: this.game
  });

  // Create a camera control, pass a copy of the game
  this.cameraControl = createCameraControl(game);

  // Add the camera to the scene
  this.cam = this.cameraControl.camera();
  game.scene.add(this.cam);

  this.cameraHelper = new game.THREE.CameraHelper(this.cam);
  this.cameraHelper.visible = false;
  game.scene.add(this.cameraHelper);
}

Screenshot.prototype.shutter = function(width, height) {
  var self = this;
  var renderer = this.game.view.renderer;
  width = width || 800, height = height || 600;

  renderer.setSize( window.innerWidth / 2, window.innerHeight / 2 );
  this.game.view.camera.updateProjectionMatrix();

  renderer.render(this.game.scene, this.game.view.camera);
  var png = renderer.domElement.toDataURL('image/png');

  this.cam.aspect = window.innerWidth / window.innerHeight;
  this.cam.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  window.open(png);
  return png
};
