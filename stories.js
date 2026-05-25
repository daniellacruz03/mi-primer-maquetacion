document.addEventListener("DOMContentLoaded", () => {
    const videoFeed = document.getElementById("bh-video-feed-scroll");
    if (!videoFeed) return;

    // Limpiar contenido antes de renderizar
    videoFeed.innerHTML = '';

    // Array con las rutas reales de videos .mp4
    const videoSources = [
        'assets/videos/bowlbhvideo.mp4',
        'assets/videos/kidshousevideobh.mp4',
        'assets/videos/video1bh.mp4',
        'assets/videos/video2bh.mp4',
        'assets/videos/video3bh.mp4',
        'assets/videos/video4bh.mp4',
        'assets/videos/video5bh.mp4',
        'assets/videos/video6bh.mp4',
        'assets/videos/video7bh.mp4'
    ];

    // Mezcla aleatoria Fisher-Yates
    for (let i = videoSources.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [videoSources[i], videoSources[j]] = [videoSources[j], videoSources[i]];
    }

    // Almacenar referencias a videos activos
    const activeVideos = [];

    // Renderizado optimizado con lazy loading y preload
    videoSources.forEach((src, index) => {
        const card = document.createElement("div");
        card.className = "video-story-card";
        
        const video = document.createElement("video");
        video.src = src;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsinline = true;
        // Optimización: preload="metadata" para los primeros 3, "none" para el resto
        video.preload = index < 3 ? "metadata" : "none";
        video.loading = "lazy";
        
        // Optimización: usar requestAnimationFrame para carga diferida
        requestAnimationFrame(() => {
            if (index < 3) {
                video.load();
            }
        });
        
        // Botón de mute para tarjeta pequeña
        const muteBtn = document.createElement("button");
        muteBtn.className = "card-mute-btn";
        muteBtn.innerHTML = "🔇";
        muteBtn.style.cssText = "position: absolute; bottom: 8px; right: 8px; background: linear-gradient(180deg, #8b0000 0%, #ff0000 100%); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; z-index: 10; font-size: 14px; display: flex; align-items: center; justify-content: center; will-change: transform;";
        
        let isMuted = true;
        muteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            
            // Silenciar todos los demás videos
            activeVideos.forEach(v => {
                if (v !== video && !v.muted) {
                    v.muted = true;
                    const otherBtn = v.parentElement.querySelector('.card-mute-btn');
                    if (otherBtn) otherBtn.innerHTML = "🔇";
                }
            });
            
            // Alternar volumen del video actual
            isMuted = !isMuted;
            video.muted = isMuted;
            muteBtn.innerHTML = isMuted ? "🔇" : "🔊";
        });
        
        // Click en tarjeta para abrir modal
        card.addEventListener("click", () => abrirVideoModal(src));
        
        card.appendChild(video);
        card.appendChild(muteBtn);
        videoFeed.appendChild(card);
        
        // Agregar video a la lista de activos
        activeVideos.push(video);
    });

    // Optimización: Intersection Observer para cargar videos cuando sean visibles
    const observerOptions = {
        root: videoFeed,
        rootMargin: '100px',
        threshold: 0.1
    };

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            if (video) {
                if (entry.isIntersecting) {
                    video.preload = "metadata";
                    video.load();
                } else {
                    video.preload = "none";
                }
            }
        });
    }, observerOptions);

    // Observar todas las tarjetas de video
    document.querySelectorAll('.video-story-card').forEach(card => {
        videoObserver.observe(card);
    });

    // Lógica de imágenes en la raíz para Promonuggets (1, 2, 3)
    const promoImages = ['promonuggets1.webp', 'promonuggets2.webp', 'promonuggets3.webp'];
    
    // Buscar tarjeta de promoción en el feed
    const promoStoryCard = document.querySelector(".video-story-card[data-promo='true']");
    if (!promoStoryCard) {
        // Si no existe, crearla
        const promoCard = document.createElement("div");
        promoCard.className = "video-story-card";
        promoCard.dataset.promo = "true";
        promoCard.innerHTML = `<img src="${promoImages[0]}" alt="Promo" style="width:100%; height:100%; object-fit:cover;">`;
        promoCard.addEventListener("click", () => abrirCarruselPromos(promoImages));
        videoFeed.appendChild(promoCard);
    } else {
        promoStoryCard.addEventListener("click", () => abrirCarruselPromos(promoImages));
    }
});

// Función para abrir carrusel de promociones
function abrirCarruselPromos(images) {
    const modal = document.getElementById("modal-story");
    if (!modal) return;
    
    let currentIndex = 0;
    const container = modal.querySelector(".story-full-container");
    if (!container) return;
    
    // Limpiar modal
    container.innerHTML = '';
    
    // Crear barras de progreso
    const progressBars = document.createElement("div");
    progressBars.className = "promo-progress-bars";
    images.forEach((_, idx) => {
        const bar = document.createElement("div");
        bar.className = "promo-progress-bar";
        if (idx === 0) bar.classList.add("active");
        progressBars.appendChild(bar);
    });
    container.appendChild(progressBars);
    
    // Crear imagen
    const img = document.createElement("img");
    img.src = images[0];
    img.alt = "Promo";
    img.className = "promo-carousel-image";
    img.style.cssText = "width: 100%; height: 100%; object-fit: contain;";
    container.appendChild(img);
    
    // Crear botón de cerrar
    const closeBtn = document.createElement("button");
    closeBtn.className = "story-close-btn";
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = "position: absolute; top: 20px; right: 20px; z-index: 20; background: rgba(0,0,0,0.5); border: none; color: white; width: 44px; height: 44px; border-radius: 50%; font-size: 2rem; cursor: pointer;";
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    });
    container.appendChild(closeBtn);
    
    // Mostrar modal
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    
    // Navegación automática
    const interval = setInterval(() => {
        currentIndex++;
        if (currentIndex >= images.length) {
            clearInterval(interval);
            modal.classList.remove("active");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
            return;
        }
        
        img.src = images[currentIndex];
        
        // Actualizar barras de progreso
        const bars = document.querySelectorAll(".promo-progress-bar");
        bars.forEach((bar, idx) => {
            bar.classList.remove("active", "completed");
            if (idx < currentIndex) {
                bar.classList.add("completed");
            } else if (idx === currentIndex) {
                bar.classList.add("active");
            }
        });
    }, 3000);
    
    // Cerrar al hacer clic fuera
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            clearInterval(interval);
            modal.classList.remove("active");
            modal.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";
        }
    });
}

// Función para abrir modal de video
function abrirVideoModal(videoSrc) {
    const modal = document.getElementById("modal-story");
    if (!modal) return;
    
    const container = modal.querySelector(".story-full-container");
    if (!container) return;
    
    // Limpiar modal
    container.innerHTML = '';
    
    // Crear video con pantalla completa
    const video = document.createElement("video");
    video.id = "story-player";
    video.src = videoSrc;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsinline = true;
    video.style.cssText = "width: 100%; height: 100%; object-fit: contain; background: #000;";
    
    // Crear botón de cerrar (esquina superior derecha)
    const closeBtn = document.createElement("button");
    closeBtn.id = "story-btn-close";
    closeBtn.className = "story-close-btn";
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = "position: absolute; top: 20px; right: 20px; z-index: 30; background: linear-gradient(180deg, #8b0000 0%, #ff0000 100%); border: 2px solid rgba(255, 255, 255, 0.3); color: white; width: 50px; height: 50px; border-radius: 50%; font-size: 2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(230, 0, 0, 0.4); transition: transform 0.3s ease, box-shadow 0.3s ease;";
    
    closeBtn.addEventListener("mouseenter", () => {
        closeBtn.style.transform = "scale(1.1)";
        closeBtn.style.boxShadow = "0 6px 20px rgba(230, 0, 0, 0.6)";
    });
    
    closeBtn.addEventListener("mouseleave", () => {
        closeBtn.style.transform = "scale(1)";
        closeBtn.style.boxShadow = "0 4px 15px rgba(230, 0, 0, 0.4)";
    });
    
    closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        cerrarVideoModal();
    });
    
    // Crear botón de mute (esquina superior izquierda)
    const muteBtn = document.createElement("button");
    muteBtn.id = "story-btn-mute";
    muteBtn.className = "story-mute-btn";
    muteBtn.setAttribute("aria-label", "Silenciar");
    muteBtn.innerHTML = `
        <span class="icon-muted">🔇</span>
        <span class="icon-unmuted" hidden>🔊</span>
    `;
    muteBtn.style.cssText = "position: absolute; top: 20px; left: 20px; z-index: 30; background: linear-gradient(180deg, #8b0000 0%, #ff0000 100%); border: 2px solid rgba(255, 255, 255, 0.3); color: white; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; box-shadow: 0 4px 15px rgba(230, 0, 0, 0.4); transition: transform 0.3s ease, box-shadow 0.3s ease;";
    
    muteBtn.addEventListener("mouseenter", () => {
        muteBtn.style.transform = "scale(1.1)";
        muteBtn.style.boxShadow = "0 6px 20px rgba(230, 0, 0, 0.6)";
    });
    
    muteBtn.addEventListener("mouseleave", () => {
        muteBtn.style.transform = "scale(1)";
        muteBtn.style.boxShadow = "0 4px 15px rgba(230, 0, 0, 0.4)";
    });
    
    muteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        video.muted = !video.muted;
        const iconMuted = muteBtn.querySelector('.icon-muted');
        const iconUnmuted = muteBtn.querySelector('.icon-unmuted');
        if (iconMuted) iconMuted.hidden = !video.muted;
        if (iconUnmuted) iconUnmuted.hidden = video.muted;
        if (!video.muted && video.paused) video.play().catch(() => {});
    });
    
    // Agregar elementos al contenedor
    container.appendChild(video);
    container.appendChild(closeBtn);
    container.appendChild(muteBtn);
    
    // Mostrar modal
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    
    // Reproducir video
    video.play().catch(() => {});
    
    // Cerrar al hacer clic fuera
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            cerrarVideoModal();
        }
    });
    
    // Cerrar con Escape
    document.addEventListener("keydown", function closeOnEscape(e) {
        if (e.key === "Escape") {
            cerrarVideoModal();
            document.removeEventListener("keydown", closeOnEscape);
        }
    });
}

// Función para cerrar modal de video
function cerrarVideoModal() {
    const modal = document.getElementById("modal-story");
    const player = document.getElementById("story-player");
    
    if (player) {
        player.pause();
        player.removeAttribute("src");
        player.load();
    }
    
    if (modal) {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}
