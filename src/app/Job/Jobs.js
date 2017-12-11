const { Box, HSeparator, Label, Orientation, Popover } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { RefService } = require("../Ref/RefService");
const formatSize = require("../Size/formatSize").default;
const Job = require("./Job").default;
const { JobService } = require("./JobService");

/**
 * @typedef IProps
 * @property {JobService} jobService
 * @property {RefService} refService
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

/**
 * @param {Popover} popover
 */
Jobs.prototype.usePopover = function(popover) {
  this.props.refService.set("jobs")(popover);
};

Jobs.prototype.render = function() {
  const inner = [
    h(Label, {
      key: "tip",
      label: "Cp/mv/rm progress displays here",
    }),
  ];

  const { statefulPids } = this.props.jobService;

  if (statefulPids.length) {
    inner.splice(0);

    for (const pid of statefulPids) {
      inner.push(
        h(Job, {
          key: pid,
          pid,
        }),
      );

      if (pid !== statefulPids[statefulPids.length - 1]) {
        inner.push(
          h(HSeparator, { key: `${pid}+` }),
        );
      }
    }
  }

  return h("stub-box", [
    h(Popover, { ref: this.usePopover }, [
      h(Box, {
        margin: Job.spacing,
        orientation: Orientation.VERTICAL,
        spacing: Job.spacing,
      }, inner),
    ]),
  ]);
};

exports.Jobs = Jobs;
exports.default = connect(["jobService", "refService"])(Jobs);
