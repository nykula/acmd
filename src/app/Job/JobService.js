const { WorkerProgress } = require("../../domain/Gio/WorkerProgress");
const { autoBind } = require("../Gjs/autoBind");
const { action, extendObservable } = require("mobx");

function JobService() {
  autoBind(this, JobService.prototype, __filename);

  /** @type {{ [pid: number]: WorkerProgress }} */
  this.jobs = {};

  /** @type {number[]} */
  this.pids = [];

  extendObservable(this, {
    jobs: this.jobs,
    pids: this.pids,
    remove: action(this.remove),
    save: action(this.save),
  });
}

/**
 * @param {number} pid
 * @param {WorkerProgress} progress
 */
JobService.prototype.save = function(pid, progress) {
  if (this.jobs[pid]) {
    this.jobs[pid] = progress;
  } else {
    this.jobs = Object.assign({}, this.jobs, {
      [pid]: progress,
    });

    this.pids.push(pid);
  }
};

/**
 * @param {number} pid
 */
JobService.prototype.remove = function(pid) {
  this.jobs[pid] = undefined;
  this.pids = this.pids.filter(x => x !== pid);
};

exports.JobService = JobService;
