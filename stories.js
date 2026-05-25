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

    // Renderizado limpio con botón de mute en tarjetas pequeñas
    videoSources.forEach(src => {
        const card = document.createElement("div");
        card.className = "video-story-card";
        
        const video = document.createElement("video");
        video.src = src;
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.playsinline = true;
        video.preload = "auto";
        
        // Botón de mute para tarjeta pequeña
        const muteBtn = document.createElement("button");
        muteBtn.className = "card-mute-btn";
        muteBtn.innerHTML = "🔇";
        muteBtn.style.cssText = "position: absolute; bottom: 8px; right: 8px; background: linear-gradient(180deg, #8b0000 0%, #ff0000 100%); border: none; color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; z-index: 10; font-size: 14px; display: flex; align-items: center; justify-content: center;";
        
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
    
    const player = document.getElementById("story-player");
    const btnMute = document.getElementById("story-btn-mute");
    const btnClose = document.getElementById("story-btn-close");
    
    if (!player || !btnMute || !btnClose) return;
    
    // Restaurar estructura original del modal
    const container = modal.querySelector(".story-full-container");
    container.innerHTML = `
        <video id="story-player" playsinline style="width: 100%; height: 100%; object-fit: contain;"></video>
        <div class="story-overlay-controls">
            <button id="story-btn-mute" class="story-mute-btn" aria-label="Silenciar" style="background: linear-gradient(180deg, #8b0000 0%, #ff0000 100%); border: none; color: white; width: 44px; height: 44px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                <span class="icon-muted">🔇</span>
                <span class="icon-unmuted" hidden>🔊</span>
            </button>
            <button id="story-btn-close" class="story-close-btn" style="position: absolute; top: 20px; right: 20px; z-index: 20; background: rgba(0,0,0,0.5); border: none; color: white; width: 44px; height: 44px; border-radius: 50%; font-size: 2rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>
    `;
    
    // Reasignar referencias
    const newPlayer = document.getElementById("story-player");
    const newBtnMute = document.getElementById("story-btn-mute");
    const newBtnClose = document.getElementById("story-btn-close");
    
    // Configurar video
    newPlayer.src = videoSrc;
    newPlayer.currentTime = 0;
    newPlayer.muted = true;
    
    // Configurar botón de mute
    const iconMuted = newBtnMute.querySelector('.icon-muted');
    const iconUnmuted = newBtnMute.querySelector('.icon-unmuted');
    
    newBtnMute.addEventListener("click", (e) => {
        e.stopPropagation();
        newPlayer.muted = !newPlayer.muted;
        if (iconMuted) iconMuted.hidden = !newPlayer.muted;
        if (iconUnmuted) iconUnmuted.hidden = newPlayer.muted;
        if (!newPlayer.muted && newPlayer.paused) newPlayer.play().catch(() => {});
    });
    
    // Configurar botón de cerrar
    newBtnClose.addEventListener("click", (e) => {
        e.stopPropagation();
        cerrarVideoModal();
    });
    
    // Mostrar modal
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    
    // Reproducir video
    newPlayer.play().catch(() => {});
    
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
