const Pango = imports.gi.Pango;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { ActionService } = require("../Action/ActionService");
const { PanelService } = require("../Panel/PanelService");
const { TabService } = require("../Tab/TabService");

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {PanelService} panelService
 * @property {TabService} tabService
 *
 * @param {IProps} props
 */
function Prompt(props) {
  Component.call(this, props);
  this.activate = this.activate.bind(this);
}

Prompt.prototype = Object.create(Component.prototype);

/** @type {IProps} */
Prompt.prototype.props = undefined;

/**
 * @param {{ text?: string }} node
 */
Prompt.prototype.activate = function(node) {
  if (node.text) {
    this.props.actionService.exec(node.text);
  }
};

Prompt.prototype.render = function() {
  const tabId = this.props.panelService.getActiveTabId();
  const { location } = this.props.tabService.entities[tabId];

  return (
    h("box", { expand: false }, [
      h("box", { border_width: 4 }),
      h("label", {
        ellipsize: Pango.EllipsizeMode.MIDDLE,
        label: location.replace(/^file:\/\//, "") + "$",
      }),
      h("box", { border_width: 4 }),
      h("entry", { expand: true, on_activate: this.activate }),
    ])
  );
};

exports.Prompt = Prompt;
exports.default = connect(["actionService", "panelService", "tabService"])(Prompt);
