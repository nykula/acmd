const Gdk = imports.gi.Gdk;
const { Event } = Gdk;
const { autoBind } = require("./autoBind");

class KeyListener {
  /**
   * @param {any} node
   */
  constructor(node) {
    autoBind(this, KeyListener.prototype, __filename);
    this.node = node;
    this.onKeyPress = undefined;
    this.onKeyRelease = undefined;
    this.pressed = {};
    this.node.connect("key-press-event", this.handleKeyPress);
    this.node.connect("key-release-event", this.handleKeyRelease);
  }

  /**
   * @param {any} _
   * @param {Event} nativeEv
   */
  handleKeyPress(_, nativeEv) {
    const keyval = nativeEv.get_keyval()[1];

    if (!this.onKeyPress) {
      this.pressed[keyval] = true;
      return false;
    }

    const ev = new Ev(this.pressed, keyval, nativeEv);
    const result = this.onKeyPress(ev);
    this.pressed[keyval] = true;

    return result;
  }

  /**
   * @param {any} _
   * @param {Event} nativeEv
   */
  handleKeyRelease(_, nativeEv) {
    const keyval = nativeEv.get_keyval()[1];

    if (!this.onKeyRelease) {
      this.pressed[keyval] = false;
      return false;
    }

    const ev = new Ev(this.pressed, keyval, nativeEv);
    const result = this.onKeyRelease(ev);
    this.pressed[keyval] = false;

    return result;
  }

  /**
   * @param {string} evName
   * @param {(ev: Ev) => void} callback
   */
  on(evName, callback) {
    if (evName === "key-press-event") {
      this.onKeyPress = callback;
    } else {
      this.onKeyRelease = callback;
    }
  }
}

class Ev {
  /**
   * @param {{ [key: number]: boolean }} pressed
   * @param {number} which
   * @param {Event} nativeEvent
   */
  constructor(pressed, which, nativeEvent) {
    this.nativeEvent = nativeEvent;
    this.which = which;
    this.ctrlKey = pressed[Gdk.KEY_Control_L] || pressed[Gdk.KEY_Control_R];
    this.shiftKey = pressed[Gdk.KEY_Shift_L] || pressed[Gdk.KEY_Shift_R];
    this.altKey = pressed[Gdk.KEY_Alt_L] || pressed[Gdk.KEY_Alt_R];
    this.metaKey = pressed[Gdk.KEY_Meta_L] || pressed[Gdk.KEY_Meta_R];
  }
}

exports.default = KeyListener;
