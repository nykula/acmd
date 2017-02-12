export default (state = { 0: [], 1: [] }, payload) => {
  switch (payload.type) {
    case 'setFiles':
      return payload.files

    default:
      return state
  }
}
