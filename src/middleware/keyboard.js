const getActiveTabId = require('../selectors/getActiveTabId').default
const indexActions = require('../actions')
const panelsActions = require('../actions/panels')
const tabsActions = require('../actions/tabs')

exports.default = extra => {
  const { Gdk, win } = extra
  let isListening = false
  const pressed = {}

  return ({ dispatch, getState }) => next => action => {
    if (isListening) {
      return next(action)
    }

    isListening = true

    win.connect('key-press-event', (_, ev) => {
      const keyval = ev.get_keyval()[1]
      pressed[keyval] = true
    })

    win.connect('key-release-event', (_, ev) => {
      const keyval = ev.get_keyval()[1]

      const action = {
        which: keyval,
        ctrlKey: pressed[Gdk.KEY_Control_L] || pressed[Gdk.KEY_Control_R],
        shiftKey: pressed[Gdk.KEY_Shift_L] || pressed[Gdk.KEY_Shift_R],
        altKey: pressed[Gdk.KEY_Alt_L] || pressed[Gdk.KEY_Alt_R],
        metaKey: pressed[Gdk.KEY_Meta_L] || pressed[Gdk.KEY_Meta_R]
      }

      exports.handleReleased(action)(dispatch, getState, extra)

      pressed[keyval] = false
    })

    return next(action)
  }
}

exports.handleReleased = action => (dispatch, getState, { Gdk }) => {
  switch (action.which) {
    case Gdk.KEY_BackSpace:
      dispatch(indexActions.levelUp({ panelId: getState().panels.activeId }))
      return

    case Gdk.KEY_ISO_Left_Tab:
    case Gdk.KEY_Tab:
      if (action.ctrlKey && action.shiftKey) {
        dispatch(tabsActions.prev(getState().panels.activeId))
      } else if (action.ctrlKey) {
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
      if (action.ctrlKey) {
        dispatch({ type: indexActions.SHOW_HID_SYS })
      }
      return

    case Gdk.KEY_l:
      if (action.ctrlKey) {
        dispatch({ type: indexActions.LS })
      }
      return

    case Gdk.KEY_t:
      if (action.ctrlKey) {
        dispatch(tabsActions.create(getState().panels.activeId))
      }
      return

    case Gdk.KEY_w:
      if (action.ctrlKey) {
        dispatch(tabsActions.remove(getActiveTabId(getState())))
      }
      return
  }
}
