// --- THREE.JS LOGIC ---
    function initThreeJS() {
    const container = document.getElementById('canvas-container');
    
    // --- 0. TOOLTIP ELEMENTS & DATA ---
    const tooltip = document.getElementById('skill-tooltip');
    const tooltipTitle = document.getElementById('tooltip-title');
    const tooltipDesc = document.getElementById('tooltip-desc');

    const skillData = {
        'python': { title: "Python", desc: "Expert in backend logic, automation scripts, and AI integration." },
        'django': { title: "Django", desc: "Building secure, scalable enterprise web applications." },
        'js': { title: "JavaScript", desc: "Interactive UIs, DOM manipulation, and Three.js 3D effects." },
        'html': { title: "HTML5", desc: "Semantic structure and modern accessibility standards." },
        'css': { title: "CSS3", desc: "Styling wizardry including Flexbox, Grid, and complex animations." },
        'sql': { title: "SQL", desc: "Complex database queries, optimization, and data modeling." },
        'docker': { title: "Docker", desc: "Containerizing applications for consistent deployment anywhere." },
        'git': { title: "Git", desc: "Version control workflows for professional team collaboration." },
        'git-hub': { title: "GitHub", desc: "Hosting code, managing CI/CD pipelines, and open source contribution." },
        'ms-excel': { title: "MS Excel", desc: "Advanced data analysis and visualization." },
        'odoo': { title: "Odoo", desc: "ERP development and module customization." },
        'postgres': { title: "PostgreSQL", desc: "Advanced database management and optimization." }
    };

    // --- SETUP ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5.5; 

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio); 
    container.appendChild(renderer.domElement);

    // --- GROUPING STRATEGY (FIXED FOR ROTATION) ---
    // 1. tiltGroup: Handles Mouse Parallax (Tilting)
    const tiltGroup = new THREE.Group();
    scene.add(tiltGroup);

    // 2. spinGroup: Handles Constant Rotation (Spinning) inside the Tilt
    const spinGroup = new THREE.Group();
    tiltGroup.add(spinGroup);

    // --- LAYER 1: THE TECH CORE ---
    const geometryCore = new THREE.IcosahedronGeometry(2.0, 1);
    const materialCore = new THREE.MeshBasicMaterial({ 
        color: 	0xFFFFFF, 
        wireframe: true,
        transparent: true, 
        opacity: 0.15     
    });
    const coreSphere = new THREE.Mesh(geometryCore, materialCore);
    spinGroup.add(coreSphere); // Add to SPIN group

    // --- LAYER 2: THE SKILLS SPHERE ---
    const skills = [
        'assets/skills/python.png', 'assets/skills/django.png',
        'assets/skills/js.png', 'assets/skills/html.png',
        'assets/skills/css.png', 'assets/skills/sql.png',
        'assets/skills/docker.png', 'assets/skills/git.png',
        'assets/skills/git-hub.png', 'assets/skills/ms-excel.png',
        'assets/skills/odoo.png', 'assets/skills/postgres.png' 
    ];

    const loader = new THREE.TextureLoader();
    const iconGroup = new THREE.Group(); 
    spinGroup.add(iconGroup); // Add to SPIN group

    for (let i = 0; i < skills.length; i++) {
        loader.load(skills[i], (texture) => {
            const material = new THREE.SpriteMaterial({ 
                map: texture, 
                transparent: true,
                depthTest: false 
            });
            const sprite = new THREE.Sprite(material);

            const filename = skills[i].split('/').pop().split('.')[0]; 
            sprite.name = filename; 

            // Fibonacci Sphere Algorithm
            const phi = Math.acos(-1 + (2 * i) / skills.length);
            const theta = Math.sqrt(skills.length * Math.PI) * phi;
            const radius = 2.8; 

            sprite.position.setFromSphericalCoords(radius, phi, theta);
            
            const baseScale = 0.6 + (Math.random() * 0.2); 
            sprite.scale.set(baseScale, baseScale, 1); 
            sprite.userData.origScale = baseScale;

            iconGroup.add(sprite);
        });
    }

    // --- LAYER 3: ATMOSPHERE PARTICLES ---
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 70; 
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10; 
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03, color: 0xffffff, transparent: true, opacity: 0.4
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    spinGroup.add(particlesMesh); // Add to SPIN group


    // --- MOUSE INTERACTION & RAYCASTING ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredSprite = null;

    window.addEventListener('mousemove', (event) => {
        const rect = container.getBoundingClientRect();

        // 1. Raycaster Math
        if (event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top && event.clientY <= rect.bottom) {
            
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            
            // --- FIX 1: SMART TOOLTIP POSITIONING ---
            const tooltipW = tooltip.offsetWidth || 280; // Estimate if not visible yet
            const tooltipH = tooltip.offsetHeight || 120;
            const gap = 20;

            let finalX = event.clientX + gap;
            let finalY = event.clientY + gap;

            // Check Right Edge
            if (finalX + tooltipW > window.innerWidth) {
                finalX = event.clientX - tooltipW - gap; // Flip to left
            }
            // Check Bottom Edge
            if (finalY + tooltipH > window.innerHeight) {
                finalY = event.clientY - tooltipH - gap; // Flip up
            }

            tooltip.style.transform = `translate(${finalX}px, ${finalY}px)`;

        } else {
            tooltip.style.opacity = 0;
        }

        // 2. Parallax Targets
        const targetX = (event.clientX - window.innerWidth / 2) * 0.001;
        const targetY = (event.clientY - window.innerHeight / 2) * 0.001;
        
        tiltGroup.userData.targetRotationY = targetX; 
        tiltGroup.userData.targetRotationX = targetY;
    });

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // --- FIX 2: CONSTANT ROTATION ---
        // We rotate the INNER group constantly
        spinGroup.rotation.y += 0.002; 

        // We tilt the OUTER group based on mouse
        const targetRotY = tiltGroup.userData.targetRotationY || 0;
        const targetRotX = tiltGroup.userData.targetRotationX || 0;
        
        tiltGroup.rotation.y += 0.05 * (targetRotY - tiltGroup.rotation.y);
        tiltGroup.rotation.x += 0.05 * (targetRotX - tiltGroup.rotation.x);

        // Breathing Core
        const scale = 1 + Math.sin(elapsedTime * 2) * 0.02;
        coreSphere.scale.set(scale, scale, scale);

        // Raycasting
        raycaster.setFromCamera(mouse, camera);
        
        // Note: We must intersect with children of iconGroup, which is inside spinGroup inside tiltGroup
        // The World Matrix updates automatically so this works fine.
        const intersects = raycaster.intersectObjects(iconGroup.children);

        if (intersects.length > 0) {
            const object = intersects[0].object;

            if (hoveredSprite !== object) {
                if (hoveredSprite) {
                    anime({
                        targets: hoveredSprite.scale,
                        x: hoveredSprite.userData.origScale,
                        y: hoveredSprite.userData.origScale,
                        duration: 300, easing: 'easeOutQuad'
                    });
                }

                hoveredSprite = object;

                anime({
                    targets: object.scale,
                    x: object.userData.origScale * 1.5,
                    y: object.userData.origScale * 1.5,
                    duration: 300, easing: 'spring(1, 80, 10, 0)'
                });

                const data = skillData[object.name];
                if (data) {
                    tooltipTitle.innerText = data.title;
                    tooltipDesc.innerText = data.desc;
                    tooltip.style.opacity = 1; 
                }
            }
        } else {
            if (hoveredSprite) {
                anime({
                    targets: hoveredSprite.scale,
                    x: hoveredSprite.userData.origScale,
                    y: hoveredSprite.userData.origScale,
                    duration: 300, easing: 'easeOutQuad'
                });
                hoveredSprite = null;
                tooltip.style.opacity = 0; 
            }
        }

        renderer.render(scene, camera);
    }
    animate();

    // --- RESIZE ---
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}