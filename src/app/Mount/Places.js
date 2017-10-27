const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const minLength = require("../MinLength/minLength").default;
const PlacesEntry = require("./PlacesEntry").default;
const { PlaceService } = require("./PlaceService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PlaceService} placeService
 *
 * @param {IProps} props
 */
function Places(props) {
  const { entities, names } = props.placeService;

  return (
    h("box", [
      names.map(x => entities[x]).map(place => {
        return h(PlacesEntry, {
          panelId: this.props.panelId,
          place,
          short: minLength(names, place.name),
        });
      }),
    ])
  );
}

exports.Places = Places;
exports.default = connect(["placeService"])(Places);
