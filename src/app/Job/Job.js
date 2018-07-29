const { Button, Box, Label, Orientation, ProgressBar } = imports.gi.Gtk;
const { Component } = require("inferno");
const { inject, observer } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const formatSize = require("../Size/formatSize").default;
const { JobService } = require("./JobService");

/**
 * @typedef IProps
 * @property {JobService?} [jobService]
 * @property {number} pid
 *
 * @extends Component<IProps>
 */
class Job extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, Job.prototype, __filename);
  }

  cancel() {
    const jobService = /** @type {JobService} */ (this.props.jobService);
    jobService.cancel(this.props.pid);
  }

  /**
   * @param {Button} cancelButton
   */
  useCancelButton(cancelButton) {
    if (cancelButton) {
      cancelButton.connect("clicked", this.cancel);
    }
  }

  render() {
    const { jobs, types } = /** @type {JobService} */ (this.props.jobService);
    const job = jobs[this.props.pid];
    const type = types[this.props.pid];

    return h(Box, { orientation: Orientation.VERTICAL }, [
      h(Label, { label: `Type: ${type}` }),
      h(Label, { label: `Src: ${job.uri}` }),
      h(Label, { label: `Dest: ${job.dest}` }),

      h(ProgressBar, {
        fraction: job.totalDoneCount / job.totalCount || 0,
        margin_top: Job.spacing,
        show_text: true,
        text: `${job.totalDoneCount} / ${job.totalCount}`,
      }),

      h(ProgressBar, {
        fraction: job.totalDoneSize / job.totalSize || 0,
        margin_bottom: Job.spacing,
        show_text: true,
        text: `${formatSize(job.totalDoneSize)} / ${formatSize(job.totalSize)}`,
      }),

      h(Button, {
        label: "Cancel",
        ref: this.useCancelButton,
      }),
    ]);
  }
}

Job.spacing = 10;

exports.Job = Job;
exports.default = inject("jobService")(observer(Job));
