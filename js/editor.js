function Editor(input, preview) {
    var self = this;
    this.update = function () {
        preview.html(markdown.toHTML(input.val()));
    };
    this.matchHeight = function () {
        preview.height(input.height());
    };
    input.mouseup(function () { // for resize
        self.matchHeight();
    });
    this.matchHeight();
    this.update();
    input[0].editor = this;
}
