function init() {
    $.ajax({
        url: "/test.md",
        dataType: "text",
        success: function (response) {
            var htmlContent = markdown.toHTML(response);
            $('#mdToHtml').html(htmlContent);
        }
    });
}
