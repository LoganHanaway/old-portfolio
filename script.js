// $(document).ready(function () {
// Handler for .ready() called.
// });

/*
$(document).ready(function () {
    alert("Welcome");
});

making sure jquery was correctly loaded
*/


// $(document).ready(function () {
//     $("#wrapper h1").css({ color: "#aa0000" });
//     $("header nav a:odd").css({ hover: "color: #aa0000;" });
//     $("header nav li:even").css({ hover: "color: #aa0000;" });
// });

/*
$(document).ready(function () {
    $("header nav li:odd").hover(function () {
        $("header nav li:odd").css("color", "#aa0000;");
    });
});


$(function () {
    $("header nav ul li:odd"), mouseover(function () {
        $("header nav ul li:odd").css("color", "#aa0000");
    })
});

 Have tried multiple methods to get hover to work on my nav, it
 has to be an issue with my selector, but I can't seem to get it 
 right. None of these work for my hover effect.*/


/* photos page image hover affect function code */
/* moved to it's own file for even better organization */





/* For nav bar animation */

$(document).ready(function () {
    $('.menu-toggler').on('click', function () {
        $(this).toggleClass('open');
        $('nav').toggleClass('open');
    });
    $('nav .nav-link').on('click', function () {
        $('.menu-toggler').removeClass('open');
        $('nav').removeClass('open');
    });
});





/* for photo page effects */

$(function () {
    $('body').append(`
        <div class="galleryShadow"></div>
        <div class="galleryModal">
          <i class="galleryIcon gIquit fas fa-times-circle"></i>
          <i class="galleryIcon gIleft fas fa-chevron-left"></i>
          <i class="galleryIcon gIright fas fa-chevron-right"></i>
          <div class="galleryContainer">
              <img src="">
          </div>  
        </div>
        `)
    $('.gIquit').click(function () {
        $('.galleryModal').css({ 'transform': 'scale(0)' })
        $('.galleryShadow').fadeOut()
    })
    $('.gallery').on('click', '.galleryItem', function () {
        galleryNavigate($(this), 'opened')
        $('.galleryModal').css({ 'transform': 'scale(1)' })
        $('.galleryShadow').fadeIn()
    })
    let galleryNav
    let galleryNew
    let galleryNewImg
    let galleryNewText
    $('.gIleft').click(function () {
        galleryNew = $(galleryNav).prev()
        galleryNavigate(galleryNew, 'last')
    })
    $('.gIright').click(function () {
        galleryNew = $(galleryNav).next()
        galleryNavigate(galleryNew, 'first')
    })
    function galleryNavigate(gData, direction) {
        galleryNewImg = gData.children('img').attr('src')
        if (typeof galleryNewImg !== "undefined") {
            galleryNav = gData
            $('.galleryModal img').attr('src', galleryNewImg)
        }
        else {
            gData = $('.galleryItem:' + direction)
            galleryNav = gData
            galleryNewImg = gData.children('img').attr('src')
            $('.galleryModal img').attr('src', galleryNewImg)
        }
        galleryNewText = gData.children('img').attr('data-text')
        if (typeof galleryNewText !== "undefined") {
            $('.galleryModal .galleryContainer .galleryText').remove()
            $('.galleryModal .galleryContainer').append('<div class="galleryText">' + galleryNewText + '</div>')
        }
        else {
            $('.galleryModal .galleryContainer .galleryText').remove()
        }
    }
})


// progress bar javascript

// var i = 0;
// function move() {
//     if (i == 0) {
//         i = 1;
//         var elem = document.getElementById("myBar");
//         var width = 1;
//         var id = setInterval(frame, 10);
//         function frame() {
//             if (width >= 100) {
//                 clearInterval(id);
//                 i = 0;
//             } else {
//                 width++;
//                 elem.style.width = width + "%";
//             }
//         }
//     }
// }


// back to top button 
$(document).ready(function () {

    $(window).scroll(function () {
        if ($(this).scrollTop() > 100) {
            $('.scrollToTop').fadeIn(1000);
            $('#aboutme').fadeIn();
            $('#portfolio').fadeIn();
            $('.photography').fadeIn(2000);
        } else {
            $('.scrollToTop').fadeOut();
        }
    });

    $('.scrollToTop').click(function () {
        $('html, body').animate({ scrollTop: 0 }, 800);
        return false;
    });

});

// fade animations for content divs //

$(document).ready(function () {
    $('.fadeonload').each(function (i) {
        $(this).animate({ 'opacity': '1', 'margin-left': '0px' }, 2500);
    });
});


$(document).ready(function () {
    $(window).scroll(function () {
        $('.fadein').each(function (i) {

            var bottom_of_element = $(this).offset().top + $(this).outerHeight();
            var bottom_of_window = $(window).scrollTop() + $(window).height() + $(window).height();

            if (bottom_of_window > bottom_of_element) {
                $(this).animate({ 'opacity': '1' }, 2000);
            }

        });
    });
});

$(document).ready(function () {
    $(window).scroll(function () {
        $('.fadein2').each(function (i) {

            var bottom_of_element = $(this).offset().top + $(this).outerHeight();
            var bottom_of_window = $(window).scrollTop() + $(window).height() + $(window).height() + $(window).height();

            if (bottom_of_window > bottom_of_element) {
                $(this).animate({ 'opacity': '1' }, 2000);
            }

        });
    });
});







