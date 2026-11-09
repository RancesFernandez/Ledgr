# Corrección: permisos para ventas desde el recetario

## Causa
La venta desde el recetario guarda un movimiento financiero con el campo `channel`
(Instagram, Web, WhatsApp, Presencial u Otro). Las reglas anteriores de Firestore
usaban `keys().hasOnly(...)` y no incluían `channel`, por lo que Firestore rechazaba
la transacción con `Missing or insufficient permissions`.

## Cambio aplicado
- Se agregó `channel` a la lista de campos permitidos de `users/{uid}/movements`.
- Se validan de forma opcional el canal, medio de pago, notas, receta, cantidad,
  costo estimado y ganancia estimada.
- Se mantienen las restricciones de autenticación y propiedad: cada usuario solo
  puede escribir en su propio espacio `users/{uid}`.
- No se relajaron los permisos de otras colecciones ni se habilitó acceso público.

## IMPORTANTE: publicar las reglas en Firebase
Actualizar el archivo local no cambia las reglas del proyecto Firebase automáticamente.

1. Abrí Firebase Console: https://console.firebase.google.com/
2. Seleccioná el proyecto usado por esta aplicación.
3. Entrá en Firestore Database → Rules.
4. Reemplazá el contenido por el archivo `firestore.rules` incluido en este proyecto.
5. Presioná **Publish**.
6. Volvé a iniciar sesión en Ledgr y probá registrar una venta desde el recetario.

Si usás Firebase CLI desde la carpeta del proyecto, también podés publicar con:
`firebase deploy --only firestore:rules`

## Prueba recomendada
Hacé una venta de una receta con stock suficiente. Debe:
- crear un ingreso con canal y medio de pago;
- descontar los ingredientes;
- registrar los movimientos de stock;
- mostrar el movimiento financiero en Movimientos.

La operación se ejecuta en una transacción: si Firestore rechaza alguna escritura,
no se confirma la venta ni se descuenta parcialmente el inventario.
