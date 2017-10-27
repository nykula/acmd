function WorkerError() { }

/** @type {'error'} */
WorkerError.prototype.type = "error";
WorkerError.prototype.message = "";
WorkerError.prototype.stack = "";

exports.WorkerError = WorkerError;
