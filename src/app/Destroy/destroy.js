exports.default = ({ win }) => _ => next => action => {
  if (action.type === 'EXIT') {
    win.destroy()
  }

  return next(action)
}
