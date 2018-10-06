/* global Ammo,THREE */

/**
 * An implementation of the btIDebugDraw interface in Ammo.js, for debug rendering of Ammo shapes
 * @class AmmoDebugDrawer
 * @param {THREE.Scene} scene
 * @param {Ammo.btCollisionWorld} world
 * @param {object} [options]
 */
THREE.AmmoDebugDrawer = function(scene, world, options){
  options = options || {};

  this.debugObject = new THREE.Object3D();
  this.scene = scene;
  this.world = world;

  this.enabled = false;

  this.lineCache = {};
  this.colors = [];

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

  this.debugDrawMode = options.debugDrawMode || 1;
  this.drawOnTop = options.drawOnTop || false;

  this.clearDebug = false;

  this.world.setDebugDrawer(this.debugDrawer);
};

THREE.AmmoDebugDrawer.prototype = function() {
  return this.debugDrawer;
};

THREE.AmmoDebugDrawer.prototype.enable = function(){
  this.enabled = true;
  this.scene.add(this.debugObject);
};

THREE.AmmoDebugDrawer.prototype.disable = function() {
  this.enabled = false;
  this.scene.remove(this.debugObject);
};

THREE.AmmoDebugDrawer.prototype.update = function(){
  if (!this.enabled) {
    return;
  }
  this.world.debugDrawWorld();
  this.clearDebug = true;
};

THREE.AmmoDebugDrawer.prototype.drawLine = function(from, to, color) {
  if (this.clearDebug) {
    for (var i = 0; i < this.colors.length; i++) {
      var key = this.colors[i];
      while(this.lineCache[key].geometry.vertices.length > 0) {
          this.lineCache[key].geometry.vertices.pop();
      }
    }
    this.clearDebug = false;
  }

  if (!this.enabled) {
    return;
  }

  var colorVector = Ammo.wrapPointer(color, Ammo.btVector3);
  if (!this.lineCache.hasOwnProperty(color)) {
    this.colors.push(color);
    var material = new THREE.LineBasicMaterial({
    color: new THREE.Color(colorVector.x(), colorVector.y(), colorVector.z()), 
    depthTest: !this.drawOnTop
    });
    var geometry = new THREE.Geometry();
    this.lineCache[color] = new THREE.LineSegments(geometry, material);
    if (this.drawOnTop) this.lineCache[color].renderOrder = 1;
    this.debugObject.add(this.lineCache[color]);
  }

  //TODO: use an object pool for these THREE.Vector3's
  var fromVector = Ammo.wrapPointer(from, Ammo.btVector3);
  var fv = new THREE.Vector3(fromVector.x(), fromVector.y(), fromVector.z());
  this.lineCache[color].geometry.vertices.push(fv);

  var toVector = Ammo.wrapPointer(to, Ammo.btVector3);
  var tv = new THREE.Vector3(toVector.x(), toVector.y(), toVector.z());
  this.lineCache[color].geometry.vertices.push(tv);

  this.lineCache[color].geometry.verticesNeedUpdate = true;
};

THREE.AmmoDebugDrawer.prototype.drawContactPoint = function(pointOnB, normalOnB, distance, lifeTime, color) {
  //TODO
  console.log("drawContactPoint")
};

THREE.AmmoDebugDrawer.prototype.reportErrorWarning = function(warningString) {
  console.warn(warningString);
};

THREE.AmmoDebugDrawer.prototype.draw3dText = function(location, textString) {
  //TODO
  console.log("draw3dText", location, textString);
};

THREE.AmmoDebugDrawer.prototype.setDebugMode = function(debugMode) {
  this.debugDrawMode = debugMode;
};

THREE.AmmoDebugDrawer.prototype.getDebugMode = function() {
  return this.debugDrawMode;
};
