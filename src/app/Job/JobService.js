const { DataInputStream, Subprocess, SubprocessFlags } = imports.gi.Gio;
const { PRIORITY_LOW } = imports.gi.GLib;
const { Button, Popover } = imports.gi.Gtk;
const noop = require("lodash/noop");
const { action, computed, extendObservable } = require("mobx");
const { WorkerError } = require("../../domain/Gio/WorkerError");
const { WorkerProps } = require("../../domain/Gio/WorkerProps");
const { WorkerProgress } = require("../../domain/Gio/WorkerProgress");
const { WorkerSuccess } = require("../../domain/Gio/WorkerSuccess");
const { autoBind } = require("../Gjs/autoBind");
const { RefService } = require("../Ref/RefService");

/**
 * Spawns, stops, continues and interrupts subprocesses.
 */
class JobService {
  /**
   * @param {{ refService: RefService }} props
   */
  constructor(props) {
    this.DataInputStream = DataInputStream;
    this.props = props;
    this.Subprocess = Subprocess;

    /** @type {{ [pid: number]: WorkerProgress }} */
    this.jobs = {};

    /** @type {number[]} */
    this.pids = [];

    /** @type {number[]} */
    this.statefulPids = [];

    /** @type {{ [pid: number]: string }} */
    this.types = {};

    autoBind(this, JobService.prototype, __filename);

    extendObservable(this, {
      jobs: this.jobs,
      pids: this.pids,
      remove: action(this.remove),
      save: action(this.save),
      statefulPids: computed(this.getStatefulPids),
      types: this.types,
      watch: action(this.watch),
    });
  }

  /**
   * Interrupts a process. Typically done by pressing Ctrl+C in a controlling
   * terminal. By default, causes the process to terminate.
   *
   * @param {number} pid
   */
  cancel(pid) {
    this.remove(pid);
    this.sendSignal(pid, "INT");
  }

  /**
   * Resumes a previously stopped process.
   *
   * @param {number} pid
   */
  continue(pid) {
    this.sendSignal(pid, "CONT");
  }

  /**
   * Displays progress of active workers.
   */
  list() {
    const { refService } = this.props;

    /** @type {Popover} */
    const jobs = refService.get("jobs");

    /** @type {Button} */
    const toolbarJobs = refService.get("toolbarJobs");

    jobs.set_relative_to(toolbarJobs);
    jobs.show_all();
  }

  /**
   * Stops a process for later resumption.
   *
   * @param {number} pid
   */
  pause(pid) {
    this.sendSignal(pid, "STOP");
  }

  /**
   * Spawns a worker. Returns its pid. Calls back on error or success.
   *
   * @param {WorkerProps} props
   * @param {(error?: { message: string }) => void} callback
   */
  run(props, callback = noop) {
    const subprocess = new this.Subprocess({
      argv: [
        "gjs",
        __dirname + "/../../../bin/worker.js",
        JSON.stringify(props),
      ],
      flags: SubprocessFlags.STDOUT_PIPE,
    });

    subprocess.init(null);
    const pid = Number(subprocess.get_identifier());

    this.watch(pid, props.type);
    this.onJson(subprocess, ev => {
      if (ev.type === "progress") {
        this.save(pid, ev);
      } else if (ev.type === "error" || ev.type === "success") {
        this.remove(pid);
      }

      if (ev.type === "error") {
        callback(ev);
      } else if (ev.type === "success") {
        callback();
      }
    });

    return pid;
  }

  /**
   * @private
   */
  getStatefulPids() {
    return this.pids.filter(pid => !!this.jobs[pid]);
  }

  /**
   * Calls back with parsed event every time the process outputs a JSON line.
   *
   * @private
   * @param {Subprocess} subprocess
   * @param {(ev: WorkerProgress | WorkerError | WorkerSuccess) => void} emit
   */
  onJson(subprocess, emit) {
    const stream = new this.DataInputStream({
      base_stream: subprocess.get_stdout_pipe(),
    });

    const read = () => {
      stream.read_line_async(PRIORITY_LOW, null, (_, res) => {
        const [out] = stream.read_line_finish(res);

        if (out === null) {
          return;
        }

        const ev = JSON.parse(out.toString());
        emit(ev);
        read();
      });
    };

    read();
  }

  /**
   * @private
   * @param {number} pid
   */
  remove(pid) {
    this.pids = this.pids.filter(x => x !== pid);
    this.jobs[pid] = undefined;
    this.types[pid] = undefined;
  }

  /**
   * @private
   * @param {number} pid
   * @param {WorkerProgress} progress
   */
  save(pid, progress) {
    if (this.jobs[pid]) {
      this.jobs[pid] = progress;
      return;
    }

    this.jobs = Object.assign({}, this.jobs, {
      [pid]: progress,
    });
  }

  /**
   * Signals a process. Numbers vary between systems and the "-l" parameter
   * doesn't work everywhere, so send_signal() wasn't reliable.
   *
   * @private
   * @param {number} pid
   * @param {string} name
   */
  sendSignal(pid, name) {
    new this.Subprocess({
      argv: ["kill", "-" + name, pid.toString()],
    }).init(null);
  }

  /**
   * @private
   * @param {number} pid
   * @param {string} type
   */
  watch(pid, type) {
    this.pids.push(pid);

    if (this.types[pid]) {
      this.types[pid] = type;
      return;
    }

    this.types = Object.assign({}, this.types, {
      [pid]: type,
    });
  }
}

exports.JobService = JobService;
