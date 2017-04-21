# acme-commander

> Twin-panel file manager

## Build Setup

``` bash
# install dependencies
yarn install

# open gjs with hot reload
yarn start

# lint all JS files in `bin` and `src`
yarn run lint-fix

# run tests and see coverage
yarn run coverage && xdg-open coverage/index.html
```

## Todo

- [x] Two-panel user interface

- [x] Toggle active panel on tab press and navigate files using arrow keys

- [x] Multiple tabs on each panel

- [x] Gio back-end: Ls, cp, mv, mkdir and rm

- [x] Sort files by name, ext or date

- [x] Directories always first

- [x] Show file permissions

- [x] Icons for common file and medium (drive) types

- [x] Toggle dotfiles visibility with a button

- [x] Focus matching file as user types

- [x] Select multiple files with keyboard

- [x] List drives from /dev and their labels for udisks mount, open and unmount

- [x] Create gvfs mount, list gvfs mounts for open and unmount

- [x] Find out with xdg mime query how to open file in different ways

- [x] Open terminal in current directory

- [x] Run command in current directory

- [x] Count total size of selected files

- [x] Format size as 1 M, 23 k, 456 B

- [x] Show free space on active mount

- [x] Go to root of mount

- [x] Return focus to tab after button press

- [x] Only handle backspace when tab focused

- [x] Go back and forward in panel history

- [x] Create empty file in active dir

- [ ] Keep cursor if no search matches

- [x] Dot dot if not root

- [ ] Click tab to switch

- [ ] Switch to previous tab on close

- [ ] Ignore dots in dir names when sorting

- [ ] Hotkey for active panel volume list

- [ ] Actions in menus

- [ ] Disable list view button

- [ ] Get viewer and editor from env

- [ ] Remove extra slash when copying to root

- [ ] Equal panel label height
