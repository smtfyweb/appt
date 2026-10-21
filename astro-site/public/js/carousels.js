(function ($) {
    "use strict";

    if ($('.header-carousel').length > 0) {
        $('.header-carousel').owlCarousel({
            autoplay: true,
            autoplayTimeout: 6000,
            autoplayHoverPause: true,
            smartSpeed: 1000,
            loop: true,
            nav: false,
            dots: true,
            items: 1,
            dotsData: true,
            autoHeight: false,
            responsive: {
                0: {
                    dots: false
                },
                769: {
                    dots: true
                }
            }
        });
    }

    if ($('.testimonial-carousel').length > 0) {
        $('.testimonial-carousel').owlCarousel({
            autoplay: true,
            autoplayTimeout: 7000,
            autoplayHoverPause: true,
            smartSpeed: 800,
            loop: true,
            nav: false,
            dots: true,
            items: 1,
            dotsData: true,
            autoHeight: false
        });
    }
})(jQuery);
