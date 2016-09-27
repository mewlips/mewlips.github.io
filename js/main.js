var app = null;

$(document).ready(function() {
    app = new App();
});

function App() {
    this.myId = "mewlips";
    this.origUrl = "https://mewlips.github.io/"
    this.gitHub = new GitHub();
    this.me = this.gitHub.getUser(this.myId);
    this.repos = null;
    this.articlesJsonPath = "/articles.json";
    this.articles = null;
    this.author = 'mewlips';

    this.init();
}

App.prototype.init = function () {
    var self = this;
    this.loadArticlesInfo();

    this.loadMyProjects($("#projects"));
    this.transformMarkupToHtml();
}

App.prototype.getIdFromTitle = function (title) {
    if (title == null) {
        title = 'no-title';
    }
    return 'article-' + title.replace(/ /g, '-');
}

App.prototype.loadArticlesInfo = function () {
    var self = this;

    $.ajax({
        url: self.articlesJsonPath,
        dataType: "json",
        success: function (articles) {
            self.articles = articles;
            var ul = $('<ul></ul>');
            $('#sidenav-articles').append(ul);
            for (var i = 0; i < articles.length; i++) {
                var article = articles[i];
                article.id = self.getIdFromTitle(article.title)
                article.target = $('<article></article>')
                                    .attr('id', article.id)
                                    .text('loading...');

                $('#articles').prepend(article.target);
                var a = $('<a></a>')
                    .attr('href', '#' + article.id)
                    .text(article.title);
                var date = $('<small class="pull-right"><small>' +
                             new Date(article.dateCreated).toLocaleDateString() +
                             '</small></small>');
                ul.prepend($('<li></li>').append(a, ' ', date));
                self.loadArticle(article);
            }
        }
    });
}

App.prototype.loadArticle = function (article) {
    var self = this;
    $.ajax({
        url: article.path,
        dataType: "text",
        success: function (markdownContent) {
            var loading = $('#articles-loading');
            if (loading != null) {
                loading.remove();
            }
            article.markdownContent = markdownContent;
            article.target.empty();
            self.makeArticle(article);
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
                issuesPageLink.addClass('label label-info pull-right');
                small.append(' ', issuesPageLink);
                smallAppended = true;
            }
            if (repo.has_pages && repo.name != "mewlips.github.io") {
                var projectPageLink = $('<a>Homepage</a>');
                projectPageLink.attr('href', self.origUrl + repo.name);
                projectPageLink.addClass('label label-primary pull-right');
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

App.prototype.newArticle = function () {
    var article = {};
    article.id = 'article-no-title';
    article.tags = [];
    article.target = $('<article></article>');
    article.markdownContent = '[//]: # ({"title": "TITLE", "tags": []})\n';

    this.parseArticleInfoComment(article.markdownContent);

    $('#articles').prepend(article.target);
    this.makeArticle(article);
}

App.prototype.parseArticleInfoComment = function (markdownContent) {
    var comment = markdownContent.split('\n')[0];
    var jsonString = comment.replace(/.*\({/, '{').replace(/}\).*/, '}');
    var article = JSON.parse(jsonString);
    if (article === undefined) {
        return undefined;
    }
    article.id = this.getIdFromTitle(article.title);
    return article;
}

App.prototype.mergeArticle = function (toArticle, fromArticle) {
    if (typeof toArticle === 'object' && typeof fromArticle === 'object') {
        for (var attr in fromArticle) {
            toArticle[attr] = fromArticle[attr];
        }
    } else {
        console.log("failed to merge article objects");
    }
    return toArticle;
}

App.prototype.createArticleInfoComment = function (article) {
    var names = ['title', 'tags', 'dateCreated', 'dateEdited'];
    var obj = {};
    for (var i = 0; i < names.length; i++) {
        obj[names[i]] = article[names[i]];
    }
    if (article.dateCreated == null) {
        obj.dateCreated = new Date().getTime();
        obj.dateEdited = null;
    } else {
        obj.dateEdited = new Date().getTime();
    }
    return '[//]: # (' + JSON.stringify(obj) + ')\n';
}

App.prototype.makeArticle = function (article) {
    var self = this;

    var articleInfo = this.parseArticleInfoComment(article.markdownContent);
    if (articleInfo != null) {
        this.mergeArticle(article, articleInfo);
    }

    var tags = '';
    if (article.tags != null && article.tags.length > 0) {
        var tags = $('<h5></h5>');
        for (var i = 0; i < article.tags.length; i++) {
            var tag = $('<span class="label label-primary">' + article.tags[i] + '</span>')
            tags.append(tag, '\n');
        }
    }

    var editButton = $('<button type="button" class="btn btn-xs btn-default pull-right">Edit</button>');
    var header = $('<h5></h5>')
                    .append('<span class="glyphicon glyphicon-time"></span>')
                    .append(' Post by ' + this.author + '.');

    var date = $('<small></small>');
    header.append(date);
    if (article.dateCreated != null) {
        date.append(' Created: ' + new Date(article.dateCreated).toLocaleString());
    }
    if (article.dateEdited != null) {
        date.append(' / Edited: ' + new Date(article.dateEdited).toLocaleString());
    }

    var htmlTarget = $('<div class="html-preview"></div>')
                        .html(markdown.toHTML(article.markdownContent));
    article.target.append('<hr>', editButton, header, tags, htmlTarget);

    editButton.click(function () {
        var row = $('<div class="row markdown-edit"></div>');
        var markdownPane = $('<div class="col-sm-12"></div>');
        var markdownTextArea = $('<textarea></textarea>')
                                    .attr('class', 'markdown-input')
                                    .attr('rows', '10')
                                    .attr('oninput', 'this.editor.update()')
                                    .text(article.markdownContent);
        var saveButton = $('<button type="button"></button>');
        saveButton.addClass('btn btn-xs btn-default pull-right');
        saveButton.html('<span class="glyphicon glyphicon-download-alt"></span> Save');
        saveButton.click(function () {
            var text = markdownTextArea.val();
            var newArticleInfo = self.parseArticleInfoComment(text);
            self.mergeArticle(article, newArticleInfo);
            text = self.createArticleInfoComment(article) +
                   text.substring(text.indexOf('\n') + 1);
            $('<a />', {
                "download": article.id + '.md',
                "href": "data:text/plane," + encodeURIComponent(text)
            }).appendTo("body").click(function() {
                $(this).remove()
            })[0].click();
        });

        var closeButton = $('<button type="button"></button>');
        closeButton.addClass('btn btn-xs btn-default pull-right');
        closeButton.html('<span class="glyphicon glyphicon-remove"></span> Close');
        closeButton.click(function() {
            editButton.show();
            article.markdownEditor.remove();
            article.markdownContent = markdownTextArea.val();
            htmlTarget.css('height', 'auto');
        });

        markdownPane.append(closeButton, saveButton, 'Markdown Editor<br>', markdownTextArea);

        article.target.append(row.append(markdownPane));
        article.markdownEditor = row;

        article.editor = new Editor(markdownTextArea, htmlTarget);
        $(this).hide();
    });
    if (article.dateCreated == null) {
        editButton.click();
    }

    return article;
}
