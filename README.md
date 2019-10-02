# acme-commander

Twin-panel file manager.

![screenshot from 2017-10-29 16-32-37](https://user-images.githubusercontent.com/20999066/32144815-0734201e-bcc7-11e7-86c8-a990a9e7ff1e.png)

## Usage

[Quick start](https://acme.js.org/) assumes you run a common desktop. Customizing your system? Make sure you have all dependencies, including GNOME JavaScript v1.52 or newer, and PyGTK:

```bash
# Ubuntu 17.10
sudo apt update && sudo apt install bash coreutils gir1.2-gtk-3.0 git gjs npm python-gtk2
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

# Command not found? Add a search path:
echo 'export PATH="~/.local/bin:$PATH"' >> ~/.profile
source ~/.profile
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

[0BSD](LICENSE) public domain equivalent.
