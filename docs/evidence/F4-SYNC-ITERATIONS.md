# F4 · Registro de iteraciones de sincronización

| Iteración | Cambio | M9 P95 | M10 | M11 | M12 | M13 | IGP | Resultado | Live |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| B1 | Baseline congelada | 14.994 ms | 0.0000 % | 0.0000 % | 100 % | 100 % | 99.838 aprox. | REFERENCIA | https://serymente.github.io/otrobuenprograma/ |
| P1.1 | Reducir repintado DOM | 15.698 ms | 0.0000 % | 0.0000 % | 100 % | 100 % | 99.822 aprox. | NO MEJORA | no publicado |
| P2 | Evitar repintado completo durante huecos entre palabras | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente | EN CURSO | pendiente |

## Regla

Cada iteración debe terminar con números, decisión y publicación live.

P1.1 se conserva como evidencia de una hipótesis que no mejoró el resultado. P2 ataca específicamente el coste producido por las transiciones `palabra → -1 → palabra` durante pausas entre palabras.
