const { File } = require("../../domain/File/File");

/**
 * @param {{ files: File[], showHidSys: boolean }} props
 */
exports.default = (props) => {
  const { files, showHidSys } = props;

  if (showHidSys) {
    return files.filter(file => {
      return file.name !== ".";
    });
  }

  return files.filter(file => {
    return file.name[0] !== "." || file.name === "..";
  });
};
