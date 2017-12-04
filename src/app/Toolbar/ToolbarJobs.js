const { Button, ReliefStyle } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { ActionService } = require("../Action/ActionService");
const autoBind = require("../Gjs/autoBind").default;
const { h } = require("../Gjs/GtkInferno");
const { JobService } = require("../Job/JobService");
const Refstore = require("../Refstore/Refstore").default;
const formatSize = require("../Size/formatSize").default;

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {JobService} jobService
 * @property {Refstore} refstore
 *
 * @param {IProps} props
 */
function ToolbarJobs(props) {
  Component.call(this, props);
  autoBind(this, ToolbarJobs.prototype, __filename);
}

ToolbarJobs.prototype = Object.create(Component.prototype);

/**
 * @type {IProps}
 */
ToolbarJobs.prototype.props = undefined;

/**
 * @param {Button} button
 */
ToolbarJobs.prototype.useButton = function(button) {
  this.props.refstore.set("toolbarJobs")(button);
  button.connect("clicked", () => this.props.actionService.jobs());
};

ToolbarJobs.prototype.render = function() {
  let jobs = 0;
  let totalCount = 0;
  let totalDoneCount = 0;
  let totalSize = 0;
  let totalDoneSize = 0;

  for (const pid of this.props.jobService.statefulPids) {
    const job = this.props.jobService.jobs[pid];

    totalCount += job.totalCount;
    totalDoneCount += job.totalDoneCount;
    totalSize += job.totalSize;
    totalDoneSize += job.totalDoneSize;

    jobs++;
  }

  const label = jobs > 0
    ? Math.round(totalDoneSize / totalSize * 100 || 0) + "%"
    : "Ready";

  const progress = [
    `${totalDoneCount} / ${totalCount}`,
    `${formatSize(totalDoneSize)} / ${formatSize(totalSize)}`,
  ].join("\n");

  const tooltip = jobs > 0
    ? progress
    : "Cp/mv/rm progress displays here";

  return h(Button, {
    label,
    ref: this.useButton,
    relief: ReliefStyle.NONE,
    tooltip_text: tooltip,
  });
};

exports.ToolbarJobs = ToolbarJobs;
exports.default = connect(["actionService", "jobService", "refstore"])(ToolbarJobs);
