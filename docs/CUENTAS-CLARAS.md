# Cuentas claras · implementación activa

## Principio rector

Cada ingreso y gasto publicado debe ser trazable. Avisos, compromisos, dinero recibido, saldo del libro y saldo bancario son cosas distintas. Se muestran los pendientes sin inventar comprobaciones.

## Archivos activos

- `libro-publico.json`: única fuente financiera activa.
- `transparencia.html`: consulta, filtros, detalle de movimientos, necesidades, condiciones de igualación, exportación y cotejo.
- `index.html`: incrusta el instrumento en la sección Cuentas claras.

Los archivos financieros anteriores bajo `assets/data/` se conservan para la página histórica, no como fuentes activas paralelas.

## Datos y trazabilidad

Ingresos y egresos contienen identificador, fecha y monto en centavos. Origen, destino, concepto, necesidad y comprobante se publican cuando constan. No se infieren asignaciones entre aportes y gastos. `asignaciones` vincula identificadores de ingresos y egresos con un importe en centavos; los acumulados no pueden superar sus movimientos. Una asignación inválida bloquea la presentación del libro.

Las correcciones identifican el movimiento, fecha y motivo. No se reemplaza silenciosamente la historia. El repositorio ofrece versiones consultables, pero no es inmutable ni constituye una auditoría independiente.

## Verificación

- Confirmar un ingreso exige contraste bancario por el responsable; el formulario solo prepara un correo.
- Los comprobantes se publican con datos personales ocultos. Su ausencia se muestra como pendiente.
- Una conciliación documenta periodo, saldo inicial y final, movimientos y diferencias. Hasta publicarla no se afirma que el saldo bancario esté verificado.
- JSON y CSV permiten descargar registros. La huella SHA-256 identifica los datos y el cotejo compara con el archivo de GitHub; ninguna de estas operaciones confirma por sí sola una transferencia.

## Igualación peso por peso

Antes de activar: aliado y compromiso escrito, fechas, límite, criterios de elegibilidad, orden y desempates, tratamiento de duplicados, devoluciones y excedentes. Se distinguen compromiso y dinero recibido. El simulador está separado del libro y nunca crea un movimiento.

Estado inicial: en preparación, sin aliado, periodo o límite confirmados. No hay promesa de duplicación vigente.

## Necesidades y cuenta

Solo cibercafé e insumos de impresora para volantes. Costos por confirmar; no hay porcentajes calculados contra una meta ficticia.

La CLABE heredada es 072164011486478766, Banorte. Su titular sigue pendiente de confirmar. No debe alentarse una transferencia antes de confirmarlo. No se ofrece deducibilidad fiscal ni se presume una figura jurídica constituida.

## Operación responsable

Víctor Hugo Torres Méndez publica los movimientos confirmados y sus cortes. No existe sincronización automática con el banco ni edición pública de datos financieros. La transparencia no implica exponer identidad, referencias bancarias completas ni información sensible de aportantes.
