# Correcciones
- Consumo de ingredientes por venta: multiplicación por cantidad vendida y división por rendimiento, en demo y Firestore.
- Las unidades indivisibles no se descuentan fraccionadas: si una receta exige una fracción de unidad para la venta indicada, se bloquea la venta y se explica cómo ajustar la receta.
- Validación de cantidades enteras para insumos en unidades.
- Cálculo centralizado de costos y precio de venta: check para usar precio calculado por ganancia o precio manual.
- Imágenes: compresión JPEG de hasta 1000px y calidad 65%, subida a Firebase Storage, visualización en receta.

## Importante sobre imágenes
Para subir archivos en modo conectado es necesario habilitar Firebase Storage en la consola de Firebase, tener `VITE_FIREBASE_STORAGE_BUCKET` correcto en `.env.local` y publicar `storage.rules` en Firebase Storage. Las reglas existentes permiten acceso a las imágenes solo al propietario autenticado. No se puede habilitar el servicio de Firebase desde el código.

## Nota sobre unidades
Si una receta utiliza una unidad indivisible para varias porciones, vender una porción aislada requeriría consumir una fracción de unidad. Esta versión rechaza esa operación para impedir inventario incorrecto. Para contabilizar producción por lotes o existencias de producto terminado, se necesita un módulo adicional de producción.
