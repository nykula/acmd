const { Button, ReliefStyle } = imports.gi.Gtk;
const { Component } = require("inferno");
const { inject, observer } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { JobService } = require("../Job/JobService");
const { RefService } = require("../Ref/RefService");
const formatSize = require("../Size/formatSize").default;

/**
 * @typedef IProps
 * @property {JobService?} [jobService]
 * @property {RefService?} [refService]
 *
 * @extends Component<IProps>
 */
class ToolbarJobs extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, ToolbarJobs.prototype, __filename);
  }

  /**
   * @param {Button | null} button
   */
  useButton(button) {
    if (!button) {
      return;
    }

    const { list } = /** @type {JobService} */ (this.props.jobService);
    const { set } = /** @type {RefService} */ (this.props.refService);

    set("toolbarJobs")(button);
    button.connect("clicked", () => list());
  }

  render() {
    const { jobs, statefulPids } =
      /** @type {JobService} */ (this.props.jobService);

    let jobCount = 0;
    let totalCount = 0;
    let totalDoneCount = 0;
    let totalSize = 0;
    let totalDoneSize = 0;

    for (const pid of statefulPids) {
      const job = jobs[pid];

      totalCount += job.totalCount;
      totalDoneCount += job.totalDoneCount;
      totalSize += job.totalSize;
      totalDoneSize += job.totalDoneSize;

      jobCount++;
    }

    const label = jobCount > 0
      ? Math.round(totalDoneSize / totalSize * 100 || 0) + "%"
      : "Ready";

    const progress = [
      `${totalDoneCount} / ${totalCount}`,
      `${formatSize(totalDoneSize)} / ${formatSize(totalSize)}`,
    ].join("\n");

    const tooltip = jobCount > 0
      ? progress
      : "Cp/mv/rm progress displays here";

    return (
      h(Button, {
        label,
        ref: this.useButton,
        relief: ReliefStyle.NONE,
        tooltip_text: tooltip,
      })
    );
  }
}

exports.ToolbarJobs = ToolbarJobs;
exports.default = inject("jobService", "refService")(observer(ToolbarJobs));
