(function ($) {
    "use strict";

    function initCarousels() {
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
                autoHeight: false
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            window.requestAnimationFrame(initCarousels);
        });
    } else {
        window.requestAnimationFrame(initCarousels);
    }
})(jQuery);
