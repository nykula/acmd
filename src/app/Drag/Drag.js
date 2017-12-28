const { DragAction, DragContext } = imports.gi.Gdk;
const { DestDefaults, ReliefStyle, Widget } = imports.gi.Gtk;
const { autoBind } = require("../Gjs/autoBind");

class Drag {
  /**
   * @param {Widget} widget
   * @param {{ action: number }} props
   */
  constructor(widget, props = { action: DragAction.COPY + DragAction.MOVE }) {
    this.props = props;
    this.widget = widget;
  }

  /**
   * @param {(props: { action: number, uris: string[], x: number, y: number }) => void} callback
   */
  onDrop(callback) {
    this.widget.connect("drag-data-received", (_, ctx, x, y, selectionData) => {
      callback({
        action: ctx.get_selected_action(),
        uris: selectionData.get_uris(),
        x,
        y,
      });
    });

    this.widget.drag_dest_set(DestDefaults.ALL, [], this.props.action);
    this.widget.drag_dest_add_uri_targets();

    return this;
  }

  /**
   * @param {(props: { action: number }) => void} callback
   */
  onMotion(callback) {
    this.widget.connect("drag-motion", (_, ctx) => {
      callback({ action: ctx.get_selected_action() });
    });

    this.widget.drag_dest_set(DestDefaults.ALL, [], this.props.action);
    this.widget.drag_dest_add_uri_targets();

    return this;
  }
}

exports.Drag = Drag;
