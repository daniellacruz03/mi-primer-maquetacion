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

---

## 🏗️ Guía de Arquitectura y Estética (Contexto para IA/Windsurf)

Este proyecto sigue reglas estrictas de organización para mantener la fluidez en móviles:

### 1. Sistema de Capas (Stacking Context)
Para evitar solapamientos, usamos variables CSS de jerarquía:
- **C1 (`--layer-c1: 10`):** Fondo rojo, hamburguesas flotantes y footer. Elementos que nunca deben tapar la interacción.
- **C2 (`--layer-c2: 100`):** Interfaz activa. Menú de productos, buscador, carrusel de videos y botón de carrito. Es la capa de navegación principal.
- **C3 (`--layer-c3: 1000`):** Overlays y Popups. Modales de producto, ventana de "Mi Pedido", preloader y avisos urgentes. Siempre por encima de todo.

### 2. Estética Visual
- **Paleta:** Rojo profundo/Borgoña (`#7a0000`), Negro mate (`#080808`), y acentos en Rojo vibrante (`#e60000`).
- **Tipografía:** `Oswald` para títulos (fuerza y estilo burger) y `Poppins` para textos de lectura.
- **UI:** Estilo "App Nativa" (UberEats/Farmatodo), con bordes redondeados (30px+), desenfoques (`backdrop-filter`) y transiciones suaves.

### 3. Lógica de Videos
- Los videos en el carrusel superior son **estrictamente visuales**. 
- No deben tener controles, ni sonido, ni permitir pantalla completa. Funcionan como "background decorativo" con `autoplay`, `muted` y `loop`.