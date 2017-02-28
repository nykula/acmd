exports.KEY_RELEASED = 'KEY_RELEASED'
exports.keyReleased = ({ Gdk, pressed, which }) => ({
  type: exports.KEY_RELEASED,
  which: which,
  ctrlKey: pressed[Gdk.KEY_Control_L] || pressed[Gdk.KEY_Control_R],
  shiftKey: pressed[Gdk.KEY_Shift_L] || pressed[Gdk.KEY_Shift_R],
  altKey: pressed[Gdk.KEY_Alt_L] || pressed[Gdk.KEY_Alt_R],
  metaKey: pressed[Gdk.KEY_Meta_L] || pressed[Gdk.KEY_Meta_R]
})
