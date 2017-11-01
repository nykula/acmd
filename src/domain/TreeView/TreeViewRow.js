function TreeViewRow() { }

/** @type {any} */
TreeViewRow.prototype.iter = undefined;

/** @type {(name: string, value: any) => void} */
TreeViewRow.prototype.setAttribute = undefined;

/** @type {(input: string) => boolean} */
TreeViewRow.prototype.shouldSearchSkip = undefined;

exports.TreeViewRow = TreeViewRow;
