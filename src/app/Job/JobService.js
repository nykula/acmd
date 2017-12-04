const { WorkerProgress } = require("../../domain/Gio/WorkerProgress");
const { autoBind } = require("../Gjs/autoBind");
const { action, computed, extendObservable } = require("mobx");

function JobService() {
  autoBind(this, JobService.prototype, __filename);

  /** @type {{ [pid: number]: WorkerProgress }} */
  this.jobs = {};

  /** @type {number[]} */
  this.pids = [];

  /** @type {number[]} */
  this.statefulPids = [];

  /** @type {{ [pid: number]: string }} */
  this.types = {};

  extendObservable(this, {
    jobs: this.jobs,
    pids: this.pids,
    statefulPids: computed(this.getStatefulPids),
    types: this.types,
    remove: action(this.remove),
    save: action(this.save),
    stopWatching: action(this.stopWatching),
    watch: action(this.watch),
  });
}

/**
 * @param {number} pid
 * @param {string} type
 */
JobService.prototype.watch = function(pid, type) {
  this.pids.push(pid);

  if (this.types[pid]) {
    this.types[pid] = type;
    return;
  }

  this.types = Object.assign({}, this.types, {
    [pid]: type,
  });
};

/**
 * @param {number} pid
 */
JobService.prototype.stopWatching = function(pid) {
  this.pids = this.pids.filter(x => x !== pid);
};

/**
 * @param {number} pid
 * @param {WorkerProgress} progress
 */
JobService.prototype.save = function(pid, progress) {
  if (this.jobs[pid]) {
    this.jobs[pid] = progress;
    return;
  }

  this.jobs = Object.assign({}, this.jobs, {
    [pid]: progress,
  });
};

JobService.prototype.getStatefulPids = function() {
  return this.pids.filter(pid => !!this.jobs[pid]);
};

/**
 * @param {number} pid
 */
JobService.prototype.remove = function(pid) {
  this.stopWatching(pid);
  this.jobs[pid] = undefined;
  this.types[pid] = undefined;
};

exports.JobService = JobService;
