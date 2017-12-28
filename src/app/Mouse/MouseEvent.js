const { Event, EventType } = imports.gi.Gdk;
const { Button } = imports.gi.Gtk;

class MouseEvent {
  /**
   * @param {Button} button
   * @param {() => void} callback
   */
  static connectMenu(button, callback) {
    button.connect("button-press-event", (_, /** @type {Event} */ ev) => {
      if (new MouseEvent(ev).isRight()) {
        callback();
      }
    });
  }

  /**
   * @param {Event} ev
   */
  constructor(ev) {
    this.ev = ev;
  }

  isRight() {
    const mouseButton = this.ev.get_button()[1];
    const type = this.ev.get_event_type();

    return mouseButton === 3 && type === EventType.BUTTON_PRESS;
  }
}

exports.MouseEvent = MouseEvent;
