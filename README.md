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

- [x] Two-panel user interface as close to Total Commander as possible

- [x] Toggle active panel on tab press and navigate files using arrow keys

- [x] Mock back-end: List, view, edit, copy, move, mkdir, touch and delete

- [x] Multiple tabs on each panel

- [x] Local back-end

- [x] Gvfs back-end

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
