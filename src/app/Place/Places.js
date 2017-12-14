const { Box } = imports.gi.Gtk;
const { connect } = require("inferno-mobx");
const { h } = require("../Gjs/GtkInferno");
const PlacesEntry = require("./PlacesEntry").default;
const { PlaceService } = require("./PlaceService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PlaceService?} [placeService]
 *
 * @param {IProps} props
 */
function Places(props) {
  const { names } =
    /** @type {PlaceService} */ (props.placeService);

  return (
    h(Box, names.map(name => (
      h(PlacesEntry, {
        key: name,
        name,
        panelId: props.panelId,
      })
    )))
  );
}

exports.Places = Places;
exports.default = connect(["placeService"])(Places);
