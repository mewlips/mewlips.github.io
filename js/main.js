var app = null;

$(document).ready(function() {
    app = new App();
    app.init();
});

function App() {
    this.myId = "mewlips";
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
