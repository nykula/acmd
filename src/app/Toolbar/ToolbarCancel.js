const { ReliefStyle } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const h = require("inferno-hyperscript").default;
const { connect } = require("inferno-mobx");
const { ActionService } = require("../Action/ActionService");
const autoBind = require("../Gjs/autoBind").default;
const { JobService } = require("../Job/JobService");
const formatSize = require("../Size/formatSize").default;

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {JobService} jobService
 *
 * @param {IProps} props
 */
function ToolbarCancel(props) {
  Component.call(this, props);
  autoBind(this, ToolbarCancel.prototype, __filename);
}

ToolbarCancel.prototype = Object.create(Component.prototype);

/**
 * @type {IProps}
 */
ToolbarCancel.prototype.props = undefined;

ToolbarCancel.prototype.handleClicked = function() {
  this.props.actionService.cancel();
};

ToolbarCancel.prototype.render = function() {
  let totalCount = 0;
  let totalDoneCount = 0;
  let totalSize = 0;
  let totalDoneSize = 0;

  let jobs = [];

  for (const pid of this.props.jobService.pids) {
    const job = this.props.jobService.jobs[pid];

    if (!job) {
      continue;
    }

    totalCount += job.totalCount;
    totalDoneCount += job.totalDoneCount;
    totalSize += job.totalSize;
    totalDoneSize += job.totalDoneSize;

    jobs.push([
      `Type: ${this.props.jobService.types[pid]}`,
      `Src: ${job.uri}`,
      `Dest: ${job.dest}`,
      `${job.totalDoneCount} / ${job.totalCount}`,
      `${formatSize(job.totalDoneSize)} / ${formatSize(job.totalSize)}`,
    ].join("\n"));
  }

  if (jobs.length) {
    jobs.unshift([
      `${totalDoneCount} / ${totalCount}`,
      `${formatSize(totalDoneSize)} / ${formatSize(totalSize)}`,
    ].join("\n"));
  }

  const label = jobs.length
    ? `Cancel ${Math.round(totalDoneSize / totalSize * 100 || 0) + "%"}`
    : "Ready";

  const tooltip = jobs.length
    ? jobs.join("\n---\n")
    : "Cp/mv/rm progress displays here";

  return h("button", {
    label,
    on_clicked: this.handleClicked,
    relief: ReliefStyle.NONE,
    tooltip_text: tooltip,
  });
};

exports.ToolbarCancel = ToolbarCancel;
exports.default = connect(["actionService", "jobService"])(ToolbarCancel);
