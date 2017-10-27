function WorkerProgress() { }

/** @type {'progress'} */
WorkerProgress.prototype.type = "progress";
WorkerProgress.prototype.uri = "";
WorkerProgress.prototype.dest = "";
WorkerProgress.prototype.doneSize = 0;
WorkerProgress.prototype.size = 0;
WorkerProgress.prototype.totalDoneSize = 0;
WorkerProgress.prototype.totalSize = 0;
WorkerProgress.prototype.totalDoneCount = 0;
WorkerProgress.prototype.totalCount = 0;

exports.WorkerProgress = WorkerProgress;
