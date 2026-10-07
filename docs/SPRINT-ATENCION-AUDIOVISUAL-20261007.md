# Sprint de Atención Audiovisual

**Proyecto:** Otro Gran Programa
**Repositorio canónico:** https://github.com/SeryMente/otrogranprograma
**Estado:** PLANIFICADO · PREIMPLEMENTACIÓN
**Fecha:** 2026-10-07
**Objeto:** aumentar la atención sostenida voluntaria mediante una correspondencia audiovisual inmediata, continua y gratificante entre audio y transcripción, sin degradar legibilidad ni fidelidad temporal.

## 1. Necesidad subyacente

La necesidad no es hacer que el reproductor sea simplemente más llamativo ni maximizar una conducta compulsiva. La necesidad funcional es mantener al usuario orientado hacia el contenido mediante una señal visual que confirme, momento a momento, qué unidad lingüística está sonando.

La experiencia objetivo debe producir una sensación de seguimiento continuo:

**oír → localizar → confirmar → anticipar → seguir**

La correspondencia visual debe ser suficientemente estable para que el usuario pueda confiar en ella y suficientemente viva para que seguirla resulte perceptualmente interesante.

## 2. Hipótesis de diseño

La hipótesis inicial del sprint es que un resaltado binario que aparece y desaparece según actividad de voz produce una pérdida innecesaria de continuidad durante pausas, transiciones y zonas de baja energía.

La propuesta endurecida separa tres canales:

1. **Canal semántico primario:** qué palabra está activa.
2. **Canal temporal:** dónde se encuentra el usuario dentro de la secuencia y qué palabra viene después.
3. **Canal prosódico secundario:** modulación sutil de la intensidad visual según la energía del habla, sin alterar la identificación de la palabra activa.

La intensidad de voz no debe sustituir al estado activo. Debe modularlo.

## 3. Estándar de calidad del sprint

El resultado no se considera aceptable por ser atractivo. Debe cumplir simultáneamente:

- **Fidelidad:** la palabra visualmente dominante debe corresponder al audio real.
- **Continuidad:** no debe desaparecer el estado visual solo porque exista una pausa breve o una zona de baja energía.
- **Previsibilidad:** el movimiento del foco debe ser suave y no saltar arbitrariamente.
- **Legibilidad:** la animación no puede dificultar la lectura del texto.
- **Baja latencia:** la actualización visual debe sentirse prácticamente simultánea con el audio.
- **Robustez:** pausas, palabras cortas, palabras largas y cambios rápidos de ritmo no deben romper el seguimiento.
- **Accesibilidad:** debe existir comportamiento razonable con reducción de movimiento y contraste suficiente.
- **Control del usuario:** el sistema debe facilitar seguir, pausar, reanudar y abandonar el seguimiento sin fricción.
- **No dependencia de estímulo compulsivo:** no se usarán destellos rápidos, parpadeos ni microanimaciones constantes cuyo único objetivo sea forzar interacción.

## 4. Métricas y criterios

El sprint usará, como mínimo:

- **Precisión de alineamiento visible:** porcentaje de palabras activas que coinciden con la ventana temporal de la palabra real.
- **Latencia visual:** diferencia entre el inicio temporal esperado de la palabra y el cambio perceptible de estado.
- **Continuidad de foco:** porcentaje del tiempo hablado en que existe una palabra activa válida.
- **Falsos activos:** palabras resaltadas fuera de su intervalo válido.
- **Transiciones defectuosas:** saltos, regresiones o desapariciones no justificadas.
- **Carga visual:** inspección cualitativa de legibilidad y estabilidad.
- **Experiencia percibida:** prueba manual estructurada con observación de si el usuario puede seguir el audio por la vista sin esfuerzo adicional.

### Umbrales de aceptación

- precisión visible ≥ 98 % en la muestra de QA seleccionada;
- continuidad de foco ≥ 99 % durante habla;
- falsos activos ≤ 1 %;
- ninguna regresión funcional del reproductor;
- cero parpadeos rápidos o comportamientos que puedan resultar molestos;
- compatibilidad con `prefers-reduced-motion`;
- todas las pruebas críticas existentes siguen pasando.

Estos umbrales son **criterios internos de ingeniería de esta iteración**, no afirmaciones de eficacia clínica.

## 5. Iteración 1 — Ancla persistente

**Objetivo:** eliminar el patrón actual de resaltado → desaparición → resaltado y establecer una palabra activa persistente como ancla visual.

**Cambio conceptual:** la palabra actual mantiene un estado visual estable durante toda su ventana temporal. Durante pausas breves se conserva el ancla o una transición neutral; no se devuelve inmediatamente la interfaz a estado vacío.

**Requisitos:**

- estado activo inequívoco;
- transición suave entre palabras;
- desplazamiento automático opcional sin imponerlo;
- ninguna pérdida de sincronización por pausas cortas;
- soporte de teclado y reducción de movimiento.

**Criterio de salida:** la experiencia debe permitir seguir una frase completa mirando la transcripción sin encontrar huecos visuales innecesarios.

## 6. Iteración 2 — Continuidad predictiva

**Objetivo:** convertir el resaltado en un cursor audiovisual continuo, no en una sucesión de estados discretos.

**Cambio conceptual:** añadir una transición temporal entre palabra anterior, palabra actual y siguiente. El foco debe anticipar de forma mínima la continuidad del discurso sin inventar tiempos.

**Requisitos:**

- interpolación controlada entre estados;
- tratamiento especial de palabras de duración muy corta;
- no retroceder visualmente;
- no adelantar de manera que la palabra equivocada domine;
- conservar una trayectoria estable al aumentar la velocidad del habla.

**Criterio de salida:** el usuario debe percibir que el foco viaja con el habla en vez de saltar de palabra en palabra.

## 7. Iteración 3 — Modulación prosódica de alta calidad

**Objetivo:** explorar la propuesta de usar la intensidad de voz como segundo canal visual, sin contaminar la fidelidad semántica.

**Cambio conceptual:** la palabra activa mantiene identidad constante, mientras una capa secundaria modula suavemente brillo, halo, grosor o profundidad visual según energía/prosodia.

**Requisitos:**

- la semántica del estado activo no depende de la amplitud;
- la modulación debe ser continua y acotada;
- voz fuerte no implica cambio de palabra;
- silencios no deben provocar desaparición abrupta;
- evitar ruido visual por respiraciones, golpes, clipping o fluctuaciones pequeñas;
- normalizar la señal para que la comparación entre segmentos no dependa de una escala absoluta de volumen.

**Criterio de salida:** la modulación debe aumentar la sensación de sincronía sin reducir precisión, legibilidad o tranquilidad visual. Si el efecto se percibe decorativo, confuso o fatigante, se descarta aunque sea técnicamente correcto.

## 8. Regla de decisión entre iteraciones

Cada iteración produce:

**CAMBIO → MÉTRICAS → OBSERVACIÓN → DECISIÓN → EVIDENCIA**

No se avanza por inercia.

La siguiente iteración solo se conserva si:

**mejora perceptible + no regresión técnica + cumplimiento de umbrales**

Cuando una hipótesis no mejora el seguimiento, se revierte y se conserva la evidencia del descarte.

## 9. Definición de éxito del sprint

El sprint se considera exitoso únicamente cuando el reproductor consigue una correspondencia visual:

- precisa;
- continua;
- suave;
- perceptualmente inmediata;
- legible;
- accesible;
- estable durante pausas y cambios de ritmo;
- y suficientemente interesante como para facilitar la permanencia voluntaria del usuario en el contenido.

La palabra activa siempre sigue siendo la señal primaria. La prosodia únicamente la enriquece.

## 10. No implementación todavía

Este documento define el estándar y las tres iteraciones antes de comenzar la ejecución. El siguiente ciclo de trabajo debe iniciar por la Iteración 1 y registrar evidencia contra los criterios anteriores.