# Correcciones de Ledgr

## Ingresos y canales de venta
- El formulario de ingresos permite indicar el canal: Instagram, Web, WhatsApp, Presencial u Otro.
- El canal se guarda separado del medio de pago.
- Las ventas registradas desde el recetario ahora solicitan canal, forma de pago y notas antes de confirmar.
- El canal también aparece en la tabla de movimientos y en las exportaciones de movimientos.

## Recetario, costos y consumo
- Las cantidades de ingredientes se interpretan como lo que consume la preparación completa.
- Al vender una unidad completa, se descuenta la cantidad completa configurada en cada ingrediente. Para vender varias unidades, se multiplica esa cantidad por las unidades vendidas.
- El rendimiento queda como referencia de porciones; no divide automáticamente el consumo, el costo ni la ganancia.
- El precio sugerido por margen se calcula sobre el costo de la preparación completa.
- Las tarjetas y el formulario de venta aclaran que el costo, el precio y la ganancia corresponden al producto completo.
- Los reportes de rentabilidad usan el mismo criterio.

## Movimientos
- Cada fila incluye un botón para abrir el detalle del movimiento.
- El detalle muestra tipo, importe, categoría, canal, medio de pago, comprobante, cantidad, costo y ganancia estimados cuando están disponibles, y notas.
- Se agregaron totales de ingresos, egresos y balance del listado. Los totales respetan los filtros y la búsqueda activos.

## Importante al actualizar
- Los movimientos históricos no se modifican.
- Las ventas registradas antes de esta corrección tampoco recalculan el inventario automáticamente. Como el consumo anterior podía quedar dividido por el rendimiento, revisá el stock actual de los insumos afectados y ajustalo desde Inventario si corresponde.
- A partir de esta versión, revisá que las cantidades de cada ingrediente estén expresadas en la misma unidad configurada en Inventario (por ejemplo, 100 g si el insumo está medido en gramos).

## Verificación
- Se revisaron las rutas de guardado para que una venta no se confirme en la interfaz cuando falla la operación.
- La compilación de producción no pudo ejecutarse en este entorno porque las dependencias del ZIP original eran específicas de Windows y la reinstalación de paquetes agotó el tiempo disponible. En Windows, ejecutar `npm ci` y luego `npm run build` antes de publicar.
