# MindTrack - App de Productividad y Hábitos

MindTrack es una aplicación web y móvil asombrosamente rápida, diseñada para gestionar todas las fases de la productividad diaria: construcción de hábitos, registro de actividades clave, toma de notas enriquecidas y gestión optimizada de lectura.

## 🚀 Características Principales

*   **Aplicación Instalable (PWA):** Soporte PWA nativo para instalación en Android y iOS sin tiendas, con funcionamiento fluido y acceso rápido.
*   **Historial de Registro Diario:** Sección dedicada para visualizar el progreso histórico. Incluye una barra de **"Hoy" en tiempo real** (racha y porcentaje actual) y registros automáticos de días anteriores.
*   **Reinicio Diario Automático:** La aplicación detecta automáticamente el cambio de día, archiva el progreso del día anterior y limpia los hábitos para comenzar una nueva jornada sin intervención del usuario.
*   **Sincronización en Tiempo Real:** Interfaz Local-First hiper rápida. Todos los datos se sincronizan asíncronamente con **Supabase**, garantizando que nunca pierdas tu racha.
*   **Gestión Híbrida de Hábitos:** Calcula racha diaria de constancia y días perfectos con un diseño altamente estético y adaptable (Dark/Light mode).
*   **Editor de Notas Avanzado:** Refactorizado para soportar eventos táctiles móviles y preservar selecciones de texto al aplicar formatos complejos.
*   **Biblioteca Digital Segura:** Visualizador PDF optimizado con algoritmos anti-bloqueo para visualizar documentos pesados directamente en el móvil.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React + Vite - Renderizado responsivo modular.
*   **Servicio Backend & DB:** Supabase - Base de datos PostgreSQL, Autenticación y Storage.
*   **Estilos:** Tailwind CSS - Diseño Mobile-First con utilidades modernas.
*   **Iconos:** Lucide React.

## 📦 Arquitectura General

MindTrack utiliza una arquitectura de **Estado Inmediato**. Los cambios se reflejan al instante en la UI y se guardan en `localStorage` antes de sincronizarse con las tablas de Supabase (`habits`, `notes`, `habit_history`, etc.). El flujo de reset diario asegura la integridad de los datos históricos al finalizar cada ciclo de 24 horas.

## 💻 Instalación y Ejecución Local

1.  **Clonado:** Descarga el repositorio.
2.  **Dependencias:** `npm install`
3.  **Configuración:** Configura `.env` con tus URLs de Supabase.
4.  **Servidor de desarrollo:** `npm run dev`
5.  **Producción:** `npm run build` para generar la PWA final.

> Desarrollada para transformar la disciplina en un hábito visual y gratificante.
