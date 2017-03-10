/**
 * Creates a parameterized ref callback that lets you manually construct a
 * native node and update it when props change.
 *
 * @example
 * h(Component, {
 *   ref: WidgetRef.default(new Foobar({
 *     foo: 'bar'
 *   }))
 * })
 *
 * @see https://github.com/Matt-Esch/virtual-dom/blob/master/docs/widget.md
 */
exports.default = widget => node => {
  if (!node) {
    return
  }

  let child = node.get_children()[0]

  if (!child) {
    child = widget.init()
    node.add(child)
  } else {
    const nextChild = widget.update(child.widget || {}, child) || child
    node.get_children().forEach(y => node.remove(y))
    node.add(nextChild)
  }
}

/**
 * Calls default, assuming widgets receives props as the only parameter.
 *
 * @example
 * const FoobarRef = WidgetRef.create(Foobar)
 * h(Component, {
 *   ref: FoobarRef({
 *     foo: 'bar'
 *   })
 * })
 */
exports.create = Widget => props => exports.default(new Widget(props))
