var app = null;
var editor = null;

$(document).ready(function() {
    app = new App();
    app.init();

    editor = new Editor($("#markdown-input"), $("#html-preview"));
});

function App() {
    this.myId = "mewlips";
    this.origUrl = "https://mewlips.github.io/"
    this.gitHub = new GitHub();
    this.me = this.gitHub.getUser(this.myId);
}

App.prototype.init = function () {
    var self = this;
    //this.loadMarkdownFile('/index.md', $('#index'));

    this.loadMyProjects($("#my-projects"));
    this.transformMarkupToHtml();
}

App.prototype.loadMarkdownFile = function (path, target) {
    $.ajax({
        url: path,
        dataType: "text",
        success: function (response) {
            var htmlContent = markdown.toHTML(response);
            target.html(htmlContent);
        }
    });
}

App.prototype.loadMyProjects = function (target) {
    var self = this;

    this.me.listRepos(function (err, repos, xhr) {
        if (err != null) {
            console.log(err);
            return;
        }
        self.repos = repos;

        var projects = $('<dl></dl>');
        for (var i = 0; i < repos.length; i++) {
            var repo = repos[i];
            var link = $('<a></a>');
            link.text(repo.name);
            link.attr('href', repo.html_url);
            var dt = $('<dt></dt>').html(link);

            var dd = (repo.description == null || repo.description == "")
                        ? ""
                        : $('<dd></dd>').text(' - ' + repo.description);
            var small = $('<small></small>');
            var smallAppended = false;
            if (repo.fork) {
                small.append(' ', $('<span class="label label-warning pull-right">Fork</span>'));
                smallAppended = true;
            }
            if (repo.has_issues && repo.open_issues_count > 0) {
                var issuesPageLink = $('<a>Issues</a>');
                issuesPageLink.attr('href', repo.html_url + '/issues');
                issuesPageLink.attr('class', 'label label-info pull-right');
                small.append(' ', issuesPageLink);
                smallAppended = true;
            }
            if (repo.has_pages && repo.name != "mewlips.github.io") {
                var projectPageLink = $('<a>Homepage</a>');
                projectPageLink.attr('href', self.origUrl + repo.name);
                projectPageLink.attr('class', 'label label-primary pull-right');
                small.append(' ', projectPageLink);
                smallAppended = true;
            }
            if (smallAppended) {
                dt.append(small);
            }
            projects.append(dt, dd);
        }
        target.empty();
        target.append(projects);
    });
}

App.prototype.transformMarkupToHtml = function () {
    $('.transform-markup-to-html').each(function () {
        var md = $(this).html().trim();
        $(this).html(markdown.toHTML(md));
    });
}
