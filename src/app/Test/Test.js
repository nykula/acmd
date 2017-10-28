const Buffer = require("buffer/").Buffer;

let description = "";

exports.describe = function(_description, callback) {
  description = _description;
  callback();
  description = "";
};

exports.it = function(title, callback) {
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
};

exports.find = find;
function find(tree, callback) {
  return tree.children.filter(callback)[0];
}

exports.shallow = shallow;
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
  win.describe = exports.describe;
  win.Buffer = Buffer;
  win.it = exports.it;
};
