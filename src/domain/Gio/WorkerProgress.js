class WorkerProgress {
  constructor() {
    /** @type {'progress'} */
    this.type = "progress";
    this.uri = "";
    this.dest = "";
    this.doneSize = 0;
    this.size = 0;
    this.totalDoneSize = 0;
    this.totalSize = 0;
    this.totalDoneCount = 0;
    this.totalCount = 0;
  }
}

exports.WorkerProgress = WorkerProgress;
