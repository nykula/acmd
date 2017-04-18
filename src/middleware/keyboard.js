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
        exports.handleReleased(ev)(dispatch, getState, extra)
      })
    }

    return next(action)
  }
}

exports.handleReleased = ev => (dispatch, getState, { Gdk }) => {
  switch (ev.which) {
    case Gdk.KEY_BackSpace:
      dispatch(indexActions.levelUp({ panelId: getState().panels.activeId }))
      return

    case Gdk.KEY_ISO_Left_Tab:
    case Gdk.KEY_Tab:
      if (ev.ctrlKey && ev.shiftKey) {
        dispatch(tabsActions.prev(getState().panels.activeId))
      } else if (ev.ctrlKey) {
        dispatch(tabsActions.next(getState().panels.activeId))
      } else {
        dispatch(panelsActions.toggledActive())
      }
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

    case Gdk.KEY_F5:
      dispatch(indexActions.cp())
      return

    case Gdk.KEY_F6:
      dispatch(indexActions.mv())
      return

    case Gdk.KEY_F7:
      dispatch({ type: indexActions.MKDIR })
      return

    case Gdk.KEY_F8:
      dispatch(indexActions.rm())
      return

    case Gdk.KEY_b:
      if (ev.ctrlKey) {
        dispatch({ type: indexActions.SHOW_HID_SYS })
      }
      return

    case Gdk.KEY_l:
      if (ev.ctrlKey) {
        dispatch({ type: indexActions.LS })
      }
      return

    case Gdk.KEY_t:
      if (ev.ctrlKey) {
        dispatch(tabsActions.create(getState().panels.activeId))
      }
      return

    case Gdk.KEY_w:
      if (ev.ctrlKey) {
        dispatch(tabsActions.remove(getActiveTabId(getState())))
      }
      return
  }
}
