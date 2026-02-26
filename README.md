# MindTrack - App de Productividad y Hábitos

MindTrack es una aplicación web y móvil asombrosamente rápida, diseñada para gestionar todas las fases de la productividad diaria: construcción de hábitos, registro de actividades clave, toma de notas enriquecidas y gestión optimizada de lectura.

## 🚀 Características Principales

*   **Aplicación Instalable (PWA):** MindTrack cuenta con soporte PWA nativo, lo que permite su instalación en dispositivos Android y iOS sin la necesidad de tiendas de aplicaciones y con un soporte offline parcial.
*   **Sincronización en Tiempo Real:** Interfaz Local-First hiper rápida. Todos los datos, progresos y configuraciones se cifran, almacenan localmente y se sincronizan discretamente hacia una potente base de datos en la nube (Supabase).
*   **Gestión Híbrida de Hábitos:** Calcula racha diaria de constancia, cuenta los días perfectos y prioriza actividades dinámicamente con un diseño altamente estético de barras interactivas adaptables a modo oscuro y claro.
*   **Editor de Notas Avanzado:** Creación de listas y textos estilizados, refactorizado matemáticamente para preservar y soportar los eventos táctiles móviles de cualquier celular o teclado inteligente.
*   **Biblioteca Digital Segura:** Visualizador PDF optimizado que procesa documentos binarios base64 pesados. En dispositivos móviles incluye algoritmos "anti-bloqueo" saltando las medidas invasivas que algunos navegadores tienen hacia viejos iframes.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) - Renderizado responsivo modular.
*   **Servicio Backend & DB:** [Supabase](https://supabase.com/) - Arquitectura PostgreSQL en la nube, autenticación e identificadores seguros para datos cruzados.
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/) - Diseño altamente personalizable a nivel de bloque, implementando filosofías Liquid-Layout y Mobile-First.
*   **Iconos:** [Lucide React](https://lucide.dev/) - Iconografía moderna y escalable.

## 📦 Arquitectura General

MindTrack evita el tradicional retraso de Base de Datos. Utiliza `useState` puro para un control Inherentemente Inmediato frente al usuario, aplicando un *Debounce asíncrono* en segundo plano que inyecta/altera JSON's estructurales directo a las tablas en la nube, guardando cada movimiento local a prueba de desconexiones eléctricas.

## 💻 Instalación y Ejecución Local

1.  **Clonar el repositorio** y abrir la carpeta Raíz.
2.  **Instalar dependencias:** `npm install`
3.  Asegurar las claves secretas en `.env` (credenciales de Supabase).
4.  **Ejecutar para pruebas:** `npm run dev`
5.  **Compilar PWA & Build de Producción:** `npm run build`

> Construida enfocándose en la constancia mental y en la excelencia multiplataforma.
