# acme-commander

> Twin-panel file manager

## Build Setup

``` bash
# install dependencies
yarn install

# open gjs with hot reload
yarn start

# lint all JS files in `src`
yarn run lint-fix
```

## Todo

- [x] Two-panel user interface as close to Total Commander as possible

- [x] Toggle active panel on tab press and navigate files using arrow keys

- [x] Mock back-end: List, view, edit, copy, move, mkdir, touch and delete

- [ ] Retry on remote error, remounting if necessary

- [ ] Prompt whether to continue after 3 retries

- [ ] Multiple tabs on each panel

- [x] Local back-end

- [ ] Gvfs back-end

- [ ] Passive FTP connection

- [x] Sort files by name, ext or date

- [x] Directories always first

- [ ] Show file permissions

- [ ] Icons for common file and medium (drive) types

- [ ] Toggle lowercasing 8.3 filenames after first letter

- [ ] Toggle dotfiles visibility with a button

- [ ] Focus matching file as user types

- [ ] Select multiple files with right mouse button

- [ ] List drives from /dev and their labels for udisks mount, open and unmount

- [ ] Create gvfs mount, list gvfs mounts for open and unmount

- [ ] Find out with xdg mime query how to open file in different ways

- [ ] Open terminal in current directory

- [ ] Run command in current directory
