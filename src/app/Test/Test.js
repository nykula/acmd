const { Buffer } = require("buffer");

exports.Class = class Class { };

/** @type {any[]} */
exports.EmptyArray = [];

/** @type {any} */
exports.EmptyProps = {};

/** @type {string} */
exports.NoString = (/** @type {any} */ (null));

let description = "";

/**
 * @param {string} nextDescription
 * @param {() => void} callback
 */
function describe(nextDescription, callback) {
  description = nextDescription;
  callback();
  description = "";
}

/**
 * @param {string} title
 * @param {() => void} callback
 */
function it(title, callback) {
  if (description) {
    title = description ? `${description}: ${title}` : title;
  }

  print(title + " STARTED");

  try {
    callback();
  } catch (error) {
    print(title + " ERROR");
    throw error;
  }

  print(title + " SUCCESS");
}

exports.find = find;
/**
 * @param {{ children: any[] }} tree
 * @param {(node: any) => boolean} callback
 */
function find(tree, callback) {
  return tree.children.filter(callback)[0];
}

exports.shallow = shallow;
/**
 * @param {{ flags: number, props: any, type: any }} tree
 */
function shallow(tree) {
  if (tree.flags === 4) {
    const Component = tree.type;
    return new Component(tree.props).render();
  }

  return tree.type(tree.props);
}

/**
 * Sets up the environment for tests.
 */
exports.require = () => {
  /**
   * @type {any}
   */
  const win = window;
  win.describe = describe;
  win.Buffer = Buffer;
  win.it = it;
};
