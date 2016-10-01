#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

const ARTICLES_PATH = '../articles';
const ARTICLES_JSON_PATH = '../articles.json';

fs.readdir(ARTICLES_PATH, function (err, files) {
    if (err) throw err;
    var i;
    var articles = [];
    for (i = 0; i < files.length; i++) {
        var fileName = files[i];
        if (path.extname(fileName) == '.md') {
            var article = {};
            var data = fs.readFileSync(path.join(ARTICLES_PATH, fileName));
            var firstLine = data.toString().split('\n')[0];
            if (firstLine.startsWith('[//]: # ({')) {
                var articleJson = firstLine.replace(/.*\({/, '{').replace(/}\).*/, '}');
                var articleInfo = JSON.parse(articleJson)
                article.path = path.join('/articles', fileName); 
                article.title = articleInfo.title;
                article.tags = articleInfo.tags;
                article.dateCreated = articleInfo.dateCreated;
                article.dateEdited = articleInfo.dateEdited;
                articles.push(article);
            }
        }
    }
    articles.sort(function (a, b) {
        return a.dateCreated - b.dateCreated;
    });
    fs.writeFile(ARTICLES_JSON_PATH, JSON.stringify(articles, null, 4), (err) => {
        if (err) throw err;
        console.log(articles);
    });
    
});
