const GLib = imports.gi.GLib;
const { SubprocessFlags } = imports.gi.Gio;
const { WorkerError } = require("../../domain/Gio/WorkerError");
const { WorkerProps } = require("../../domain/Gio/WorkerProps");
const { WorkerProgress } = require("../../domain/Gio/WorkerProgress");
const { WorkerSuccess } = require("../../domain/Gio/WorkerSuccess");
const autoBind = require("../Gjs/autoBind").default;

/**
 * Spawns, stops, continues and interrupts Gio subprocesses.
 */
function WorkerService(Gio = imports.gi.Gio) {
  autoBind(this, WorkerService.prototype, __filename);

  this.Gio = Gio;

  /**
   * @type {{ [pid: number]: any }}
   */
  this.subprocesses = {};
}

/**
 * Spawns a worker. Returns its pid. Calls back with events it outputs.
 *
 * @param {WorkerProps} ev
 * @param {(ev: WorkerProgress | WorkerError | WorkerSuccess) => void} emit
 */
WorkerService.prototype.run = function(ev, emit) {
  const subprocess = new this.Gio.Subprocess({
    argv: [__dirname + "/../../../bin/worker.js", JSON.stringify(ev)],
    flags: SubprocessFlags.STDOUT_PIPE,
  });

  subprocess.init(null);
  const pid = subprocess.get_identifier();

  this.subprocesses[pid] = subprocess;
  this.onJson(pid, emit);
};

/**
 * Stops the process for later resumption.
 *
 * @param {number} pid
 */
WorkerService.prototype.stop = function(pid) {
  this.sendSignal("STOP", pid);
};

/**
 * Resumes the previously stopped process.
 *
 * @param {number} pid
 */
WorkerService.prototype.continue = function(pid) {
  this.sendSignal("CONT", pid);
};

/**
 * Interrupts the process. Typically done by pressing Ctrl+C in a controlling
 * terminal. By default, causes the process to terminate.
 *
 * @param {number} pid
 */
WorkerService.prototype.interrupt = function(pid) {
  this.sendSignal("INT", pid);
  delete this.subprocesses[pid];
};

/**
 * Calls back with parsed event every time the process outputs a JSON line.
 *
 * @param {number} pid
 * @param {(ev: any) => void} emit
 */
WorkerService.prototype.onJson = function(pid, emit) {
  const subprocess = this.subprocesses[pid];
  const stream = new this.Gio.DataInputStream({ base_stream: subprocess.get_stdout_pipe() });

  const read = () => {
    stream.read_line_async(GLib.PRIORITY_LOW, null, (_, res) => {
      const [out] = stream.read_line_finish(res);

      if (out === null) {
        return;
      }

      const ev = JSON.parse(out);
      emit(ev);
      read();
    });
  };

  read();
};

/**
 * Sends a signal to the process. Numbers vary between systems and the "-l"
 * parameter doesn't work everywhere, so send_signal() wasn't reliable.
 *
 * @param {string} name
 * @param {number} pid
 */
WorkerService.prototype.sendSignal = function(name, pid) {
  new this.Gio.Subprocess({
    argv: ["kill", "-" + name, pid],
  }).init(null);
};

exports.WorkerService = WorkerService;
