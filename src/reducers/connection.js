import MockConnection from '../connections/MockConnection'

export default (state = new MockConnection(window), payload) => {
  return state
}
