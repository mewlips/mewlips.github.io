function Editor(input, preview) {
    this.update = function () {
        preview.html(markdown.toHTML(input.val()));
    };
    input[0].editor = this;
    this.update();
}
