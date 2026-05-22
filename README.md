# 🍔 Burger House - Menú Digital Inteligente

Menú digital premium optimizado para dispositivos móviles con sistema de pedidos automatizado vía WhatsApp y cálculo de delivery por geolocalización.

## 🚀 Características

- **Diseño UI/UX Mobile-First:** Experiencia fluida similar a una App nativa (UberEats/PedidosYa style).
- **Taxímetro de Delivery:** Cálculo automático de tarifas basado en la distancia real (Haversine Formula) desde el local.
- **Selector de Método de Entrega:** Alternancia dinámica entre Delivery y Pick Up.
- **Buscador y Filtros:** Categorización inteligente y búsqueda en tiempo real.
- **Optimización WebP:** Script de automatización para procesamiento de imágenes.

## 🛠️ Tecnologías

- **Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript Vanilla (ES6+).
- **Geolocalización:** Geolocation API de HTML5.
- **Optimización:** Python (Pillow) para procesamiento de assets.

## 📸 Optimización de Imágenes

Para mantener el rendimiento, el proyecto incluye un script en Python (`optimizar_imagenes_bh.py`).

1. Instala las dependencias: `pip install Pillow`
2. Ejecuta el script: `python optimizar_imagenes_bh.py`

Esto convertirá automáticamente tus imágenes `.jpg` o `.png` a formato `.webp` y actualizará las rutas en el código.

## 📝 Notas

- El número de WhatsApp y la dirección de retiro se configuran en el archivo `index.html`.
- Las tarifas de delivery están segmentadas por rangos de kilómetros en la lógica de JavaScript.