# Dulce Balance

Aplicación web para gestión financiera, inventario y costeo de pastelerías. Interfaz React + Vite, Firebase Authentication y Cloud Firestore.

## Requisitos
- Node.js 20 o superior
- Proyecto Firebase propio

## Ejecutar en local
1. Descomprimí el ZIP y abrí la carpeta en VS Code.
2. Instalá dependencias: `npm install`
3. En Firebase Console creá un proyecto.
4. Activá **Authentication → Sign-in method → Email/Password**.
5. Creá una base **Firestore Database**.
6. En Firebase Console → Project settings → General → Your apps, registrá una app web y copiá la configuración.
7. Copiá `.env.example` como `.env.local` y completá sus valores `VITE_FIREBASE_*`.
8. En Firestore → Rules, pegá el contenido de `firestore.rules` y publicá las reglas.
9. Ejecutá `npm run dev`. Para compilar: `npm run build`.

## Funciones incluidas
- Resumen con métricas, flujo de caja y movimientos recientes.
- Alta de ingresos y gastos, categorías, fecha, método, notas y número de factura.
- Búsqueda, filtros y exportación CSV.
- Inventario de materias primas con unidades, stock mínimo, vencimiento, costo y ajustes.
- Registro de compras y mermas desde inventario.
- Recetario con ingredientes, rendimiento, mano de obra, costos fijos, precio y margen.
- Estimación dinámica del costo de receta según los costos actuales de ingredientes.
- Venta de receta con descuento proporcional del inventario por unidad y registro de ingreso.
- Reportes, comparativas visuales y ranking estimado de rentabilidad.
- Registro e inicio de sesión con Firebase; recuperación por correo.
- Diseño responsive y componentes separados.


## Persistencia, aislamiento y prevención de duplicados
- Cada cuenta de Firebase tiene un único documento de perfil en `users/{uid}`. No se usa el correo como ID: Firebase Authentication impide registrar otra cuenta con el mismo correo y los datos de cada cliente se guardan en subcolecciones bajo su UID.
- Al iniciar sesión se crea el perfil si no existe y se actualizan correo/nombre sin reemplazar la fecha original de creación.
- Insumos y recetas nuevos usan un ID derivado del nombre normalizado; una transacción comprueba si ya existe antes de crear. Así se evitan altas duplicadas por nombres repetidos desde la app. Los movimientos financieros, en cambio, sí pueden repetirse legítimamente porque cada uno representa una operación distinta.
- Los ajustes de stock generan un historial inmutable en `stockMovements`. Las compras y mermas con costo positivo también crean su egreso financiero dentro de la misma transacción.
- `firestore.rules` restringe cada espacio al usuario autenticado cuyo UID coincide con la ruta, valida los campos principales y bloquea el acceso a rutas no contempladas. Pegá el archivo completo en Firebase Console → Firestore Database → Rules y presioná **Publicar**.
- Las reglas no limpian duplicados que ya existan. Antes de migrar una base usada, hacé una copia de seguridad y revisá posibles insumos/recetas duplicados manualmente; no se borran automáticamente para evitar perder movimientos históricos.
- Nunca almacenes contraseñas en Firestore. Firebase Authentication gestiona las credenciales y el restablecimiento se hace por correo.

## Consideraciones importantes antes de usar con datos reales
- La contraseña del cliente **no puede ser visible para el administrador**. Firebase Authentication almacena credenciales protegidas y no permite recuperar contraseñas en texto claro. Para ayudar a un cliente a recuperar acceso, usá el flujo de restablecimiento por correo. No guardes contraseñas en Firestore ni en hojas de cálculo.
- La app abre en modo de demostración cuando Firebase no está configurado. En ese modo, los cambios son temporales.
- Este ZIP es una base funcional inicial, no un sistema contable/fiscal certificado. Validá los cálculos, cierres, impuestos y procesos con un profesional antes de usarla como registro oficial.
- El descuento de stock y el registro financiero de una venta se ejecutan en una transacción atómica de Firestore: si falta stock o falla una validación, la venta no se guarda parcialmente. Las operaciones simultáneas se revalidan contra el stock actual.
- Las alertas de vencimiento requieren una tarea programada y un canal de notificación (correo, push o panel). Esta primera versión muestra alertas de stock bajo; las notificaciones programadas no están activadas.
- Las recetas actuales vinculan ingredientes directos y descuentan su cantidad dividida por el rendimiento. Las sub-recetas anidadas, conversión automática entre kg/g y l/ml, lotes por vencimiento y costeo FIFO/promedio ponderado todavía requieren una etapa adicional.
- El precio sugerido y margen se muestran como estimaciones; la configuración de margen se captura pero el precio mostrado es el ingresado por el usuario. Ajustá el cálculo de precio objetivo según si el margen deseado es sobre costo o sobre precio de venta.

## Estructura
```text
src/
  components/       # Sidebar, dashboards, modales y módulos
  data/demo.js      # Datos de ejemplo
  services/store.js # Acceso básico a Firestore
  App.jsx
  firebase.js
  styles.css
firestore.rules
```
