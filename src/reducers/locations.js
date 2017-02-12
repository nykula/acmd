export default (state = [ '/c/Users/D/Music', '/c' ], payload) => {
  switch (payload.type) {
    case 'setLocation':
      if (payload.activePanel === 0) {
        return [ payload.location, state[1] ]
      } else {
        return [ state[0], payload.location ]
      }

    default:
      return state
  }
}
