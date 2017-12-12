const { TreeIter } = imports.gi.Gtk;

/**
 * Type definition. Actual rows are Stub.
 */
class TreeViewRow {
  constructor() {
    /** @type {TreeIter | undefined} */
    this.iter = undefined;

    /** @type {(name: string, value: any) => void} */
    this.setAttribute = (/** @type {any} */ (undefined));

    /** @type {(input: string) => boolean} */
    this.shouldSearchSkip = (/** @type {any} */ (undefined));
  }
}

exports.TreeViewRow = TreeViewRow;
