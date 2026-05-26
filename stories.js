document.addEventListener("DOMContentLoaded", () => {
    const videoFeed = document.getElementById("bh-video-feed-scroll");
    if (!videoFeed) return;
    videoFeed.innerHTML = '';

    const videoSources = [
        './assets/videos/bowlbhvideo.mp4', './assets/videos/kidshousevideobh.mp4',
        './assets/videos/video1bh.mp4', './assets/videos/video2bh.mp4',
        './assets/videos/video3bh.mp4', './assets/videos/video4bh.mp4',
        './assets/videos/video5bh.mp4', './assets/videos/video6bh.mp4', './assets/videos/video7bh.mp4'
    ];

    // Mezcla aleatoria
    for (let i = videoSources.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [videoSources[i], videoSources[j]] = [videoSources[j], videoSources[i]];
    }

    const activeVideos = [];
    // Subimos el threshold a 0.5 para que solo se reproduzca el video que esté mayormente visible
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.5 };
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target.querySelector('video');
            if (video) {
                if (entry.isIntersecting) {
                    // Usamos una promesa para evitar errores si el video no ha cargado
                    const playPromise = video.play();
                    if (playPromise !== undefined) { playPromise.catch(() => { /* Auto-play prevenido */ }); }
                } else {
                    video.pause();
                }
            }
        });
    }, observerOptions);

    videoSources.forEach((src, index) => {
        const card = document.createElement("div");
        card.className = "video-story-card";
        const video = document.createElement("video");
        video.src = src;
        video.preload = "metadata"; video.muted = true; video.loop = true; video.playsinline = true;
        
        const muteBtn = document.createElement("button");
        muteBtn.className = "card-mute-btn";
        muteBtn.innerHTML = "🔇";
        muteBtn.style.cssText = "position: absolute; bottom: 8px; right: 8px; background: linear-gradient(180deg, #8b0000 0%, #e60000 100%); border: 2px solid rgba(255, 255, 255, 0.3); color: white; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; z-index: 10; font-size: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(230, 0, 0, 0.4); transition: transform 0.3s ease, box-shadow 0.3s ease;";
        muteBtn.addEventListener("mouseenter", () => {
            muteBtn.style.transform = "scale(1.1)";
            muteBtn.style.boxShadow = "0 6px 16px rgba(230, 0, 0, 0.6)";
        });
        muteBtn.addEventListener("mouseleave", () => {
            muteBtn.style.transform = "scale(1)";
            muteBtn.style.boxShadow = "0 4px 12px rgba(230, 0, 0, 0.4)";
        });
        muteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const wasMuted = video.muted;
            video.muted = !video.muted;
            muteBtn.innerHTML = video.muted ? "🔇" : "🔊";

            // Si se activó el volumen, silenciar todos los demás videos
            if (!video.muted) {
                activeVideos.forEach((v) => {
                    if (v !== video) {
                        v.muted = true;
                        // Actualizar el botón de mute del video silenciado
                        const card = v.parentElement;
                        const btn = card.querySelector('.card-mute-btn');
                        if (btn) btn.innerHTML = "🔇";
                    }
                });
            }
        });
        
        card.addEventListener("click", () => abrirVideoModal(src));
        card.appendChild(video); card.appendChild(muteBtn);
        videoFeed.appendChild(card);
        activeVideos.push(video);
        videoObserver.observe(card);
    });
});

// --- FUNCIONES GLOBALES (FUERA DEL DOMContentLoaded) ---

function cerrarVideoModal() {
    const modal = document.getElementById("modal-story");
    const player = document.getElementById("story-player");
    if (player) { player.pause(); player.removeAttribute("src"); }
    
    // Reanudar los videos del feed al cerrar el modal
    const cards = document.querySelectorAll('.video-story-card video');
    cards.forEach(v => { if (v.dataset.wasPlaying === "true") v.play().catch(()=> {}); });

    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}

function abrirVideoModal(videoSrc) {
    const modal = document.getElementById("modal-story");
    if (!modal) return;
    const container = modal.querySelector(".story-full-container");
    
    // Pausar videos del fondo para ahorrar recursos
    const feedVideos = document.querySelectorAll('.video-story-card video');
    feedVideos.forEach(v => {
        v.dataset.wasPlaying = !v.paused;
        v.pause();
    });

    container.innerHTML = '';

    const video = document.createElement("video");
    video.id = "story-player";
    video.src = videoSrc;
    // Importante: En el modal empezamos con sonido porque hubo una acción del usuario (click)
    video.autoplay = true; video.muted = false; video.loop = true; video.playsinline = true;
    video.style.cssText = "width: 100%; height: 100%; object-fit: contain; background: #000;";
    
    // Manejo de error de reproducción
    video.play().catch(() => { video.muted = true; video.play(); });

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = "position: absolute; top: 20px; right: 20px; z-index: 30; background: linear-gradient(180deg, #8b0000 0%, #e60000 100%); border: 2px solid rgba(255, 255, 255, 0.3); color: white; width: 50px; height: 50px; border-radius: 50%; font-size: 2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(230, 0, 0, 0.4); transition: transform 0.3s ease, box-shadow 0.3s ease;";
    closeBtn.addEventListener("mouseenter", () => {
        closeBtn.style.transform = "scale(1.1)";
        closeBtn.style.boxShadow = "0 6px 20px rgba(230, 0, 0, 0.6)";
    });
    closeBtn.addEventListener("mouseleave", () => {
        closeBtn.style.transform = "scale(1)";
        closeBtn.style.boxShadow = "0 4px 15px rgba(230, 0, 0, 0.4)";
    });
    closeBtn.onclick = (e) => { e.stopPropagation(); cerrarVideoModal(); };

    const muteBtn = document.createElement("button");
    muteBtn.innerHTML = "🔊";
    muteBtn.style.cssText = "position: absolute; top: 20px; left: 20px; z-index: 30; background: linear-gradient(180deg, #8b0000 0%, #e60000 100%); border: 2px solid rgba(255, 255, 255, 0.3); color: white; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; box-shadow: 0 4px 15px rgba(230, 0, 0, 0.4); transition: transform 0.3s ease, box-shadow 0.3s ease;";
    muteBtn.addEventListener("mouseenter", () => {
        muteBtn.style.transform = "scale(1.1)";
        muteBtn.style.boxShadow = "0 6px 20px rgba(230, 0, 0, 0.6)";
    });
    muteBtn.addEventListener("mouseleave", () => {
        muteBtn.style.transform = "scale(1)";
        muteBtn.style.boxShadow = "0 4px 15px rgba(230, 0, 0, 0.4)";
    });
    muteBtn.onclick = (e) => { e.stopPropagation(); video.muted = !video.muted; muteBtn.innerHTML = video.muted ? "🔇" : "🔊"; };

    container.appendChild(video); container.appendChild(closeBtn); container.appendChild(muteBtn);
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Cerrar al hacer clic fuera
    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarVideoModal();
    });

    // Cerrar con Escape
    document.addEventListener("keydown", function closeOnEscape(e) {
        if (e.key === "Escape") {
            cerrarVideoModal();
            document.removeEventListener("keydown", closeOnEscape);
        }
    });
}

function abrirCarruselPromos(images) {
    const modal = document.getElementById("modal-story");
    if (!modal) return;
    const container = modal.querySelector(".story-full-container");
    container.innerHTML = '<h2>Promociones</h2>'; // Simplificado para evitar errores
    modal.classList.add("active");
}