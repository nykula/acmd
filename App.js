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

/** @type {(selector: string) => HTMLElement} */
App.prototype.$ = document.querySelector.bind(document);

/** @type {typeof console.log} */
App.prototype.debug = console.log.bind(console);

App.prototype.listIssues = function() {
  this.issues.listIssues({ sort: "updated" })
    .then((/** @type {any} */ res) => this.debug(res.data))
    .catch(console.error);
};

App.prototype.listCommits = function() {
  this.repo.listCommits()
    .then((/** @type {any} */ res) => {
      /**
       * @typedef User
       * @property {string} html_url
       * @property {string} name
       *
       * @typedef Commit
       * @property {User} author
       * @property {{ author: { date: string } }} commit
       * @property {User} committer
       * @property {string} html_url
       */

      /** @type {Commit[]} */
      const commits = res.data;

      this.debug(commits.map(commit => {
        return {
          author: {
            html_url: commit.author.html_url,
            name: commit.author.name,
          },

          commit: {
            author: {
              date: commit.commit.author.date,
            },
          },

          committer: {
            html_url: commit.committer.html_url,
            name: commit.committer.name,
          },

          html_url: commit.html_url,
        };
      }));
    })
    .catch(console.error);
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

      let prevMajor = -1;
      let prevMinor = -1;

      for (let i = 0; i < res.data.length; i++) {
        const release = res.data[i];

        const version = release.tag_name
          .split(/[^\d]/)
          .map(Number);

        if (i && (version[1] !== prevMajor || version[2] !== prevMinor)) {
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
        body.innerHTML = new Remarkable().render(release.body);
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

        prevMajor = version[1];
        prevMinor = version[2];
      }
    })
    .catch(console.error);
};

/**
 * @param {HTMLElement} parent
 */
App.prototype.render = function(parent) {
  this.$ = parent.querySelector.bind(parent);
  this.listCommits();
  this.listIssues();
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
