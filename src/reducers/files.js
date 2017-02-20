export default (state = { 0: [], 1: [] }, payload) => {
  switch (payload.type) {
    case 'LS':
      if (payload.result) {
        return {...state,
          [payload.panel]: payload.result.files
        }
      }

      return state

    default:
      return state
  }
}
