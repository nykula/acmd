/** @type {any} */
var GitHub;

/** @type {any} */
var Remarkable;

/** @type {typeof document.createElement} */
const e = document.createElement.bind(document);

/**
 * @param {string} baseUrl https://github.com/user/repo
 */
function App(baseUrl) {
  this.baseUrl = baseUrl;

  const base = baseUrl.split("/");
  const user = base[base.length - 2];
  const repo = base[base.length - 1];

  const gh = new GitHub();
  this.issues = gh.getIssues(user, repo);
  this.repo = gh.getRepo(user, repo);
}

/**
 * @static
 * @param {HTMLElement} a
 * @param {HTMLElement} b
 */
App.compare = function(a, b) {
  const aKey = a.getAttribute("data-key") || "";
  const bKey = b.getAttribute("data-key") || "";

  return new Date(aKey).getTime() - new Date(bKey).getTime();
};

/** @type {(selector: string) => HTMLElement} */
App.prototype.$ = document.querySelector.bind(document);

/** @type {typeof console.log} */
App.prototype.debug = console.log.bind(console);

App.prototype.getScreenshot = function() {
  this.repo.getReadme(undefined, true)
    .then((/** @type {any} */ res) => {
      const matches = /http[^\)]+?\.(jpg|png)/.exec(res.data);

      if (!matches) {
        return;
      }

      const img = e("img");
      img.className = "img-fluid";
      img.src = matches[0];

      const section = this.$(".Screen");
      section.appendChild(img);
    })
    .catch(this.debug);
};

App.prototype.listPulse = function() {
  /**
   * @typedef Resource
   * @property {{ committer: { date: string }, message: string }} commit
   * @property {string} html_url
   *
   * @typedef Issue
   * @property {string} html_url
   * @property {{ name: string }[]} labels
   * @property {string} title
   * @property {string} updated_at
   */

  /** @type {Resource[]} */
  let resources;

  /** @type {Issue[]} */
  let issues;

  this.repo.listCommits()
    .then((/** @type {any} */ res) => {
      resources = res.data.slice(0, 15);
      return this.issues.listIssues({ sort: "updated" });
    })
    .then((/** @type {any} */ res) => {
      issues = res.data;

      const section = this.$(".Pulse");
      const list = e("ul");
      list.className = "list-unstyled";

      for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        const item = e("li");
        item.setAttribute("data-key", issue.updated_at);

        const title = e("p");
        const link = e("a");
        link.href = issue.html_url;
        link.textContent = issue.title;
        title.appendChild(link);

        for (let j = 0; j < issue.labels.length; j++) {
          const label = issue.labels[j];

          const badge = e("span");
          badge.className = "badge badge-secondary";
          badge.textContent = label.name;

          title.appendChild(document.createTextNode(" "));
          title.appendChild(badge);
        }

        item.appendChild(title);
        list.appendChild(item);
      }

      for (let i = 0; i < resources.length; i++) {
        const resource = resources[i];

        if (/^v\d+\.\d+\.\d+$/.test(resource.commit.message)) {
          continue;
        }

        const item = e("li");
        item.setAttribute("data-key", resource.commit.committer.date);

        const title = e("p");
        const link = e("a");
        link.href = resource.html_url;
        link.textContent = resource.commit.message.split("\n")[0];
        title.appendChild(link);
        item.appendChild(title);

        list.appendChild(item);
      }

      Array.prototype.slice.call(list.children)
        .sort(App.compare)
        .reverse()
        .forEach(list.appendChild.bind(list));

      section.appendChild(list);

      const action = Action({
        className: "btn-outline-danger",
        href: this.baseUrl + "/issues",
        textContent: "Report issue",
      });

      section.appendChild(action);
    })
    .catch(this.debug);
};

App.prototype.listReleases = function() {
  /**
   * @typedef Release
   * @property {string} body
   * @property {string} created_at
   * @property {string} tag_name
   * @property {string} tarball_url
   */

  this.repo.listReleases()
    .then((/** @type {{ data: Release[] }} */ res) => {
      const section = this.$(".Releases");

      /** @type {string[]} */
      const minors = [];

      for (let i = 0; i < res.data.length; i++) {
        const release = res.data[i];

        const minor = release.tag_name
          .split(/[^\d]/)
          .map(Number)
          .slice(1, 3)
          .join(".");

        if (i && (minors.length > 1 && minor !== minors[minors.length - 1])) {
          const action = Action({
            className: "btn-outline-secondary",
            href: this.baseUrl + "/releases",
            textContent: "All releases",
          });

          section.appendChild(action);
          break;
        }

        const article = Article({
          href: this.baseUrl + "/tree/" + release.tag_name,
          strong: release.tag_name,
          textContent: release.created_at.split("T")[0],
        });

        const body = e("blockquote");
        body.innerHTML = new Remarkable().render(
          release.body.replace(
            /#([0-9]+)/g,
            "[#$1](" + this.baseUrl + "/issues/$1)",
          ),
        );
        article.appendChild(body);

        if (!i) {
          const action = Action({
            className: "btn-outline-primary",
            href: release.tarball_url,
            textContent: "Download source .tar.gz",
          });

          article.appendChild(action);
        }

        section.appendChild(article);

        if (minors.indexOf(minor) === -1) {
          minors.push(minor);
        }
      }
    })
    .catch(this.debug);
};

/**
 * @param {HTMLElement} parent
 */
App.prototype.render = function(parent) {
  this.$ = parent.querySelector.bind(parent);
  this.getScreenshot();
  this.listPulse();
  this.listReleases();
};

/**
 * @param {{ className: string, href: string, textContent: string }} props
 */
function Action(props) {
  const action = e("p");

  const link = e("a");
  link.className = "btn " + props.className;
  link.href = props.href;
  link.textContent = props.textContent;

  action.appendChild(link);
  return action;
}

/**
 * @param {{ href: string, strong: string, textContent?: string }} props
 */
function Article(props) {
  const article = e("article");

  const title = e("h3");
  const link = e("a");
  link.href = props.href;

  const strong = e("strong");
  strong.textContent = props.strong;
  link.appendChild(strong);

  if (props.textContent) {
    const text = document.createTextNode(": " + props.textContent);
    link.appendChild(text);
  }

  title.appendChild(link);
  article.appendChild(title);
  return article;
}
