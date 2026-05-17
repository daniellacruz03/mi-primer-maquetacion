# Script Automatizado para Optimizar Imágenes a WebP y Actualizar Código
# Versión corregida sin operadores especiales

import os
from PIL import Image

def optimizar_y_actualizar_rutas(directorio_proyecto):
    print(f"🚀 Iniciando optimización en: {directorio_proyecto}\n")
    
    # Configuración de redimensionado
    MAX_WIDTH = 900
    
    # Extensiones que vamos a buscar para convertir/optimizar
    extensiones_a_convertir = ('.jpg', '.jpeg', '.png')
    extensiones_todas = ('.jpg', '.jpeg', '.png', '.webp')
    
    # Diccionario para llevar el registro de qué imágenes se convirtieron
    imagenes_convertidas = {}
    contador_reales = 0
    
    # PASO 1: Buscar, redimensionar y convertir imágenes
    for raiz, dirs, archivos in os.walk(directorio_proyecto):
        for archivo in archivos:
            if archivo.lower().endswith(extensiones_todas):
                ruta_original = os.path.join(raiz, archivo)
                nombre_base = os.path.splitext(archivo)[0]
                extension_actual = os.path.splitext(archivo)[1].lower()
                
                ruta_webp = os.path.join(raiz, nombre_base + '.webp')
                nombre_webp = nombre_base + '.webp'
                
                try:
                    with Image.open(ruta_original) as img:
                        width, height = img.size
                        hizo_cambios = False
                        
                        if width > MAX_WIDTH:
                            ratio = MAX_WIDTH / float(width)
                            new_height = int(float(height) * ratio)
                            img = img.resize((MAX_WIDTH, new_height), Image.Resampling.LANCZOS)
                            print(f"📐 Redimensionada: {archivo} ({width}px -> {MAX_WIDTH}px)")
                            hizo_cambios = True

                        # Si no es webp o si la redimensionamos, la guardamos
                        if extension_actual != '.webp' or hizo_cambios:
                            img.save(ruta_webp, 'WEBP', quality=80)
                            print(f"✅ Procesada: {archivo} -> {nombre_webp}")
                            contador_reales += 1
                    
                    # Solo registramos para reemplazo si la extensión cambió
                    if extension_actual != '.webp':
                        imagenes_convertidas[archivo] = nombre_webp
                        
                except Exception as e:
                    print(f"❌ Error al convertir {archivo}: {e}")

    if contador_reales == 0 and not imagenes_convertidas:
        print("⚠ No se encontraron imágenes .jpg, .jpeg o .png para convertir.")
        return

    print(f"\n📝 Total de archivos de imagen optimizados: {contador_reales}")
    print("🔄 Iniciando actualización de rutas en archivos de código...\n")
    
    # Extensiones de archivos de código donde buscaremos las rutas
    extensiones_codigo = ('.html', '.css', '.js', '.json')
    
    # PASO 2: Buscar en los archivos de código y reemplazar las extensiones
    for raiz, dirs, archivos in os.walk(directorio_proyecto):
        for archivo in archivos:
            if archivo.lower().endswith(extensiones_codigo):
                ruta_codigo = os.path.join(raiz, archivo)
                
                try:
                    with open(ruta_codigo, 'r', encoding='utf-8') as f:
                        contenido = f.read()
                    
                    contenido_modificado = contenido
                    reemplazos_hechos = 0
                    
                    # Reemplazar las referencias de las imágenes convertidas
                    for nombre_viejo, nombre_nuevo in imagenes_convertidas.items():
                        if nombre_viejo in contenido_modificado:
                            contenido_modificado = contenido_modificado.replace(nombre_viejo, nombre_nuevo)
                            reemplazos_hechos += 1
                    
                    # Si hubo cambios, guardamos el archivo
                    if contenido_modificado != contenido:
                        with open(ruta_codigo, 'w', encoding='utf-8') as f:
                            f.write(contenido_modificado)
                        print(f"⚡ Rutas actualizadas en: {archivo} ({reemplazos_hechos} reemplazos)")
                        
                except Exception as e:
                    print(f"❌ No se pudo actualizar el archivo {archivo}: {e}")

    print("\n🎉 ¡Todo listo! Imágenes optimizadas y código sincronizado con éxito.")

if __name__ == "__main__":
    ruta_del_proyecto = "." 
    optimizar_y_actualizar_rutas(ruta_del_proyecto)