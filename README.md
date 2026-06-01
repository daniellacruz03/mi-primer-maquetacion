# 🍔 Burger House - Menú Digital Pro

Este proyecto es un sistema de menú digital optimizado para conversión, integrado con persistencia de datos y automatización de reportes.

## 🚀 Funciones y Lógicas de Pedido (Especificaciones)

### 1. Gestión del Carrito de Compras
- **Persistencia:** El carrito se sincroniza automáticamente con el `localStorage` (`bh_cart`). Si el usuario recarga la página, sus productos permanecen allí.
- **Identificación Única:** Cada ítem en el carrito genera un `id` único combinando un timestamp y un string aleatorio. Esto permite tener múltiples hamburguesas del mismo tipo pero con personalizaciones (extras) diferentes.
- **Estructura del Objeto Item:**
  - `nombre`, `cantidad`, `precioUnitario`, `subtotal`.
  - `extras`: Array de objetos que contiene el nombre del extra, la cantidad, el valor (SÍ/NO) y el precio calculado.

### 2. Lógica de Personalización (Modales)
- **Cálculo Dinámico:** El precio en el modal se actualiza en tiempo real usando la fórmula: `(Precio Base + Suma de Precios de Extras) * Cantidad Principal`.
- **Comportamiento de Extras:**
  - **Toggles (SÍ/NO):** Ingredientes que vienen por defecto (ej. Pan, Carne, Lechuga). Si se marca "NO", se resta visualmente pero no afecta el precio base.
  - **Extras con Costo:** Incrementan el subtotal del producto.
- **Validación Cruzada:** Si se quitan los "Pepinillos" (ingrediente base), el sistema resetea automáticamente cualquier "Extra Pepinillo" añadido.

### 3. Flujo de Confirmación de Orden (`registrarOrden`)
Al presionar "Confirmar Pedido", el sistema ejecuta tres acciones en paralelo de forma asíncrona:
1. **Firebase Realtime Database:** Guarda el JSON completo del pedido en `/pedidos` con un estado inicial "Pendiente".
2. **SheetDB (Google Sheets):** Envía una fila con los datos clave (Cliente, Método, Resumen de Productos, Total, Notas y Ubicación) para control administrativo.
3. **WhatsApp API:** Construye un mensaje formateado con negritas y emojis, codificando la URL para redirigir al cliente al chat oficial de Burger House.

### 4. Lógica de Horarios y Pre-Order
- **Detección Automática:** El sistema compara la hora del dispositivo (ajustada a la zona horaria de Caracas) con los rangos configurados en `CONFIG`.
- **Modo Pre-Order:** Si el local está cerrado, se muestra el modal `modal-closed`. Si el usuario elige "Pre-ordenar", el mensaje de WhatsApp incluirá la etiqueta `PROCESAR AL ABRIR` al final del texto.

## 🔧 Detalles de Integración

### 1. Lógica de Producto "Crispy Bowl"
- **Regla de Oro:** Aunque se encuentra en la categoría de *Servicios*, el **Crispy Bowl** debe comportarse internamente como una **Hamburguesa**.
- **Impacto:** En `app.js`, la variable `esHamburguesa` incluye este producto por nombre. Esto oculta el selector de cantidad masiva (`qtyContainer`) en el modal, ya que es un plato personalizado individualmente.

### 2. Firebase Realtime Database
- **Contador de Visitas:** Nodo `/stats/unique_visitors_count`. Registra usuarios únicos mediante `localStorage` para evitar duplicados.
- **Registro de Pedidos:** Nodo `/pedidos`. Guarda el objeto completo del pedido (cliente, productos, extras detallados, total y timestamp) justo antes del envío a WhatsApp.
- **Nota Técnica:** No remover el uso de `transaction()` en el contador para evitar colisiones de datos.

### 3. SheetDB (Google Sheets API)
- **Endpoint:** `https://sheetdb.io/api/v1/qyjuou0mbnjhc`
- **Función:** Envía un resumen plano de cada venta a una hoja de cálculo de Google.
- **Estructura de Datos:** Las columnas esperadas son `fecha`, `cliente`, `metodo`, `productos`, `total`, `notas` y `ubicacion`.
- **Flujo:** Se ejecuta de forma asíncrona mediante `fetch(POST)` en la función `registrarOrden` dentro del submit del formulario.

### 4. Google Analytics 4 (GA4)
- **Evento Personalizado:** Se dispara el evento `menu_ready` cuando el preloader termina satisfactoriamente. Esto mide el tiempo de carga real percibido por el usuario.

### 5. Sistema de Promociones (Lunes a Miércoles)
- Existe un modal de selección de promociones (`modal-promo-selection`) con lógica de precios fijos ($6.50 base / $8.50 combo). 
- Esta lógica es independiente del flujo normal de productos del menú para proteger el margen de ganancia.

## 🛠 Reglas de Desarrollo para IAs y Colaboradores

1. **Control de Scroll:** Siempre usar la función `lockBodyScroll(true/false)` al abrir o cerrar modales para evitar el scroll fantasma en iOS/Android.
2. **Manejo de Historial (Navegación):** El proyecto usa `history.pushState` y el evento `popstate` para que el botón "Atrás" del celular cierre los modales y el carrito en lugar de salir de la página. No romper la sincronización en `syncUIWithState()`.
3. **Geolocalización:** El botón "Enviar dirección" utiliza la API nativa de `navigator.geolocation`. Los enlaces generados deben mantener el formato de Google Maps para que el repartidor pueda abrirlo directamente.
4. **Cantidades en Modal:**
   - Hamburguesas/Kids/Crispy Bowl: Ocultan selector de cantidad principal (se añaden de 1 en 1).
   - Bebidas/Otros Servicios: Muestran selector de cantidad principal para pedidos rápidos.

## 📂 Estructura de Archivos Principal
- `index.html`: Estructura y modales.
- `style.css`: Diseño premium y animaciones.
- `app.js`: Cerebro de la aplicación (Firebase, SheetDB, Carrito).
- `stories.js`: Lógica de carga y reproducción del feed de videos tipo Instagram.

---
*Mantenido con ❤️ por el equipo de Burger House.*