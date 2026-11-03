# Correcciones y despliegue

## Error de permisos al crear recetas
La regla `validRecipe` rechazaba `priceSource`, aunque el formulario lo enviaba. Se corrigió en `firestore.rules`. **Es imprescindible publicar estas reglas en el mismo proyecto Firebase que utiliza la aplicación**; cambiar el archivo local no actualiza Firebase automáticamente. En Firebase Console > Firestore Database > Rules, publicar el contenido de `firestore.rules`, o usar Firebase CLI `firebase deploy --only firestore:rules` con el proyecto correcto configurado. No sustituir por reglas públicas.

## Storage
Publicar también `storage.rules` en Firebase Storage > Rules. Verificar que Storage esté habilitado y que la configuración de Firebase apunte al bucket correcto.

## Cantidades
Las unidades indivisibles se guardan y descuentan únicamente como enteros. Cuando una venta de una porción implicaría descontar una fracción de un ingrediente en unidades, la venta se rechaza sin tocar el stock. Para vender porciones de lotes con ingredientes indivisibles se necesita implementar stock de producción terminada por lotes (no se incluye en este cambio). Corregir manualmente stocks históricos con decimales antes de operar.

## Validación
Ejecutar `npm install` y `npm run build`; probar creación/edición de recetas, carga de imágenes, ventas y movimientos con usuario autenticado y reglas publicadas.
