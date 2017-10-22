const Gdk = imports.gi.Gdk;

exports.default = KeyListener;
function KeyListener(node) {
  this.handleKeyPress = this.handleKeyPress.bind(this);
  this.handleKeyRelease = this.handleKeyRelease.bind(this);
  this.on = this.on.bind(this);

  this.node = node;
  this.pressed = {};

  this.node.connect("key-press-event", this.handleKeyPress);
  this.node.connect("key-release-event", this.handleKeyRelease);
}

KeyListener.prototype.handleKeyPress = function(_, nativeEv) {
  const keyval = nativeEv.get_keyval()[1];

  if (!this.onKeyPress) {
    this.pressed[keyval] = true;
    return false;
  }

  const ev = new Ev(this.pressed, keyval);
  const result = this.onKeyPress(ev);
  this.pressed[keyval] = true;

  return result;
};

KeyListener.prototype.handleKeyRelease = function(_, nativeEv) {
  const keyval = nativeEv.get_keyval()[1];

  if (!this.onKeyRelease) {
    this.pressed[keyval] = false;
    return false;
  }

  const ev = new Ev(this.pressed, keyval);
  const result = this.onKeyRelease(ev);
  this.pressed[keyval] = false;

  return result;
};

KeyListener.prototype.on = function(evName, callback) {
  if (evName === "key-press-event") {
    this.onKeyPress = callback;
  } else {
    this.onKeyRelease = callback;
  }
};

exports.Ev = Ev;
function Ev(pressed, which) {
  this.which = which;
  this.ctrlKey = pressed[Gdk.KEY_Control_L] || pressed[Gdk.KEY_Control_R];
  this.shiftKey = pressed[Gdk.KEY_Shift_L] || pressed[Gdk.KEY_Shift_R];
  this.altKey = pressed[Gdk.KEY_Alt_L] || pressed[Gdk.KEY_Alt_R];
  this.metaKey = pressed[Gdk.KEY_Meta_L] || pressed[Gdk.KEY_Meta_R];
}
