# Cuentas Claras - donativos + transparencia

Documento de diseno de la capa de donativos y rendicion de cuentas del instrumento.
Referencia de arquitectura: el "modelo 100%" de charity: water (la promesa de
transparencia como seccion propia), reorganizado con contenido propio.

## Principio rector
La recoleccion de donativos NO existe sin transparencia. El dinero entra atado a
un libro abierto donde cualquiera ve cuanto llega, en que se gasta y con que prueba.

## Piezas
1. **Tablero de necesidades** (`assets/data/necesidades.json`): cada necesidad con
   titulo, descripcion, categoria (basica/avanzada), prioridad, costo, recaudado y estado.
2. **Libro mayor abierto** (`assets/data/movimientos.json`): ingresos y egresos, con
   fecha, monto, concepto/origen, referencia y enlace a comprobante.
3. **Evidencia por gasto**: cada egreso enlaza su factura/recibo/foto (`comprobante`).

## Garantia anti-manipulacion
Ambos archivos viven versionados en el repositorio publico (GitHub). Cada
actualizacion = un commit con fecha y autor; el historial es publico e inmutable.
Ese rastro -no una promesa- permite auditar el manejo mas alla de toda duda.

## Donativo (CLABE)
- Deposito directo via SPEI. El numero CLABE vive ESTATICO en `index.html`
  (visible aunque falle JS), dentro de la seccion `#cuentas`.
- `cuentas.js` solo agrega: copiar al portapapeles, y el render del resumen,
  el tablero y el libro a partir de los JSON.
- Banco: Banorte (prefijo 072). Titular: PENDIENTE de confirmar antes de publicar.

## Honestidad de plataforma
- El saldo bancario no es visible de forma automatica al publico; el puente de
  confianza es publicar cada deposito y cada gasto con evidencia, sobre un
  historial que delata cualquier cambio. No es "trustless" tipo blockchain.
- Recibir donativos en una cuenta personal puede tener implicaciones fiscales
  (SAT) y no son deducibles; se trabaja para constituir una figura adecuada.

## Pendientes (datos reales por confirmar con el autor)
- Nombre del titular de la cuenta.
- Lista real de necesidades con costos en MXN (hoy hay placeholders marcados).
