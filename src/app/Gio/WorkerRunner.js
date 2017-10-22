/* global imports */
/* eslint-disable no-path-concat */
const GLib = imports.gi.GLib
const Gio = imports.gi.Gio

/**
 * Spawns, stops, continues and interrupts Gio subprocesses.
 */
function WorkerRunner () {
  this.continue = this.continue.bind(this)
  this.interrupt = this.interrupt.bind(this)
  this.onJson = this.onJson.bind(this)
  this.run = this.run.bind(this)
  this.sendSignal = this.sendSignal.bind(this)
  this.stop = this.stop.bind(this)

  this.requestIds = []
  this.entities = {}
}

/**
 * Spawns a worker process according to a given action and associates it
 * with the request id supplied in the action. Dispatches its output as
 * new actions.
 */
WorkerRunner.prototype.run = function (action, dispatch) {
  const requestId = action.requestId

  const subprocess = new Gio.Subprocess({
    argv: ['gjs', __dirname + '/../../../bin/worker.js', JSON.stringify(action)],
    flags: Gio.SubprocessFlags.STDOUT_PIPE
  })

  this.entities[requestId] = subprocess
  this.requestIds.push(requestId)

  subprocess.init(null)
  this.onJson(action, dispatch)
}

/**
 * Stops the process associated with the request id supplied in the action for
 * later resumption.
 */
WorkerRunner.prototype.stop = function (action) {
  this.sendSignal('STOP', action)
}

/**
 * Resumes the previously stopped process associated with the request id
 * supplied in the action.
 */
WorkerRunner.prototype.continue = function (action) {
  this.sendSignal('CONT', action)
}

/**
 * Interrupts the process associated with the request id supplied in the
 * action. This is typically initiated by pressing Ctrl+C in a controlling
 * terminal. By default, this causes the process to terminate.
 */
WorkerRunner.prototype.interrupt = function (action) {
  const requestId = action.requestId
  this.sendSignal('INT', action)

  this.requestIds = this.requestIds.filter(x => x !== requestId)
  delete this.entities[requestId]
}

/**
 * Calls back with parsed data every time the process associated with the
 * request id supplied in the action writes a JSON line to stdout.
 */
WorkerRunner.prototype.onJson = function (action, callback) {
  const subprocess = this.entities[action.requestId]
  const stream = new Gio.DataInputStream({ base_stream: subprocess.get_stdout_pipe() })

  const read = () => {
    stream.read_line_async(GLib.PRIORITY_LOW, null, (_, res) => {
      const [out] = stream.read_line_finish(res)

      if (out === null) {
        return
      }

      const data = JSON.parse(out)
      callback(data)
      read()
    })
  }

  read()
}

/**
 * Sends a signal to the process associated with the request id supplied in the
 * action. Numbers vary between systems and the "-l" parameter doesn't work
 * everywhere, so send_signal() wasn't reliable.
 */
WorkerRunner.prototype.sendSignal = function (name, action) {
  const subprocess = this.entities[action.requestId]
  const pid = subprocess.get_identifier()

  new Gio.Subprocess({
    argv: ['kill', '-' + name, pid]
  }).init(null)
}

exports.WorkerRunner = WorkerRunner
