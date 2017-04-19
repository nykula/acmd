exports.default = ({ files, showHidSys }) => {
  if (showHidSys) {
    return files.filter(file => {
      return file.name[0] !== '.'
    })
  }

  return files.filter(file => {
    return file.name[0] !== '.' || file.name === '..'
  })
}
