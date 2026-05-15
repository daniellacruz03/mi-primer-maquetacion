# Script Automatizado para Optimizar Imágenes a WebP y Actualizar Código
# Versión corregida sin operadores especiales

import os
from PIL import Image

def optimizar_y_actualizar_rutas(directorio_proyecto):
    print(f"🚀 Iniciando optimización en: {directorio_proyecto}\n")
    
    # Extensiones de imagen que vamos a buscar y convertir
    extensiones_imagen = ('.jpg', '.jpeg', '.png')
    
    # Diccionario para llevar el registro de qué imágenes se convirtieron
    imagenes_convertidas = {}
    
    # PASO 1: Buscar y convertir imágenes a .webp
    for raiz, dirs, archivos in os.walk(directorio_proyecto):
        for archivo in archivos:
            if archivo.lower().endswith(extensiones_imagen):
                ruta_original = os.path.join(raiz, archivo)
                extension_actual = os.path.splitext(archivo)[1]
                
                # Definir la nueva ruta con extensión .webp
                ruta_webp = os.path.splitext(ruta_original)[0] + '.webp'
                nombre_webp = os.path.splitext(archivo)[0] + '.webp'
                
                try:
                    # Abrir y guardar en formato WebP con calidad optimizada (calidad 80)
                    with Image.open(ruta_original) as img:
                        img.save(ruta_webp, 'WEBP', quality=80)
                    
                    print(f"✅ Convertida: {archivo} -> {nombre_webp}")
                    
                    # Guardamos la relación para el reemplazo en el código
                    imagenes_convertidas[archivo] = nombre_webp
                    if extension_actual in ['.jpg', '.jpeg', '.png']:
                        imagenes_convertidas[archivo.replace(extension_actual, '.webp')] = nombre_webp
                        
                except Exception as e:
                    print(f"❌ Error al convertir {archivo}: {e}")

    i_convertidas = imagenes_convertidas
    if not i_convertidas:
        print("⚠ No se encontraron imágenes .jpg, .jpeg o .png para convertir.")
        return

    print(f"\n📝 Total de imágenes procesadas: {len(i_convertidas)}")
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
                    for nombre_viejo, nombre_nuevo in i_convertidas.items():
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