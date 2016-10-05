var app = null;

$(document).ready(function() {
    app = new App();
});

function App() {
    this.origUrl = "https://mewlips.github.io/"
    this.gitHub = new GitHub();
    this.me = this.gitHub.getUser("mewlips");
    this.repos = null;
    this.articlesJsonPath = "/articles.json";
    this.articles = null;
    this.author = 'Mewlips';

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
            var url = new URL(document.URL);
            var ul = $('<ul></ul>');
            $('#sidenav-articles').append(ul);
            for (var i = 0; i < articles.length; i++) {
                var article = articles[i];
                article.id = self.getIdFromTitle(article.title)

                var a = $('<a></a>')
                    .attr('href', '#' + article.id)
                    .attr('onclick', 'app.loadArticle(this.article);')
                    .text(article.title);
                a[0].article = article;
                var date = $('<small class="pull-right"><small>' +
                             new Date(article.dateCreated).toLocaleDateString() +
                             '</small></small>');
                ul.prepend($('<li></li>').append(a, ' ', date));
                if (url.hash == '#' + article.id) {
                    self.loadArticle(article);
                } else if (url.hash == '' || url.hash == '#') {
                    if (i == articles.length - 1) { // latest article
                        self.loadArticle(article);
                    }
                }
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
            article.target = $('<article></article>')
                                .attr('id', article.id)
                                .text('loading...');

            var articleContent = $('#article-content');
            articleContent.empty();
            articleContent.append(article.target);

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

    $('#article-content').prepend(article.target);
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

    var editButton = $('<button type="button"></button>')
        .addClass('btn btn-xs btn-default pull-right')
        .append('<span class="glyphicon glyphicon-edit"></span>');

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

    var markdownTarget = $('<div class="row markdown-edit"></div>');
    markdownTarget.hide();

    var commentsTarget = $('<div id="disqus_thread"></div>');
    commentsTarget.append($('<script></script>').append(
            'var disqus_config = function () {\n' +
            '    this.page.url = "https://mewlips.github.com#!' + article.id + '";\n' +
            '    this.page.identifier = "' + article.dateCreated + '";\n' +
            '    this.page.title = "' + article.title + '";\n' +
            '};\n' +
            'if (window.DISQUS !== undefined) {\n' +
            '    DISQUS.reset({\n' +
            '        reload: true,\n' +
            '        config: disqus_config\n' +
            '    });\n' +
            '} else {\n' +
            '    (function() {\n' +
            '        var d = document, s = d.createElement("script");\n' +
            '        s.src = "//mewlips.disqus.com/embed.js";\n' +
            '        s.setAttribute("data-timestamp", +new Date());\n' +
            '        (d.head || d.body).appendChild(s);\n' +
            '    })();\n' +
            '}'
        )
    );
    commentsTarget.append($('<noscript>Please enable JavaScript to view the ' +
                            '<a href="https://disqus.com/?ref_noscript">' +
                            'comments powered by Disqus.</a></noscript>'));

    article.target.append(editButton, header, tags,
                          htmlTarget, markdownTarget);
    if (article.dateCreated != null) {
        article.target.append(commentsTarget);
    }

    editButton.click(function () {
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
            markdownTarget.empty();
            markdownTarget.hide();
            article.markdownContent = markdownTextArea.val();
            htmlTarget.css('height', 'auto');
        });

        markdownPane.append(closeButton, saveButton, 'Markdown Editor<br>', markdownTextArea);

        markdownTarget.empty();
        markdownTarget.append(markdownPane);
        markdownTarget.show();

        article.editor = new Editor(markdownTextArea, htmlTarget);
        $(this).hide();
    });
    if (article.dateCreated == null) {
        editButton.click();
    } else {

    }

    return article;
}
