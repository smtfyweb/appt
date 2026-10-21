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

            window.requestAnimationFrame(function () {
                wowElements.forEach(function (el) {
                    wowObserver.observe(el);
                });
            });
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

    // 6. Form US Localization & Universal English HTML5 Validation Tooltips
    function setupFormLocalization() {
        try {
            var today = new Date().toISOString().split('T')[0];
            var dateInputs = document.querySelectorAll('input[type="date"][name="date"]');
            dateInputs.forEach(function (inp) {
                inp.setAttribute('min', today);
            });

            function applyEnglishMessages(form) {
                var elements = form.querySelectorAll('input, select, textarea');
                elements.forEach(function (el) {
                    if (el.validity.valueMissing) {
                        if (el.tagName === 'SELECT') {
                            el.setCustomValidity('Please select an option from the list.');
                        } else if (el.type === 'email') {
                            el.setCustomValidity('Please enter your email address.');
                        } else if (el.type === 'tel') {
                            el.setCustomValidity('Please enter your phone number.');
                        } else if (el.type === 'date') {
                            el.setCustomValidity('Please choose a preferred date (MM/DD/YYYY).');
                        } else {
                            el.setCustomValidity('Please fill out this field.');
                        }
                    } else if (el.validity.typeMismatch && el.type === 'email') {
                        el.setCustomValidity('Please enter a valid email address.');
                    } else {
                        el.setCustomValidity('');
                    }
                });
            }

            var forms = document.querySelectorAll('form');
            forms.forEach(function (form) {
                var submitBtns = form.querySelectorAll('button[type="submit"], input[type="submit"]');
                submitBtns.forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        applyEnglishMessages(form);
                    });
                });

                form.addEventListener('submit', function () {
                    applyEnglishMessages(form);
                });

                var formControls = form.querySelectorAll('input, select, textarea');
                formControls.forEach(function (el) {
                    el.addEventListener('invalid', function () {
                        if (el.validity.valueMissing) {
                            if (el.tagName === 'SELECT') {
                                el.setCustomValidity('Please select an option from the list.');
                            } else if (el.type === 'email') {
                                el.setCustomValidity('Please enter your email address.');
                            } else if (el.type === 'tel') {
                                el.setCustomValidity('Please enter your phone number.');
                            } else if (el.type === 'date') {
                                el.setCustomValidity('Please choose a preferred date (MM/DD/YYYY).');
                            } else {
                                el.setCustomValidity('Please fill out this field.');
                            }
                        } else if (el.validity.typeMismatch && el.type === 'email') {
                            el.setCustomValidity('Please enter a valid email address.');
                        }
                    });

                    function clearValidity() {
                        el.setCustomValidity('');
                    }
                    el.addEventListener('input', clearValidity);
                    el.addEventListener('change', clearValidity);
                });
            });
        } catch (e) {
            // Silently fall back to standard browser validation if any error occurs
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupFormLocalization);
    } else {
        setupFormLocalization();
    }
})();

