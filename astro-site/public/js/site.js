(function () {
    "use strict";

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Dismiss any residual spinner immediately without transition flashes
    var spinnerEl = document.getElementById('spinner');
    if (spinnerEl) {
        spinnerEl.remove();
    }

    // 2. Smooth reveal via IntersectionObserver (Zero layout shifts or initial hiding jumps)
    var wowElements = document.querySelectorAll('.wow');
    if (wowElements.length > 0) {
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            wowElements.forEach(function (el) {
                el.classList.add('animated');
                el.style.visibility = 'visible';
            });
        } else {
            var wowObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var el = entry.target;
                        var delay = el.getAttribute('data-wow-delay');
                        if (delay) {
                            el.style.animationDelay = delay;
                            el.style.webkitAnimationDelay = delay;
                        }
                        var anim = el.getAttribute('data-wow-animation');
                        if (anim) {
                            el.classList.add(anim);
                        }
                        el.classList.add('animated');
                        el.style.visibility = 'visible';
                        observer.unobserve(el);
                    }
                });
            }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

            var isDesktop = window.innerWidth >= 992;
            if (!isDesktop) {
                // Versão 1 exata que garantiu Mobile 96
                var vh = window.innerHeight || document.documentElement.clientHeight;
                wowElements.forEach(function (el) {
                    var rect = el.getBoundingClientRect();
                    if (rect.top < vh && rect.bottom > 0) {
                        el.classList.add('animated');
                        el.style.visibility = 'visible';
                    } else {
                        el.style.visibility = 'hidden';
                        wowObserver.observe(el);
                    }
                });
            } else {
                // Otimização de Desktop que garantiu Computador 96 (TBT 40ms)
                wowElements.forEach(function (el) {
                    wowObserver.observe(el);
                });
            }
        }
    }

    // 3. Waypoints + CounterUp replacement
    var counters = document.querySelectorAll('[data-toggle="counter-up"]');
    if (counters.length > 0) {
        function runCounter(el) {
            var rawText = el.textContent.trim();
            var target = parseFloat(rawText.replace(/,/g, ''));
            if (isNaN(target)) return;

            if (prefersReducedMotion) {
                el.textContent = rawText;
                return;
            }

            var duration = 2000;
            var startTime = null;
            var hasComma = rawText.indexOf(',') !== -1;

            function frame(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min((timestamp - startTime) / duration, 1);
                var ease = progress * (2 - progress);
                var current = Math.floor(ease * target);
                el.textContent = hasComma ? current.toLocaleString() : current;
                if (progress < 1) {
                    window.requestAnimationFrame(frame);
                } else {
                    el.textContent = rawText;
                }
            }

            el.textContent = '0';
            window.requestAnimationFrame(frame);
        }

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            counters.forEach(runCounter);
        } else {
            var counterObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        runCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            counters.forEach(function (counter) {
                counterObserver.observe(counter);
            });
        }
    }

    // 4. Sticky Navbar & Back-to-Top Button
    var sticky = document.querySelector('.sticky-top');
    var backToTop = document.querySelector('.back-to-top');
    var ticking = false;

    function updateScrollState() {
        var isScrolled = window.scrollY > 50;
        if (sticky) {
            sticky.classList.toggle('shadow-sm', isScrolled);
        }
        if (backToTop) {
            backToTop.classList.toggle('show', window.scrollY > 300);
        }
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(updateScrollState);
            ticking = true;
        }
    }, { passive: true });

    updateScrollState();

    if (backToTop) {
        backToTop.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        });
    }

    // 5. Progress Bars with IntersectionObserver
    var progressBars = document.querySelectorAll('.progress-bar');
    if (progressBars.length > 0) {
        function activateProgressBar(bar) {
            var percent = bar.getAttribute('data-percent');
            if (percent) {
                bar.style.width = '0%';
                window.requestAnimationFrame(function () {
                    setTimeout(function () {
                        if (!prefersReducedMotion) {
                            bar.style.transition = 'width 1.3s cubic-bezier(0.22, 1, 0.36, 1)';
                        } else {
                            bar.style.transition = 'none';
                        }
                        bar.style.width = percent + '%';
                    }, 80);
                });
            }
        }

        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            progressBars.forEach(activateProgressBar);
        } else {
            var progressObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        activateProgressBar(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15 });

            progressBars.forEach(function (bar) {
                bar.style.width = '0%';
                progressObserver.observe(bar);
            });
        }
    }
})();
