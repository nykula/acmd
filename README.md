# acme-commander

Twin-panel file manager.

![screenshot from 2017-10-28 01-41-49](https://user-images.githubusercontent.com/20999066/32127710-69f5080e-bb81-11e7-9fa7-e57f5103e4cb.png)

## Usage

Make sure you have a GNOME JavaScript runtime, v1.50 or newer:

```bash
# Ubuntu 17.10
sudo apt update && sudo apt install gjs

# macOS (not much works besides UI)
brew update && brew install gjs
```

Then install with [Yarn](https://yarnpkg.com/en/docs/install#linux-tab):

```bash
yarn global add acme-commander
```

Run:

```bash
acme-commander
```

## Development

```bash
# clone repo
git clone https://github.com/makepost/acme-commander
cd acme-commander

# install dependencies
yarn

# open gjs with hot reload
yarn start

# lint all JS files in `bin` and `src`
yarn format

# run tests and see coverage
yarn coverage && xdg-open coverage/index.html
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

- [x] Keep cursor if no search matches

- [x] Dot dot if not root

- [x] Click tab to switch

- [x] Switch to next tab on close

- [x] Ignore dots in dir names when sorting by ext

- [x] Hotkey for active panel volume list

- [x] Actions in menus

- [x] Disable list view button

- [ ] Get viewer and editor from env

- [ ] Remove extra slash when copying to root

- [ ] Equal panel label height

## License

MIT
