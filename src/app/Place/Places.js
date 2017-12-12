const { Box } = imports.gi.Gtk;
const { connect } = require("inferno-mobx");
const { h } = require("../Gjs/GtkInferno");
const minLength = require("../MinLength/minLength").default;
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
  const { entities, names } = props.placeService;

  return (
    h(Box, names.map(x => entities[x]).map(place => (
      h(PlacesEntry, {
        panelId: this.props.panelId,
        place,
        short: minLength(names, place.name),
      })
    )))
  );
}

exports.Places = Places;
exports.default = connect(["placeService"])(Places);
