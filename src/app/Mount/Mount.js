const { ReliefStyle } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const noop = require("lodash/noop");
const { autoBind } = require("../Gjs/autoBind");
const { setTimeout } = require("../Gjs/setTimeout");
const { GICON, TEXT } = require("../ListStore/ListStore");
const minLength = require("../MinLength/minLength").default;
const { PanelService } = require("../Panel/PanelService");
const { PlaceService } = require("../Place/PlaceService");
const { RefService } = require("../Ref/RefService");
const Select = require("../Select/Select").default;
const formatSize = require("../Size/formatSize").default;

/**
 * @typedef IProps
 * @property {number} panelId
 * @property {PanelService} panelService
 * @property {PlaceService} placeService
 * @property {RefService} refService
 *
 * @param {IProps} props
 */
function Mount(props) {
  Component.call(this, props);
  autoBind(this, Mount.prototype, __filename);
}

Mount.prototype = Object.create(Component.prototype);

/**
 * @type {IProps}
 */
Mount.prototype.props = undefined;

Mount.prototype.onChanged = noop;

Mount.prototype.handleFocus = function() {
  setTimeout(() => {
    const node = this.props.refService.get("panel" + this.props.panelId);

    if (node) {
      node.grab_focus();
    }
  }, 0);
};

Mount.prototype.handleLevelUp = function() {
  this.props.panelService.levelUp(this.props.panelId);
};

Mount.prototype.handleRoot = function() {
  this.props.panelService.root(this.props.panelId);
};

Mount.prototype.render = function() {
  const { panelId, panelService, placeService } = this.props;
  const { entities, names } = placeService;

  const activeUri = panelService.getActiveMountUri(panelId);

  const activeMount = names
    .map(x => entities[x])
    .filter(mount => mount.rootUri === activeUri)[0];

  const name = activeMount.name;

  const status = "[" + name + "] " +
    formatSize(activeMount.filesystemFree) + " of " +
    formatSize(activeMount.filesystemSize) + " free";

  return (
    h("box", { expand: false }, [
      h("box", [
        h(Select, {
          cols: [
            { name: "text", type: TEXT, pack: "pack_end" },
            { name: "icon", type: GICON },
          ],
          on_changed: this.onChanged,
          on_focus: this.handleFocus,
          on_layout: this.props.refService.set("mounts" + this.props.panelId),
          rows: names.map(x => entities[x]).map(mount => ({
            icon: {
              icon: mount.icon,
              iconType: mount.iconType,
            },
            text: minLength(names, mount.name),
            value: mount.name,
          })),
          value: name,
        }),
      ]),
      h("box", { border_width: 4, expand: true }, [
        h("label", { label: status }),
      ]),
      h("v-separator"),
      h("box", [
        h("button", {
          on_clicked: this.handleRoot,
          relief: ReliefStyle.NONE,
        }, [
            h("label", { label: "\\" }),
          ]),
        h("button", {
          on_clicked: this.handleLevelUp,
          relief: ReliefStyle.NONE,
        }, [
            h("label", { label: ".." }),
          ]),
      ]),
    ])
  );
};

exports.Mount = Mount;
exports.default = connect(["panelService", "placeService", "refService"])(Mount);
