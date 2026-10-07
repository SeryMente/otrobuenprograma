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
