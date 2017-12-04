const { Button, Box, Label, Orientation, ProgressBar } = imports.gi.Gtk;
const Component = require("inferno-component").default;
const { connect } = require("inferno-mobx");
const { ActionService } = require("../Action/ActionService");
const autoBind = require("../Gjs/autoBind").default;
const { h } = require("../Gjs/GtkInferno");
const formatSize = require("../Size/formatSize").default;
const { JobService } = require("./JobService");

/**
 * @typedef IProps
 * @property {ActionService} actionService
 * @property {JobService} jobService
 * @property {number} pid
 *
 * @param {IProps} props
 */
function Job(props) {
  Component.call(this, props);
  autoBind(this, Job.prototype, __filename);
}

Job.prototype = Object.create(Component.prototype);

/** @type {IProps} */
Job.prototype.props = undefined;

Job.prototype.cancel = function() {
  this.props.actionService.cancel(this.props.pid);
};

/**
 * @param {Button} cancelButton
 */
Job.prototype.useCancelButton = function(cancelButton) {
  if (cancelButton) {
    cancelButton.connect("clicked", this.cancel);
  }
};

Job.prototype.render = function() {
  const job = this.props.jobService.jobs[this.props.pid];
  const type = this.props.jobService.types[this.props.pid];

  return (
    h(Box, { orientation: Orientation.VERTICAL }, [
      h(Label, { label: `Type: ${type}` }),

      h(Label, { label: `Src: ${job.uri}` }),
      h(Label, { label: `Dest: ${job.dest}` }),

      h(ProgressBar, {
        fraction: job.totalDoneCount / job.totalCount || 0,
        text: `${job.totalDoneCount} / ${job.totalCount}`,
      }),

      h(ProgressBar, {
        fraction: job.totalDoneSize / job.totalSize || 0,
        text: `${formatSize(job.totalDoneSize)} / ${formatSize(job.totalSize)}`,
      }),

      h(Button, { label: "Cancel", ref: this.useCancelButton }),
    ])
  );
};

exports.Job = Job;
exports.default = connect(["actionService", "jobService"])(Job);
