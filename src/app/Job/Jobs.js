const { Box, HSeparator, Label, Orientation, Popover } = imports.gi.Gtk;
const { Component } = require("inferno");
const { inject, observer } = require("inferno-mobx");
const { autoBind } = require("../Gjs/autoBind");
const { h } = require("../Gjs/GtkInferno");
const { RefService } = require("../Ref/RefService");
const Job = require("./Job").default;
const { JobService } = require("./JobService");

/**
 * @typedef IProps
 * @property {JobService?} [jobService]
 * @property {RefService?} [refService]
 *
 * @extends Component<IProps>
 */
class Jobs extends Component {
  /**
   * @param {IProps} props
   */
  constructor(props) {
    super(props);
    autoBind(this, Jobs.prototype, __filename);
  }

  /**
   * @param {Popover} popover
   */
  usePopover(popover) {
    const { set } =
      /** @type {RefService} */ (this.props.refService);

    set("jobs")(popover);
  }

  render() {
    const inner = [
      h(Label, {
        key: "tip",
        label: "Cp/mv/rm progress displays here",
      }),
    ];

    const { statefulPids } =
      /** @type {JobService} */ (this.props.jobService);

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
  }
}

exports.Jobs = Jobs;
exports.default = inject("jobService", "refService")(observer(Jobs));
