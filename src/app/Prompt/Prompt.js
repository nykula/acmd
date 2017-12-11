const { EllipsizeMode } = imports.gi.Pango;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { DirectoryService } = require("../Directory/DirectoryService");
const { autoBind } = require("../Gjs/autoBind");
const { PanelService } = require("../Panel/PanelService");

/**
 * @typedef IProps
 * @property {DirectoryService} directoryService
 * @property {PanelService} panelService
 *
 * @param {IProps} props
 */
function Prompt(props) {
  Component.call(this, props);
  autoBind(this, Prompt.prototype, __filename);
}

Prompt.prototype = Object.create(Component.prototype);

/** @type {IProps} */
Prompt.prototype.props = undefined;

/**
 * @param {{ text?: string }} node
 */
Prompt.prototype.activate = function(node) {
  if (node.text) {
    this.props.directoryService.exec(node.text);
  }
};

Prompt.prototype.render = function() {
  const { location } = this.props.panelService.getActiveTab();

  return (
    h("box", { expand: false }, [
      h("box", { border_width: 4 }),
      h("label", {
        ellipsize: EllipsizeMode.MIDDLE,
        label: location.replace(/^file:\/\//, "") + "$",
      }),
      h("box", { border_width: 4 }),
      h("entry", { expand: true, on_activate: this.activate }),
    ])
  );
};

exports.Prompt = Prompt;
exports.default = connect(["directoryService", "panelService"])(Prompt);
