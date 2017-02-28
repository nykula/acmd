exports.default = win => store => next => action => {
  if (action.type === 'EXIT') {
    win.destroy()
  }

  return next(action)
}
