# makeAutoWeb

Sitio estatico refactorizado en dos capas:

- `index.html`: landing comercial orientada a conversion.
- `lab/`: demos tecnicas locales, aisladas y sin dependencias AWS.

## Estructura

- `css/`: hojas modulares por capas (`tokens`, `base`, `layout`, `components`, `utilities`).
- `js/core/`: comportamiento minimo compartido.
- `js/components/`: inicializadores de paginas y demos.
- `js/services/`: logica local de simulacion.
- `data/`: snapshots JSON de referencia para escenarios locales.

## Criterios del refactor

- Sin `cloud-demo`.
- Sin llamadas a AWS.
- Sin carrusel ni demos incrustadas en el home.
- Sin dependencias externas obligatorias para la interfaz.

## Uso

Abre el proyecto con cualquier servidor estatico local y navega entre:

- `/index.html`
- `/lab/index.html`

## Contacto

- WhatsApp: `+57 323 334 4633`
- Email: `operaciones@makeautomatic.com`
