/* global Ammo,THREE */

THREE.AmmoDebugConstants = {
  NoDebug: 0,
  DrawWireframe: 1,
  DrawAabb: 2,
  DrawFeaturesText: 4,
  DrawContactPoints: 8,
  NoDeactivation: 16,
  NoHelpText: 32,
  DrawText: 64,
  ProfileTimings: 128,
  EnableSatComparison: 256,
  DisableBulletLCP: 512,
  EnableCCD: 1024,
  DrawConstraints: 1 << 11, //2048
  DrawConstraintLimits: 1 << 12, //4096
  FastWireframe: 1 << 13, //8192
  DrawNormals: 1 << 14, //16384
  DrawOnTop: 1 << 15, //32768
  MAX_DEBUG_DRAW_MODE: 0xffffffff
};

/**
 * An implementation of the btIDebugDraw interface in Ammo.js, for debug rendering of Ammo shapes
 * @class AmmoDebugDrawer
 * @param {THREE.Scene} scene
 * @param {Ammo.btCollisionWorld} world
 * @param {object} [options]
 */
THREE.AmmoDebugDrawer = function(scene, world, options) {
  this.scene = scene;
  this.world = world;
  options = options || {};

  this.debugDrawMode = options.debugDrawMode || THREE.AmmoDebugConstants.DrawWireframe;
  var drawOnTop = this.debugDrawMode & THREE.AmmoDebugConstants.DrawOnTop || false;
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
  this.mesh.frustumCulled = false;

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

THREE.AmmoDebugDrawer.prototype.enable = function() {
  this.enabled = true;
  this.scene.add(this.mesh);
};

THREE.AmmoDebugDrawer.prototype.disable = function() {
  this.enabled = false;
  this.scene.remove(this.mesh);
};

THREE.AmmoDebugDrawer.prototype.update = function() {
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
  this._addPoint(fromVector, colorVector);

  var toVector = Ammo.wrapPointer(to, Ammo.btVector3);
  this._addPoint(toVector, colorVector);
};

THREE.AmmoDebugDrawer.prototype._addPoint = function(vector3, colorVector) {
  this.geometry.attributes.position.setXYZ(this.index, vector3.x(), vector3.y(), vector3.z());
  this.geometry.attributes.color.setXYZ(this.index++, colorVector.x(), colorVector.y(), colorVector.z());
};

THREE.AmmoDebugDrawer.prototype.drawContactPoint = function(pointOnB, normalOnB, distance, lifeTime, color) {
  //TODO: figure out how to make lifeTime work
  var colorVector = Ammo.wrapPointer(color, Ammo.btVector3);
  var point = Ammo.wrapPointer(pointOnB, Ammo.btVector3);
  var normal = Ammo.wrapPointer(normalOnB, Ammo.btVector3);
  normal.op_mul(distance);

  this._addPoint(point, colorVector);
  this._addPoint(point.op_add(normal), colorVector);
};

THREE.AmmoDebugDrawer.prototype.reportErrorWarning = function(warningString) {
  if (Ammo.hasOwnProperty("Pointer_stringify")) {
    console.warn(Ammo.Pointer_stringify(warningString));
  } else if (!this.warnedOnce) {
    this.warnedOnce = true;
    console.warn("Cannot print warningString, please rebuild Ammo.js using 'debug' flag");
  }
};

THREE.AmmoDebugDrawer.prototype.draw3dText = function(location, textString) {
  //TODO
  console.warn("TODO: draw3dText");
};

THREE.AmmoDebugDrawer.prototype.setDebugMode = function(debugMode) {
  this.debugDrawMode = debugMode;
};

THREE.AmmoDebugDrawer.prototype.getDebugMode = function() {
  return this.debugDrawMode;
};
