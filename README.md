# American Recycling & Sanitation

Sitio estático de American Recycling & Sanitation, Inc., empresa familiar de basura, reciclaje, dumpsters y roll-off en el sureste de Nebraska (condados de Cass, Nemaha, Otoe y Richardson). La oficina está en Rock Port, Missouri.

El sitio público de esta versión es [https://ars.dnet.llc](https://ars.dnet.llc). El sitio que ya usa la empresa sigue en [https://www.arsinconline.com](https://www.arsinconline.com). Esta copia es una propuesta para enseñársela al dueño; no sustituye el dominio de la empresa.

El contenido de las páginas está en inglés. Este README está en español.

## Qué hace

- Presenta servicios, reciclaje, área de servicio, estación de transferencia, la empresa y el contacto.
- Al escribir una calle, un pueblo o la dirección del formulario, sugiere y completa la dirección.
- Al elegir una dirección, rellena calle, pueblo y código postal y dice si ese lugar tiene servicio directo, servicio por el ayuntamiento, servicio de Auburn (Board of Public Works) o ruta rural.
- El mapa del área de servicio marca los pueblos con recogida directa o por el ayuntamiento.
- El formulario de contacto abre el correo del visitante. Si no se abre, muestra el texto para copiarlo.

## Puesta en marcha

No hay build ni dependencias de Node. Hace falta Python 3.

```bash
python3 serve.py
```

Escucha solo en `127.0.0.1:3230`. Abre [http://127.0.0.1:3230](http://127.0.0.1:3230).

Para una vista local en otro puerto:

```bash
python3 -m http.server 8765
```

Ese segundo comando no añade las cabeceras de `serve.py` y sí permite listar el directorio. En el servidor se usa `serve.py`.

## Variables de entorno

Ninguna. No hay `.env`, base de datos ni claves. El puerto y la interfaz están fijos en `serve.py`.

## Estructura

```
index.html              Inicio, comprobador de dirección y datos de negocio
services.html           Servicios
recycling.html          Reciclaje
service-area.html       Mapa y área (aquí se carga Leaflet)
transfer-station.html   Estación de transferencia de Nebraska City
about.html              La empresa
contact.html            Contacto
style.css               Estilos
script.js               Cobertura, autocompletado, mapa, formulario y año
serve.py                Servidor estático, solo en localhost
assets/                 Ilustraciones SVG y favicon
```

La cabecera y el pie están repetidos en cada HTML.

## Cobertura

Definida en `script.js`.

- Directo: Nebraska City, Brownville, Dunbar, Howe, Lorton, Union.
- Por el ayuntamiento: Brock, Johnson, Julian, Peru, Stella, Talmage.
- Auburn (dentro del pueblo): Board of Public Works, 402-274-4981.
- Casilla de ruta rural: explica que la recogida en el pueblo no es directa y pide confirmar.
- Howe y Auburn comparten el ZIP 68305. Si eligen Howe, el servicio es directo. Si solo escriben 68305, sale Auburn.

Las sugerencias de calle salen de [Photon](https://photon.komoot.io/) (OpenStreetMap), limitadas a esos cuatro condados. El pueblo se completa con la lista local, sin red. Los pines del mapa usan el centro público de cada pueblo.

## Despliegue

En el Dell de DNET el sitio vive en `/home/raul/ars-website`. El servicio de usuario systemd `ars-web.service` ejecuta `python3 serve.py` y queda en `127.0.0.1:3230`. No usa Docker.

Cloudflare Tunnel (DNET-HOME) publica ese puerto como `ars.dnet.llc`, con un CNAME en proxy, igual que los otros subdominios de DNET. La ruta de ARS va justo antes de la regla final que responde 404. El resto de rutas del túnel no se toca al publicar este sitio.

La copia anterior de la configuración del túnel quedó en el servidor, fuera de la carpeta web.

## Servicios externos

- Photon (Komoot / OpenStreetMap) para sugerir calles. No pide clave. Si no responde, el pueblo y el ZIP locales siguen funcionando.
- Leaflet 1.9.4 y teselas de OpenStreetMap, solo en `service-area.html`.
- Google Fonts: Bricolage Grotesque y Public Sans.
- El formulario no tiene backend: usa `mailto:customerservice@arsinconline.com`.
- Pagar, empleos y calendario de festivos siguen enlazando a arsinconline.com. Empleos usa a propósito `employment-opportunites`: esa URL responde. `employment-opportunities` devuelve 404.

## Copias de seguridad

El origen es este repositorio. La copia que está en el aire es `/home/raul/ars-website` en el Dell. Para volver a publicar, copia estos archivos ahí y reinicia el servicio de usuario:

```bash
systemctl --user restart ars-web.service
```

## Pendiente

- Fotos reales de camiones, equipo y contenedores. Hoy son ilustraciones SVG.
- Un formulario alojado. El `mailto` no garantiza que el correo salga.
- Páginas propias de pagar, empleos y festivos, en lugar de enlazar al sitio viejo.
- Canonical y Open Graph con la URL definitiva, cuando el dueño decida el dominio.
