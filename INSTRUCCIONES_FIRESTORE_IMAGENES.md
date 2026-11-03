# Imágenes sin Firebase Storage

Las imágenes de recetas se comprimen en el navegador y se guardan como `data:image/jpeg;base64,...` en el campo `imageUrl` del documento de Firestore. No es necesario habilitar Firebase Storage.

**Obligatorio:** publicar `firestore.rules` desde Firebase Console o con `firebase deploy --only firestore:rules`. Las reglas permiten hasta 700.000 caracteres en `imageUrl`. Firestore limita cada documento a 1 MiB; las imágenes grandes se rechazan antes de guardar.

**Advertencia:** almacenar imágenes en Firestore incrementa lecturas, ancho de banda y costo; para muchos archivos se recomienda un proveedor de almacenamiento de objetos. No se migran automáticamente imágenes anteriores de Storage.

La paginación de recetas, inventario y movimientos es local: los documentos se siguen descargando completos.
