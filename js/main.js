(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar & Back to top button (single passive listener with requestAnimationFrame)
    var $sticky = $('.sticky-top');
    var $backToTop = $('.back-to-top');
    var isScrolled = null;
    var ticking = false;

    function updateScrollState() {
        var currentScrolled = window.scrollY > 300;
        if (currentScrolled !== isScrolled) {
            isScrolled = currentScrolled;
            if (isScrolled) {
                $sticky.addClass('shadow-sm').css('top', '0px');
                $backToTop.addClass('show');
            } else {
                $sticky.removeClass('shadow-sm').css('top', '-100px');
                $backToTop.removeClass('show');
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollState);
            ticking = true;
        }
    }, { passive: true });

    // Initial check
    updateScrollState();

    // Back to top click
    $backToTop.on('click', function (e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Date and time picker
    $('.date').datetimepicker({
        format: 'L'
    });
    $('.time').datetimepicker({
        format: 'LT'
    });


    // Header carousel
    $(".header-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        dotsData: true,
    });


    // Testimonials carousel
    $('.testimonial-carousel').owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        loop: true,
        nav: false,
        dots: true,
        items: 1,
        dotsData: true,
    });

    
})(jQuery);

