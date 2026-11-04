# Revisión visual y mejoras de Ledgr

## Cambios incluidos
- Exportaciones de reportes y movimientos a Excel compatible (.xls / SpreadsheetML), con hojas separadas para movimientos, rentabilidad e inventario, encabezados, estilos de celda, importes monetarios, totales, anchos de columna y paneles congelados.
- El cálculo de rentabilidad ahora utiliza el precio efectivo de venta configurado para la receta (incluye precio manual o precio calculado), evitando que el ranking use un valor distinto al de las cards.
- Cards de recetas con rendimiento, cantidad de insumos, ganancia estimada por unidad y resumen de ingredientes, además de los costos y el margen ya existentes.
- Mejora de jerarquía visual, espaciado, estados de foco, campos, controles, modales, tablas, tarjetas y botones.
- Ajustes responsive para tablet y móvil: grillas, formularios, cards, barras de acciones, tablas desplazables y paginación.
- Respeto de la preferencia del sistema para reducir animaciones.

## Exportaciones
Los archivos se generan como Excel XML (.xls), que Excel puede abrir directamente y conserva formato de celdas. El reporte general contiene tres hojas: Movimientos, Rentabilidad e Inventario. La exportación desde Movimientos respeta los filtros y búsqueda activos.

## Configuración y datos
No se modificó Firebase, Firestore ni sus reglas: estos cambios son de presentación y exportación en el navegador. No se agregaron dependencias.

## Nota de verificación
Se verificó la sintaxis de los módulos JavaScript independientes. No fue posible completar `npm run build` en este entorno porque la instalación de dependencias (`npm ci`) no terminó dentro del tiempo disponible y Vite no quedó instalado. Ejecutá `npm install` y luego `npm run build` en tu equipo para validar el build final.
