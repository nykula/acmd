/**
 * @param {{ files: any, showHidSys: boolean }} props
 */
exports.default = (props) => {
  const { files, showHidSys } = props

  if (showHidSys) {
    return files.filter((/** @type {{ name: string }} */ file) => {
      return file.name !== '.'
    })
  }

  return files.filter((/** @type {{ name: string }} */file) => {
    return file.name[0] !== '.' || file.name === '..'
  })
}
