# 🏗️ EcoPulse Dynamics - Proyecto de Adaptación Web

Este proyecto es una adaptación de una plantilla profesional de código abierto para la empresa **EcoPulse Dynamics**, especializada en soluciones de energía sostenible.

**Captura de pagina del proyecto** [![Screenshot pagina web](./assets/img/portada.PNG)]
**URL del Proyecto:** [https://lmsgi.iesvjp.es/b2-ii-t4-p3-proyecto-ecopulse-dynamics-vjp-jorgeDVG]
**Plantilla base utilizada** [https://learning-zone.github.io/website-templates/lovely-wedding-bootstrap-free-website-template/]
**Organización:** LMSGI
**Nombre:** [Jorge De Vicente Gómez]

---

## 🛠️ Tecnologías Utilizadas
* **HTML5 / CSS3** (Estructura y diseño)
* **JavaScript (ES6+)** (Lógica y carga dinámica)
* **Fetch API** (Consumo de datos JSON)
* **Squoosh** (Optimización de imágenes WebP)
* **Formspree** (Gestión de formularios)

---

## 📈 Fases del Proyecto

### Fase 1: Identidad y Maquetación
- **Plantilla Base:** [Nombre de la plantilla elegida, ej: Agency-V1]
- **Personalización:** Se han implementado variables CSS (`:root`) para cumplir con la guía de estilos de EcoPulse.
- **Optimización:** Todas las imágenes originales se sustituyeron por versiones `.webp` de alta eficiencia.
- **SEO:** Configuración de Meta-tags y Favicon personalizado.

### Fase 2: Interactividad y Datos
- **Carga Dinámica:** Los servicios de la empresa ya no están en el HTML. Se cargan desde un archivo `servicios.json` mediante la Fetch API para facilitar el mantenimiento.
- **Validación de Formulario:** Implementada lógica en JS para asegurar que los correos electrónicos sean válidos y los mensajes tengan la longitud mínima requerida.
- **Integración de Formulario:** Conexión real con backend para recepción de leads.

---

## 🚀 Cómo ejecutar el proyecto localmente
1. Clona este repositorio:
   `git clone https://github.com/[organizacion]/[tu-repo].git`
2. Abre el archivo `index.html` en tu navegador (se recomienda usar la extensión **Live Server** en VS Code para que las peticiones Fetch funcionen correctamente).

---

## 🛡️ Licencia
Este proyecto se realiza con fines educativos bajo la licencia MIT.

# EcoPulse Dynamics - Proyecto Fase 2

## Descripción General
Este proyecto es la continuación de la plataforma web corporativa de **EcoPulse Dynamics**. En esta Fase 2 se han implementado mejoras significativas de Experiencia de Usuario (UX) y funcionalidades avanzadas mediante JavaScript, incluyendo un panel de control interactivo (Dashboard) y validación estricta de datos en cliente.

## Resumen de Mejoras Implementadas

### 1. Arquitectura y Optimización CSS (DRY & Prettier)
* **Modo Oscuro Nativo:** Consolidación de todas las reglas `.dark-theme` apoyándose en la sobrescritura de variables CSS (`--ep-bg-depth`, etc.), evitando la repetición de selectores y garantizando la legibilidad de todos los contrastes (ej. textos del simulador y etiquetas de formularios).

### 2. Refactorización de JavaScript (Vanilla JS ES6)
* **Single Event Listener:** Unificación de todos los scripts bajo un único `DOMContentLoaded` para evitar cuellos de botella en el renderizado.
* **Delegación y Caché del DOM:** Extracción de selectores de elementos (ej. protocolo V2G y Simulador) fuera de los intervalos (`setInterval`) para reducir drásticamente el reflow del navegador.
* **Delegación de Animaciones al CSS:** Eliminación de animaciones inyectadas vía JS (ej. la partícula V2G). Ahora JS solo controla el estado (`display: block/none`), permitiendo que CSS gestione la interpolación visual mediante `@keyframes` y Media Queries responsivas.

### 3. Integración de Datos Reales (API REST)
* **Conexión Open-Meteo:** Integración asíncrona (`fetch / await`) con la API meteorológica para obtener datos reales de Plasencia.
* **Dashboard "Vivo":** * Lectura de la temperatura local en tiempo real.
    * Cálculo de *Rendimiento*, *Generación* y *Ahorro* basado en la **radiación solar terrestre** de la hora actual.
    * **Curva de Generación Dinámica:** La gráfica (Chart.js) inyecta de forma automática los datos de radiación solar mapeados en intervalos de 3 horas para el día en curso.

### 4.UX y Accesibilidad (A11y) en Formularios
Se ha diseñado un motor de validación personalizado que cumple al 100% con rúbricas estrictas de usabilidad:
* **Feedback Visual Inmediato:** Validación en tiempo real (`input`) y al perder el foco (`blur`).
* **Estados Claros (Colores e Iconos):** Los campos cambian su borde (Verde/Rojo) y transforman su icono dinámicamente (`fa-check` / `fa-times`) dependiendo de su validez.
* **Contadores Dinámicos:** Visualización en tiempo real de caracteres mínimos/máximos y recuento de palabras en el área de texto mediante *badges* estilizados.
* **Accesibilidad ARIA:** Implementación de `role="alert"` para los mensajes de error, `aria-describedby` para vincular errores a sus *inputs*, y gestión dinámica de `aria-invalid="true/false"` para compatibilidad total con lectores de pantalla.
* **Bloqueo de Envío:** El formulario previene el evento `submit` si existen errores de validación en cualquier campo.
