const { connect } = require("inferno-mobx");
const h = require("inferno-hyperscript").default;

const menus = [
  { label: "Files" },
  { label: "Mark" },
  { label: "Commands" },
  { label: "Net" },
  { label: "Show" },
  { label: "Configuration" },
  { label: "Start" },
];

const MenuBar = () => (
  h("menu-bar", [
    menus.map(x => (
      h("menu-item", { key: x.label, label: x.label })
    )),
  ])
);

exports.default = connect([])(MenuBar);
