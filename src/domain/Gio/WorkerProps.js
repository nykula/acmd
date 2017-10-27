function WorkerProps() { }

/** @type {'cp' | 'mv' | 'rm'} */
WorkerProps.prototype.type = undefined;

/** @type {string[]} */
WorkerProps.prototype.uris = undefined;

/** @type {string} */
WorkerProps.prototype.destUri = undefined;

exports.WorkerProps = WorkerProps;
