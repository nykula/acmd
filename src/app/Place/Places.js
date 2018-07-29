const { Box } = imports.gi.Gtk;
const { inject, observer } = require("inferno-mobx");
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
  const { places } =
    /** @type {PlaceService} */ (props.placeService);

  return (
    h(Box, places.map(place => (
      h(PlacesEntry, {
        panelId: props.panelId,
        place,
      })
    )))
  );
}

exports.Places = Places;
exports.default = inject("placeService")(observer(Places));
