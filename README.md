# acme-commander

Twin-panel file manager.

![screenshot from 2017-10-29 16-32-37](https://user-images.githubusercontent.com/20999066/32144815-0734201e-bcc7-11e7-86c8-a990a9e7ff1e.png)

## Usage

Make sure you have a GNOME JavaScript runtime, v1.50 or newer, and PyGTK:

```bash
# Ubuntu 17.10
sudo apt update && sudo apt install gjs python-gtk2
```

Then install with [npm](https://nodejs.org/en/download/):

```bash
npm i -g acme-commander

# Above not working? Try a local prefix:
echo prefix=~/.local >> ~/.npmrc
npm i -g acme-commander
```

Run:

```bash
acme-commander
```

## Development

Also install [Yarn](https://yarnpkg.com/en/docs/install#linux-tab). Get started:

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

[VS Code](https://code.visualstudio.com/) will highlight mistakes and provide autocomplete, as long as you follow JSDoc [@param](http://usejsdoc.org/tags-param.html) and [@type](http://usejsdoc.org/tags-type.html).

## License

MIT
