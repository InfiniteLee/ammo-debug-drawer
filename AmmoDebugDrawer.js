/* global Ammo,THREE */

/**
 * An implementation of the btIDebugDraw interface in Ammo.js, for debug rendering of Ammo shapes
 * @class AmmoDebugDrawer
 * @param {THREE.Scene} scene
 * @param {Ammo.btCollisionWorld} world
 * @param {object} [options]
 */
THREE.AmmoDebugDrawer = function(scene, world, options){
  this.scene = scene;
  this.world = world;
  options = options || {};

  this.debugDrawMode = options.debugDrawMode || 1;
  var drawOnTop = options.drawOnTop || false;
  var maxBufferSize = options.maxBufferSize || 1000000;

  this.geometry = new THREE.BufferGeometry();
  var vertices = new Float32Array(maxBufferSize * 3);
  var colors = new Float32Array(maxBufferSize * 3);

  this.geometry.addAttribute("position", new THREE.BufferAttribute(vertices, 3).setDynamic(true));
  this.geometry.addAttribute("color", new THREE.BufferAttribute(colors, 3).setDynamic(true));

  this.index = 0;

  var material = new THREE.LineBasicMaterial({
    vertexColors: THREE.VertexColors,
    depthTest: !drawOnTop
  });

  this.mesh = new THREE.LineSegments(this.geometry, material);
  if (drawOnTop) this.mesh.renderOrder = 999;

  this.enabled = false;

  this.debugDrawer = new Ammo.DebugDrawer();
  this.debugDrawer.drawLine = this.drawLine.bind(this);
  this.debugDrawer.drawContactPoint = this.drawContactPoint.bind(this);
  this.debugDrawer.reportErrorWarning = this.reportErrorWarning.bind(this);
  this.debugDrawer.draw3dText = this.draw3dText.bind(this);
  this.debugDrawer.setDebugMode = this.setDebugMode.bind(this);
  this.debugDrawer.getDebugMode = this.getDebugMode.bind(this);
  this.debugDrawer.enable = this.enable.bind(this);
  this.debugDrawer.disable = this.disable.bind(this);
  this.debugDrawer.update = this.update.bind(this);

  this.world.setDebugDrawer(this.debugDrawer);
};

THREE.AmmoDebugDrawer.prototype = function() {
  return this.debugDrawer;
};

THREE.AmmoDebugDrawer.prototype.enable = function(){
  this.enabled = true;
  this.scene.add(this.mesh);
};

THREE.AmmoDebugDrawer.prototype.disable = function() {
  this.enabled = false;
  this.scene.remove(this.mesh);
};

THREE.AmmoDebugDrawer.prototype.update = function(){
  if (!this.enabled) {
    return;
  }

  if (this.index != 0) {
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  this.index = 0;

  this.world.debugDrawWorld();

  this.geometry.setDrawRange(0, this.index);
};

THREE.AmmoDebugDrawer.prototype.drawLine = function(from, to, color) {
  var colorVector = Ammo.wrapPointer(color, Ammo.btVector3);

  var fromVector = Ammo.wrapPointer(from, Ammo.btVector3);
  this.geometry.attributes.position.setXYZ(this.index, fromVector.x(), fromVector.y(), fromVector.z());
  this.geometry.attributes.color.setXYZ(this.index++, colorVector.x(), colorVector.y(), colorVector.z());

  var toVector = Ammo.wrapPointer(to, Ammo.btVector3);
  this.geometry.attributes.position.setXYZ(this.index, toVector.x(), toVector.y(), toVector.z());
  this.geometry.attributes.color.setXYZ(this.index++, colorVector.x(), colorVector.y(), colorVector.z());
};

THREE.AmmoDebugDrawer.prototype.drawContactPoint = function(pointOnB, normalOnB, distance, lifeTime, color) {
  //TODO
  console.log("drawContactPoint")
};

THREE.AmmoDebugDrawer.prototype.reportErrorWarning = function(warningString) {
  console.warn(Ammo.Pointer_stringify(warningString));
};

THREE.AmmoDebugDrawer.prototype.draw3dText = function(location, textString) {
  //TODO
  console.log("draw3dText", Ammo.wrapPointer(location, Ammo.btVector3), Ammo.Pointer_stringify(textString));
};

THREE.AmmoDebugDrawer.prototype.setDebugMode = function(debugMode) {
  this.debugDrawMode = debugMode;
};

THREE.AmmoDebugDrawer.prototype.getDebugMode = function() {
  return this.debugDrawMode;
};
