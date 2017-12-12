class WorkerProps {
  constructor() {
    /** @type {'cp' | 'mv' | 'rm'} */
    this.type = "cp";

    /** @type {string[]} */
    this.uris = [];

    /** @type {string} */
    this.destUri = "";
  }
}

exports.WorkerProps = WorkerProps;
