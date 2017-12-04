const { Label, Popover } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const autoBind = require("../Gjs/autoBind").default;
const { h } = require("../Gjs/GtkInferno");
const Refstore = require("../Refstore/Refstore").default;
const formatSize = require("../Size/formatSize").default;
const Job = require("./Job").default;
const { JobService } = require("./JobService");

/**
 * @typedef IProps
 * @property {JobService} jobService
 * @property {Refstore} refstore
 *
 * @param {IProps} props
 */
function Jobs(props) {
  Component.call(this, props);
  autoBind(this, Jobs.prototype, __filename);
}

Jobs.prototype = Object.create(Component.prototype);

/** @type {IProps} */
Jobs.prototype.props = undefined;

Jobs.prototype.usePopover = function(popover) {
  this.props.refstore.set("jobs")(popover);
};

Jobs.prototype.render = function() {
  return (
    h("stub-box", [
      h(Popover, { ref: this.usePopover },
        this.props.jobService.statefulPids.length
          ? this.props.jobService.statefulPids.map(pid => h(Job, {
            key: pid,
            pid,
          }))
          : [h(Label, { key: "tip", label: "Cp/mv/rm progress displays here" })],
      ),
    ])
  );
};

exports.Jobs = Jobs;
exports.default = connect(["jobService", "refstore"])(Jobs);
