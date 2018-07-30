/** @type {any} */
var GitHub;

/** @type {any} */
var Remarkable;

/** @type {typeof document.createElement} */
var e = document.createElement.bind(document);

/**
 * @param {string} baseUrl https://github.com/user/repo
 */
function App(baseUrl) {
  /** @type {(selector: string) => HTMLElement} */
  this.$ = document.querySelector.bind(document);

  /* tslint:disable:no-console */
  /** @type {typeof console.log} */
  this.debug = console.log.bind(console);
  /* tslint:enable:no-console */

  this.baseUrl = baseUrl;

  var base = baseUrl.split("/");
  var user = base[base.length - 2];
  var repo = base[base.length - 1];

  var gh = new GitHub();
  this.issues = gh.getIssues(user, repo);
  this.repo = gh.getRepo(user, repo);
}

/**
 * @static
 * @param {HTMLElement} a
 * @param {HTMLElement} b
 */
App.compare = function(a, b) {
  var aKey = a.getAttribute("data-key") || "";
  var bKey = b.getAttribute("data-key") || "";

  return new Date(aKey).getTime() - new Date(bKey).getTime();
};

App.prototype.getScreenshot = function() {
  var self = this;

  this.repo
    .getReadme(undefined, true)
    .then(function(/** @type {any} */ res) {
      var matches = /http[^\)]+?\.(jpg|png)/.exec(res.data);

      if (!matches) {
        return;
      }

      var img = e("img");
      img.className = "img-fluid";
      img.src = matches[0];

      var section = self.$(".Screen");
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
  var resources;

  /** @type {Issue[]} */
  var issues;

  var self = this;

  this.repo
    .listCommits()
    .then(function(/** @type {any} */ res) {
      resources = res.data.slice(0, 15);
      return self.issues.listIssues({ sort: "updated" });
    })
    .then(function(/** @type {any} */ res) {
      issues = res.data;

      var section = self.$(".Pulse");
      var list = e("ul");
      list.className = "list-unstyled";

      for (var i = 0; i < issues.length; i++) {
        var issue = issues[i];
        var item = e("li");
        item.setAttribute("data-key", issue.updated_at);

        var title = e("p");
        title.appendChild(Time({ iso: issue.updated_at }));

        var link = e("a");
        link.href = issue.html_url;
        link.textContent = issue.title;
        title.appendChild(document.createTextNode(" "));
        title.appendChild(link);

        for (var j = 0; j < issue.labels.length; j++) {
          var label = issue.labels[j];

          var badge = e("span");
          badge.className = "badge badge-secondary";
          badge.textContent = label.name;

          title.appendChild(document.createTextNode(" "));
          title.appendChild(badge);
        }

        item.appendChild(title);
        list.appendChild(item);
      }

      for (i = 0; i < resources.length; i++) {
        var resource = resources[i];

        if (/^v\d+\.\d+\.\d+$/.test(resource.commit.message)) {
          continue;
        }

        item = e("li");
        item.setAttribute("data-key", resource.commit.committer.date);

        title = e("p");
        title.appendChild(Time({ iso: resource.commit.committer.date }));

        link = e("a");
        link.href = resource.html_url;
        link.textContent = resource.commit.message.split("\n")[0];
        title.appendChild(document.createTextNode(" "));
        title.appendChild(link);

        item.appendChild(title);
        list.appendChild(item);
      }

      Array.prototype.slice
        .call(list.children)
        .sort(App.compare)
        .reverse()
        .forEach(list.appendChild.bind(list));

      section.appendChild(list);

      var action = Action({
        className: "btn-outline-danger",
        href: self.baseUrl + "/issues",
        textContent: "Report issue"
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

  var self = this;

  this.repo
    .listReleases()
    .then(function(/** @type {{ data: Release[] }} */ res) {
      var section = self.$(".Releases");

      /** @type {string[]} */
      var minors = [];

      for (var i = 0; i < res.data.length; i++) {
        var release = res.data[i];

        var minor = release.tag_name
          .split(/[^\d]/)
          .map(Number)
          .slice(1, 3)
          .join(".");

        if (
          i &&
          (minors.length > 1 && (i > 3 || minor !== minors[minors.length - 1]))
        ) {
          var action = Action({
            className: "btn-outline-secondary",
            href: self.baseUrl + "/releases",
            textContent: "All releases"
          });

          section.appendChild(action);
          break;
        }

        var article = Article({
          href: self.baseUrl + "/tree/" + release.tag_name,
          strong: release.tag_name,
          textContent: release.created_at.split("T")[0]
        });

        var body = e("blockquote");
        body.innerHTML = new Remarkable().render(
          release.body.replace(
            /#([0-9]+)/g,
            "[#$1](" + self.baseUrl + "/issues/$1)"
          )
        );
        article.appendChild(body);

        if (!i) {
          action = Action({
            className: "btn-outline-primary",
            href: release.tarball_url,
            textContent: "Download source .tar.gz"
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
  var action = e("p");

  var link = e("a");
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
  var article = e("article");

  var title = e("h3");
  var link = e("a");
  link.href = props.href;

  var strong = e("strong");
  strong.textContent = props.strong;
  link.appendChild(strong);

  if (props.textContent) {
    var text = document.createTextNode(": " + props.textContent);
    link.appendChild(text);
  }

  title.appendChild(link);
  article.appendChild(title);
  return article;
}

/**
 * @param {{ iso: string }} props
 */
function Time(props) {
  var time = e("code");
  time.className = "px-0";
  time.textContent = props.iso
    .split("T")[0]
    .split("-")
    .slice(1)
    .join("/");
  return time;
}
