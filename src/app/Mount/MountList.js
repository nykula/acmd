const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const minLength = require("../MinLength/minLength").default;
const MountListEntry = require("./MountListEntry").default;
const { MountService } = require("./MountService");

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {MountService} mountService
 *
 * @param {IProps} props
 */
function MountList(props) {
  const { entities, names } = props.mountService;

  return (
    h("box", [
      names.map(x => entities[x]).map(mount => {
        return h(MountListEntry, {
          mount: mount,
          panelId: this.props.panelId,
          short: minLength(names, mount.name),
        });
      }),
    ])
  );
}

exports.MountList = MountList;
exports.default = connect(["mountService"])(MountList);
