export default (state = { 0: '/', 1: '/' }, payload) => {
  switch (payload.type) {
    case 'LS':
      return {...state,
        [payload.panel]: payload.path
      }

    default:
      return state
  }
}
