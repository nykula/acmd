exports.default = ({ files, showHidSys }) => {
  if (showHidSys) {
    return files.filter(file => {
      return file.name !== '.'
    })
  }

  return files.filter(file => {
    return file.name[0] !== '.' || file.name === '..'
  })
}
