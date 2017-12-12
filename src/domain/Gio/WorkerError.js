class WorkerError {
  constructor() {
    /** @type {'error'} */
    this.type = "error";

    this.message = "";

    this.stack = "";
  }
}

exports.WorkerError = WorkerError;
