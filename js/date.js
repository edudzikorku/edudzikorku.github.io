$(document).ready(function () {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var html = "&copy; "+currentYear+ " Akpakli Edudzi.";
    $("#date").html(html);
})