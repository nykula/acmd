const getActiveTabId = require('../selectors/getActiveTabId').default
const KeyListener = require('../utils/KeyListener').default
const indexActions = require('../actions')
const panelsActions = require('../actions/panels')
const tabsActions = require('../actions/tabs')

exports.default = extra => {
  let isListening = false

  return ({ dispatch, getState }) => next => action => {
    if (!isListening) {
      isListening = true

      new KeyListener(extra.win).on('key-press-event', ev => {
        return exports.handleReleased(ev)(dispatch, getState, extra)
      })
    }

    return next(action)
  }
}

exports.handleReleased = ev => (dispatch, getState, { Gdk }) => {
  switch (ev.which) {
    case Gdk.KEY_BackSpace:
      dispatch(indexActions.levelUp({ panelId: getState().panels.activeId }))
      break

    case Gdk.KEY_ISO_Left_Tab:
    case Gdk.KEY_Tab:
      if (ev.ctrlKey && ev.shiftKey) {
        dispatch(tabsActions.prev(getState().panels.activeId))
      } else if (ev.ctrlKey) {
        dispatch(tabsActions.next(getState().panels.activeId))
      } else {
        dispatch(panelsActions.toggledActive())
      }
      return true

    case Gdk.KEY_F2:
      dispatch(indexActions.refresh())
      break

    case Gdk.KEY_F3:
      dispatch(indexActions.view())
      break

    case Gdk.KEY_F4:
      dispatch(indexActions.editor())
      break

    case Gdk.KEY_F5:
      dispatch(indexActions.cp())
      break

    case Gdk.KEY_F6:
      dispatch(indexActions.mv())
      break

    case Gdk.KEY_F7:
      dispatch({ type: indexActions.MKDIR })
      break

    case Gdk.KEY_F8:
      dispatch(indexActions.rm())
      break

    case Gdk.KEY_b:
      if (ev.ctrlKey) {
        dispatch({ type: indexActions.SHOW_HID_SYS })
      }
      break

    case Gdk.KEY_l:
      if (ev.ctrlKey) {
        dispatch({ type: indexActions.LS })
      }
      break

    case Gdk.KEY_t:
      if (ev.ctrlKey) {
        dispatch(tabsActions.create(getState().panels.activeId))
      }
      break

    case Gdk.KEY_w:
      if (ev.ctrlKey) {
        dispatch(tabsActions.remove(getActiveTabId(getState())))
      }
      break
  }

  return false
}
