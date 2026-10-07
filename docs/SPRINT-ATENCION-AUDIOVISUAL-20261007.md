# Sprint Ã‚Â· AtenciÃƒÂ³n audiovisual por correspondencia inmediata

**Proyecto:** Otro Gran Programa  
**Repositorio canÃƒÂ³nico:** https://github.com/SeryMente/otrogranprograma  
**URL pÃƒÂºblica canÃƒÂ³nica:** https://serymente.github.io/otrogranprograma/  
**Estado:** estrategia endurecida; pendiente de ejecuciÃƒÂ³n

## Necesidad subyacente

La necesidad no es volver la experiencia artificialmente "adictiva". Es lograr que escuchar y mirar se perciban como **una sola seÃƒÂ±al temporal**, con una recompensa inmediata por comprobar que voz y palabra visual coinciden. La persona debe poder anticipar el siguiente cambio, comprobarlo y seguir escuchando porque el seguimiento resulta claro, continuo y satisfactorio.

La hipÃƒÂ³tesis de hacer que la intensidad visual siga la intensidad de la voz es ÃƒÂºtil, pero insuficiente por sÃƒÂ­ sola: volumen no equivale a importancia y demasiada reactividad puede convertirse en ruido. El diseÃƒÂ±o se endurece en este orden:

1. **Continuidad temporal:** nunca debe parecer que la correspondencia desaparece durante una pausa breve.
2. **Correspondencia prosÃƒÂ³dica:** la energÃƒÂ­a vocal modula la presencia visual de manera suave y estable.
3. **Seguimiento gratificante:** la progresiÃƒÂ³n visual dentro de cada palabra hace perceptible el "acierto" de tiempo real.

## EstÃƒÂ¡ndar final

- Exactitud: **M10 = 0%, M11 = 0%, M12 = 100%, M13 = 100%**.
- Latencia: **M9 P95 Ã¢â€°Â¤ 10 ms** como objetivo de producto; **Ã¢â€°Â¤ 5 ms** como excelencia.
- Continuidad: sin huecos perceptibles durante silencios breves.
- Prosodia: seÃƒÂ±al acÃƒÂºstica suavizada Ã¢â€ â€™ presencia visual; sin parpadeo ni jitter.
- Legibilidad: el estÃƒÂ­mulo nunca compite con el texto.
- No distracciÃƒÂ³n: la animaciÃƒÂ³n existe para reforzar el seguimiento.
- ValidaciÃƒÂ³n: A/B con escucha real; no basta con que "se vea bonito".
- Evidencia: cada iteraciÃƒÂ³n registra nÃƒÂºmeros, delta, decisiÃƒÂ³n, commit y publicaciÃƒÂ³n.

## IteraciÃƒÂ³n 1 Ã‚Â· Continuidad visual

Eliminar el encendido/apagado entre palabras. La palabra activa conserva el foco; las palabras reciÃƒÂ©n pronunciadas dejan una estela breve. En una pausa corta, la ÃƒÂºltima palabra permanece como ancla visual y la transiciÃƒÂ³n anticipa la siguiente sin inventar contenido.

**Gate:** exactitud intacta y continuidad perceptual superior a la versiÃƒÂ³n actual.

## IteraciÃƒÂ³n 2 Ã‚Â· Correspondencia prosÃƒÂ³dica

Calcular una envolvente acÃƒÂºstica suavizada y trasladarla a luminancia/glow/presencia. La respuesta tendrÃƒÂ¡ attack/release, lÃƒÂ­mites y suavizado para evitar jitter. MÃƒÂ¡s energÃƒÂ­a vocal aumenta presencia; menos energÃƒÂ­a la reduce, pero no la elimina.

**Gate:** correlaciÃƒÂ³n acÃƒÂºstico-visual fuerte, jitter bajo, legibilidad intacta.

## IteraciÃƒÂ³n 3 Ã‚Â· Seguimiento gratificante

Introducir una progresiÃƒÂ³n intrapalabra sutil durante el intervalo real de cada palabra. El avance visual confirma al oyente que la correspondencia continÃƒÂºa acertando. El bucle perceptual buscado es:

**escuchar Ã¢â€ â€™ ver coincidir Ã¢â€ â€™ anticipar Ã¢â€ â€™ comprobar Ã¢â€ â€™ continuar**

**Gate:** mejora de preferencia y/o permanencia frente a la versiÃƒÂ³n previa en una comparaciÃƒÂ³n A/B, sin degradar ningÃƒÂºn gate tÃƒÂ©cnico.

## DecisiÃƒÂ³n

**MEJORA:** publicar.  
**FUNCIONAL SIN MEJORA:** no promover; registrar.  
**FALLA:** corregir dentro del mismo ciclo; no publicar.

## OperaciÃƒÂ³n

**CAMBIO Ã¢â€ â€™ BENCHMARK Ã¢â€ â€™ NÃƒÅ¡MEROS Ã¢â€ â€™ DELTA Ã¢â€ â€™ DECISIÃƒâ€œN Ã¢â€ â€™ EVIDENCIA Ã¢â€ â€™ LIVE**

No se ejecuta una iteraciÃƒÂ³n posterior mientras la actual no haya terminado.

## LÃƒÂ­mite de diseÃƒÂ±o

La meta es sostener **atenciÃƒÂ³n voluntaria, comprensiÃƒÂ³n y continuidad de escucha** mediante una correspondencia audiovisual excelente. No se diseÃƒÂ±an mecanismos para explotar compulsiones, ansiedad o dependencia del estÃƒÂ­mulo.

## Fidelidad sonora

Las fuentes de transcripciÃƒÂ³n conservan literalmente las palabras realmente pronunciadas. Esa conservaciÃƒÂ³n es evidencia de audio, no branding. Los metadatos, rutas, identificadores y superficies de comunicaciÃƒÂ³n sÃƒÂ­ deben usar exclusivamente **Otro Gran Programa / OGP**.


---

## Endurecimiento previo a ejecución · 2026-10-07

Este sprint no persigue un efecto visual llamativo. Su criterio de éxito es que el cerebro pueda usar el texto visible como **confirmación temporal inmediata de la voz**, sin tener que reconstruir mentalmente la correspondencia.

### Contrato de calidad

La experiencia final deberá satisfacer simultáneamente cuatro capas:

**1. Verdad temporal.** La palabra visible y la palabra pronunciada deben coincidir dentro de una ventana perceptualmente irrelevante. El audio sigue siendo el reloj maestro.

**2. Continuidad perceptual.** Una pausa respiratoria o micro-silencio no puede producir la sensación de que la narración desapareció. La interfaz conserva el estado semántico correcto mientras espera el siguiente evento sonoro.

**3. Correspondencia prosódica.** La energía visual puede seguir cambios de energía vocal, pero nunca debe convertirse en un visualizador de volumen. Se usará una envolvente suavizada con límites, attack/release y piso visual; volumen alto no implica automáticamente mayor importancia semántica.

**4. Recompensa de seguimiento.** El progreso visual debe hacer evidente que el sistema sigue acertando ahora mismo. La señal es continua dentro de la palabra, no un destello al entrar y otro al salir.

### Gates duros

Una iteración no se publica por estar “más bonita”. Debe demostrar:

- **M10 = 0%** y **M11 = 0%**.
- **M12 = 100%** y **M13 = 100%**.
- **M9 P95 ≤ 10 ms** como objetivo de producto; **≤ 5 ms** como nivel de excelencia.
- Sin jitter visual perceptible durante habla sostenida.
- Sin desaparición perceptual durante pausas breves.
- Sin pérdida de legibilidad ni competencia entre animación y texto.
- Sin pelea entre seguimiento automático y gesto deliberado del usuario.
- Sin regresión de navegación, accesibilidad, móvil o carga.

### Iteración 1 — Continuidad visual

**Intervención única:** sustituir el modelo binario encendido/apagado por un estado continuo: palabra actual enfocada, palabras recientes con persistencia decreciente y pausa breve retenida sin inventar avance.

**Prueba adversarial:** detener el audio en respiraciones, pausas de puntuación y fronteras entre segmentos; comprobar que la pantalla no parece “muerta” ni adelanta una palabra no pronunciada.

**PASS:** exactitud intacta + continuidad perceptual superior a baseline.

**FAIL:** no se publica; se corrige dentro del mismo ciclo.

### Iteración 2 — Prosodia controlada

**Intervención única:** derivar una envolvente de energía del audio y aplicarla a presencia/luminancia/glow mediante un filtro attack/release con límites estrictos.

**Prueba adversarial:** voz baja, voz intensa, consonantes explosivas, silencios, respiraciones y cambios bruscos. Debe reaccionar la presencia visual, no temblar la interfaz.

**PASS:** correlación acústico-visual consistente, jitter bajo, legibilidad intacta y cero regresiones de sincronización.

**FAIL:** corregir antes de promover.

### Iteración 3 — Seguimiento gratificante

**Intervención única:** convertir el intervalo temporal de cada palabra en una progresión intrapalabra sutil y estable. La progresión debe ser proporcional al tiempo real de esa palabra, no a una animación ornamental.

**Prueba adversarial:** palabras muy breves, palabras largas, signos de puntuación, cambios de segmento y seek manual.

**Validación A/B:** comparar versión previa contra candidata en escucha real. La prueba debe medir al menos preferencia declarada, comprensión y continuidad de escucha; una mejora meramente estética no cuenta.

**PASS:** mejora perceptual demostrable sin degradar ningún gate técnico.

### Regla de decisión

**MEJORA → publicar inmediatamente.**  
**FUNCIONAL SIN MEJORA → registrar y no promover.**  
**FALLA → corregir dentro del mismo ciclo.**  
**NO existe el estado “casi listo” para pasar a la siguiente iteración.**

### Disciplina del ciclo

Cada iteración debe producir en un solo ciclo:

**CAMBIO → BENCHMARK → NÚMEROS → DELTA → DECISIÓN → EVIDENCIA → LIVE**

El registro debe conservar: baseline, versión candidata, commit, métricas, diferencia frente a la versión anterior, resultado PASS/FAIL y URL pública comprobada.

### Límite de diseño

La atención buscada es **atención voluntaria sostenida mediante una correspondencia audiovisual excelente**. No se diseñan mecánicas para explotar compulsión, ansiedad o dependencia del estímulo.

### Criterio de cierre del sprint

El sprint termina únicamente cuando las tres iteraciones han sido ejecutadas o descartadas con evidencia, la mejor versión está publicada y una comprobación final confirma:

**audio ↔ palabra ↔ pantalla ↔ continuidad ↔ prosodia ↔ navegación ↔ producción**

como una sola experiencia coherente.
