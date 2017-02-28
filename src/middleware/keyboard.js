const actions = require('../actions/keyboard')
const indexActions = require('../actions')
const panelsActions = require('../actions/panels')
const listen = require('../utils/keyboard').default

exports.default = ({ Gdk, win }) => {
  let isListening = false

  return ({dispatch, getState}) => next => action => {
    if (!isListening) {
      listen({
        dispatch: dispatch,
        Gdk: Gdk,
        win: win
      })
      isListening = true
      return next(action)
    }

    if (action.type === actions.KEY_RELEASED) {
      exports.handleReleased({
        dispatch: dispatch,
        Gdk: Gdk,
        state: getState(),
        win: win
      }, action)
    }

    return next(action)
  }
}

exports.handleReleased = ({ dispatch, Gdk, state }, action) => {
  switch (action.which) {
    case Gdk.KEY_BackSpace:
      dispatch(indexActions.levelUp({ panelId: state.panels.active }))
      return

    case Gdk.KEY_Tab:
      dispatch(panelsActions.toggledActive())
      return

    case Gdk.KEY_F2:
      dispatch(indexActions.refresh())
      return

    case Gdk.KEY_F3:
      dispatch(indexActions.view())
      return

    case Gdk.KEY_F4:
      dispatch(indexActions.editor())
      return
  }
}
