$(document).ready(function () {
    $(window).on("scroll", display);

    function display() {
        var shows = $(".animate");
        for(var i = 0; i < shows.length; i++) {
            var windowHeight = window.innerHeight;
            var displayTop = shows[i].getBoundingClientRect().top;
            var displayPoint = 150;

            if(displayTop < windowHeight - displayPoint) {
                $(shows[i]).addClass('active');
            } 
            else {
                $(shows[i]).removeClass('active');
            }
        }
    }

    var paragraphs = $('.trim');
    var text = paragraphs.text();
    var trimmedText = text.replace(/\s+/g, " ").trim();    
    paragraphs.text(trimmedText);
})