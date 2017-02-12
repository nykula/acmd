export default (state = 0, payload) => {
  switch (payload.type) {
    case 'toggleActivePanel':
      return state === 0 ? 1 : 0
    default:
      return state
  }
}
