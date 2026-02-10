
    // --- MAIN ANIMATION SEQUENCE ---
    window.onload = () => {
        const introText = document.querySelector('.intro-text');
        const navLogo = document.querySelector('.nav-logo');
        const introBg = document.getElementById('intro');

        // Calculate positions
        const startRect = introText.getBoundingClientRect();
        const endRect = navLogo.getBoundingClientRect();
        const startFontSize = parseFloat(window.getComputedStyle(introText).fontSize);
        const endFontSize = parseFloat(window.getComputedStyle(navLogo).fontSize);
        const scaleRatio = endFontSize / startFontSize;
        const transX = endRect.left - startRect.left - ((startRect.width - (startRect.width * scaleRatio)) / 2);
        const transY = endRect.top - startRect.top - ((startRect.height - (startRect.height * scaleRatio)) / 2);

        // Intro Timeline
        const tl = anime.timeline({ easing: 'easeInOutQuint', duration: 1200 });

        tl.add({ duration: 500 }) // Wait
          .add({ // Morph
              targets: '.intro-text',
              translateX: transX, translateY: transY, scale: scaleRatio,
              duration: 1500,
          })
          .add({ // Fade BG
              targets: '#intro',
              backgroundColor: ['#0f0f0f', 'rgba(15,15,15,0)'],
              duration: 1000,
              offset: '-=1200'
          })
          .add({ // Swap and Reveal
              targets: '.intro-text', opacity: 0, duration: 10,
              complete: () => {
                  introBg.style.display = 'none';
                  navLogo.style.opacity = 1;
                  initThreeJS(); // Start 3D now
              }
          })
          .add({ // Reveal Content
              targets: ['.nav-links', '.hero-title', '.hero-sub'],
              opacity: [0, 1], translateY: [20, 0],
              delay: anime.stagger(200), duration: 800
          })
          .add({ // Reveal 3D Canvas
              targets: '#canvas-container',
              opacity: [0, 1], duration: 1500, offset: '-=1000'
          });

        // Scroll Reveal for Sections
        const cards = document.querySelectorAll('.card, .skill-group');
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    anime({
                        targets: entry.target,
                        opacity: [0, 1], translateY: [40, 0],
                        duration: 800, easing: 'easeOutCubic'
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        cards.forEach(card => observer.observe(card));

        // --- SOCIAL MEDIA REVEAL ANIMATION ---
        const socialContainer = document.querySelector('.social-container');
        const socialButtons = document.querySelectorAll('.social-btn');

        const socialObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    
                    // 1. Reveal the container
                    anime({
                        targets: '.social-container',
                        opacity: [0, 1],
                        translateY: [30, 0],
                        duration: 800,
                        easing: 'easeOutCubic'
                    });

                    // 2. Pop the buttons one by one (Staggered)
                    anime({
                        targets: '.social-btn',
                        scale: [0, 1], // Grow from nothing
                        translateY: [20, 0], // Slide up slightly
                        opacity: [0, 1],
                        delay: anime.stagger(150, {start: 300}), // Wait 300ms, then pop every 150ms
                        duration: 1200,
                        easing: 'easeOutElastic(1, .5)' // The "Bouncy" Professional feel
                    });

                    socialObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% visible

        // --- SKILL TAG TOOLTIP CONNECTION ---

        document.querySelectorAll('.skill-tags span').forEach(tag => {

        tag.addEventListener('mouseenter', e => {

            const key = tag.dataset.skill;
            const data = skillData[key];

            if (!data) return;

            tooltipTitle.innerText = data.title;
            tooltipDesc.innerText = data.desc;

            tooltip.classList.add('active');

        });

        tag.addEventListener('mousemove', e => {

            const gap = 20;

            let x = e.clientX + gap;
            let y = e.clientY + gap;

            tooltip.style.transform = `translate(${x}px, ${y}px)`;

        });

        tag.addEventListener('mouseleave', () => {
            tooltip.classList.remove('active');
        });

        });

        if(socialContainer) socialObserver.observe(socialContainer);
    };

    const footer = document.querySelector("footer");

    const footerObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
        if (entry.isIntersecting) {
            footer.classList.add("show");
        }
        });
    },
    { threshold: 0.3 }
    );

    footerObserver.observe(footer);
    