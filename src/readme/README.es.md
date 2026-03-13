# Opensquad

Crea squads de agentes de IA que trabajan juntos — directamente desde tu IDE.

## Instalación

Este proyecto ya está configurado con Opensquad. Solo ábrelo en tu IDE y comienza.

## Cómo Usar

Abre esta carpeta en tu IDE y escribe:

```
/opensquad
```

Esto abre el menú principal. Desde ahí puedes crear squads, ejecutarlos y más.

También puedes ser directo — describe lo que quieres en lenguaje natural:

```
/opensquad crea un squad para escribir posts en LinkedIn sobre IA
/opensquad ejecuta el squad mi-squad
```

## Crear un Squad

Escribe `/opensquad` y elige "Crear squad" del menú, o sé directo:

```
/opensquad crea un squad para [lo que necesitas]
```

El Arquitecto hará algunas preguntas, diseñará el squad y configurará todo automáticamente.

## Ejecutar un Squad

Escribe `/opensquad` y elige "Ejecutar squad" del menú, o sé directo:

```
/opensquad ejecuta el squad <nombre-del-squad>
```

El squad se ejecuta automáticamente, pausando solo en los checkpoints de decisión.

## Oficina Virtual

La Oficina Virtual es una interfaz visual 2D que muestra tus agentes trabajando en tiempo real.

**Paso 1 — Genera el dashboard** (en tu IDE):

```
/opensquad dashboard
```

**Paso 2 — Sírvelo localmente** (en terminal):

```bash
npx serve squads/<nombre-del-squad>/dashboard
```

**Paso 3 —** Abre `http://localhost:3000` en tu navegador.
