# Activación de reglas Firestore (obligatoria)

La app almacena fotos JPEG comprimidas como data URL dentro de `users/{uid}/recipes/{id}.imageUrl`; NO utiliza Firebase Storage.

1. Abrí Firebase Console → Firestore Database → Rules en **el mismo proyecto** que figura en `.env.local`.
2. Copiá TODO el contenido del archivo `firestore.rules` y pulsá **Publish**. Alternativamente usá Firebase CLI con un `firebase.json` que apunte a `firestore.rules` y ejecutá `firebase deploy --only firestore:rules --project TU_PROJECT_ID`.
3. Cerrá sesión y volvé a ingresar. Editá una receta y elegí una foto.
4. Si el error persiste, verificá que el UID autenticado sea el propietario de `users/{uid}/recipes/{id}`, y comprobá en Firestore Rules Playground la operación `update`.

Las reglas se aplican en el servidor; distribuir un ZIP nuevo no las publica automáticamente. No reemplaces las reglas por `allow read, write: if true`.

Se redujo el tamaño de las fotos a un máximo aproximado de 180.000 caracteres para dejar margen para el resto del documento. Las imágenes se guardan en Firestore y no se requieren reglas de Storage.
