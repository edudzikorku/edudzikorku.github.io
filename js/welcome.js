$(document).ready(function () {
    // Define an array of welcome messages in different languages
    var msgs = [
        "Welcome!",
        "Bienvenue!",
        "Willkommen!",
        "Woezɔ!",
        "Akwaaba!"
    ];

    var currentMsgIndex = 0;

    // Create a function to display the current message 
    // and update the index for the next message
    function showMsg() {
        // Get the element to display the message
        var msgElement = $("#welcomeMessage");
        // Set the text to the current message
        msgElement.innerText = msgs[currentMsgIndex];
        // Increment the index for the next message,or return to the beginning if at the end
        currentMsgIndex = (currentMsgIndex + 1) % msgs.length;
    }
    // Call the showMsg function every 3 seconds to create a slideshow effect
    setInterval(showMsg, 6000)

    // document.querySelector('.spinner-container').style.display = 'flex';

    // window.addEventListener('load', function() {
    //     document.querySelector('.spinner-container').style.display = 'none';
    // })

    $(".spinner-container").css({
        display: 'flex'
    });

    $(document).ready(function() {
        $(".spinner-container").css({
        display: 'none'
        });
    });

    function checkWindowWidth() {
        var windowWidth = window.innerWidth;
        var navBarCollapse = $("#navbarNav");
        if (windowWidth >= 992) {
            navBarCollapse.addClass("navbar-expanded");
        } else {
            navBarCollapse.removeClass("navbar-expanded");
        }
    }

    $(document).ready(function () {
        checkWindowWidth();
    });

    $(window).resize(function () {
        checkWindowWidth();
    });

    // $(document).ready(function () {$(".navbar-toggler").on("click", function() {
    //     if ($(this).attr('aria-expanded') === 'true') {
    //         $("#content-container").addClass("navbar-expanded");
    //     } else {
    //         $("#content-container").removeClass("navbar-expanded");
    //     }
    // });
    // });
    // const navbar = $(".navbar-collapse.collapse");
    // const nextItem = navbar.nextElementSibling;
    // function adjustContentPadding() {
    //     const navbarHeight = navbar.clientHeight;
    //     nextItem.style.paddingTop = navbarHeight + "px";
    // }
    // $(window).on("resize", adjustContentPadding());
    // $(document).on("DOMContentLoaded", adjustContentPadding());

    // const navbarToggler = $(".navbar-toggler.collapsed");
    // navbarToggler.on("click", function () {
    //     if (navbar.classList.contains("show")) {
    //         adjustContentPadding();
    //     } else {
    //         nextItem.style.paddingTop = '57px';
    //     }
    // });
})
