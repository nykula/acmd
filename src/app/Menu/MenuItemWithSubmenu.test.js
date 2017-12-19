const expect = require("expect");
const { MenuItemWithSubmenu } = require("./MenuItemWithSubmenu");

describe("MenuItemWithSubmenu", () => {
  it("associates new gtkdom menu with a gtk menu item", () => {
    const menu = {};

    /** @type {any} */
    const document = {
      createElement: expect.createSpy().andReturn(menu),
    };

    const set = expect.createSpy();

    const menuItem = Object.defineProperties({}, {
      submenu: { set },
    });

    expect(new MenuItemWithSubmenu(menuItem, document)).toBe(menuItem);
    expect(set).toHaveBeenCalledWith(menu);
  });

  it("proxies dom methods to gtkdom menu", () => {
    const menu = {
      appendChild: expect.createSpy(),
      firstChild: false,
      insertBefore: expect.createSpy().andCall((newChild, _) => newChild),
      removeChild: expect.createSpy().andCall(x => x),
      replaceChild: expect.createSpy().andCall((_, oldChild) => oldChild),
    };

    /** @type {any} */
    const document = {
      createElement: () => menu,
    };

    /** @type {any} */
    let menuItem = {};
    menuItem = new MenuItemWithSubmenu(menuItem, document);

    expect(menuItem.firstChild).toBe(menu.firstChild);

    expect(menuItem.insertBefore("new child", "existing child")).toBe("new child");
    expect(menu.insertBefore).toHaveBeenCalledWith("new child", "existing child");

    menuItem.appendChild("new child");
    expect(menu.appendChild).toHaveBeenCalledWith("new child");

    expect(menuItem.removeChild("node")).toBe("node");
    expect(menu.removeChild).toHaveBeenCalledWith("node");

    expect(menuItem.replaceChild("new child", "old child")).toBe("old child");
    expect(menu.replaceChild).toHaveBeenCalledWith("new child", "old child");
  });
});
