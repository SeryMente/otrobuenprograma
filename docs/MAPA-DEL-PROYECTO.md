# Mapa del proyecto

## Que es

Una vista de una sola pantalla que explica como encajan las piezas: los tres hilos y sus relaciones. Es el "de un vistazo" que la linea de tiempo cuenta en detalle.

## Los tres hilos

- **CoMind** - la protesis cognitiva (el producto que se construye y se prueba).
- **Otro Buen Programa (OBP)** - el esfuerzo hermano (la causa documentada, el contexto-pais).
- **El instrumento** - esta obra (el documento vivo que comunica ambos y convierte al lector en interlocutor).

## Relaciones

- CoMind **nace del** problema vivido (disfuncion ejecutiva / perdida de persistencia del contexto).
- OBP **sostiene la causa** con evidencia (centros, normatividad).
- El instrumento **comunica** CoMind + OBP y **recoge** voces (Glosa, pulso).

## Implementacion

SVG inline en `index.html` (sin dependencias, escala, accesible con `<title>`/`<desc>`). Estilos en `additions.css` (`.mapa-wrap`, `.mapa-legend`). Se eligio SVG inline sobre una libreria de diagramas para mantener el peso minimo y el control total del diseno.
