# Imagepet - Tus imágenes cobran vida

## 📝 Descripción

Imagepet es una aplicación web interactiva que convierte tus imágenes en mascotas virtuales que cobran vida en tu pantalla. Inspirada en los clásicos protectores de pantalla de Windows XP, esta aplicación permite que tus imágenes reboten por la pantalla, interactúen entre sí y respondan a tus acciones.

## ✨ Características principales

- **Mascotas virtuales**: Convierte cualquier imagen en una mascota virtual animada
- **Movimiento realista**: Las mascotas se mueven de forma natural por la pantalla con física de rebote
- **Interacciones sociales**: Las mascotas interactúan entre sí cuando están cerca
- **Sistema de felicidad**: Cada mascota tiene un nivel de felicidad que aumenta con las interacciones
- **Arrastre interactivo**: Puedes arrastrar las mascotas con el ratón o pantalla táctil
- **Estadísticas de juego**: Seguimiento de interacciones, récord y número de mascotas
- **Efectos visuales**: Animaciones y efectos visuales que mejoran la experiencia

## 🛠️ Tecnologías utilizadas

- **React**: Biblioteca para construir interfaces de usuario
- **TypeScript**: Superset de JavaScript con tipado estático
- **Vite**: Herramienta de construcción rápida para aplicaciones web modernas
- **Tailwind CSS**: Framework CSS utilitario para diseño rápido y responsivo
- **Lucide React**: Biblioteca de iconos SVG
- **Web Workers**: Para optimizar el rendimiento de las animaciones

## 🚀 Instalación y uso

1. Clona este repositorio:
   \`\`\`bash
   git clone https://github.com/tu-usuario/imagepet.git
   cd imagepet
   \`\`\`

2. Instala las dependencias:
   \`\`\`bash
   npm install
   \`\`\`

3. Inicia el servidor de desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Abre tu navegador en `http://localhost:5173`

## 📖 Cómo usar

1. **Añadir mascotas**: Haz clic en el área de carga o arrastra una imagen para crear una nueva mascota
2. **Interactuar con mascotas**: Arrastra las mascotas con el ratón o pantalla táctil para aumentar su felicidad
3. **Observar interacciones**: Las mascotas interactuarán entre sí cuando estén cerca, generando corazones y aumentando su felicidad
4. **Seguir estadísticas**: Observa el contador de interacciones, récord y número de mascotas en la esquina superior derecha

## 🏗️ Arquitectura del proyecto

El proyecto está estructurado de la siguiente manera:

- **src/App.tsx**: Componente principal que gestiona el estado global y la lógica de la aplicación
- **src/components/BouncingImage.tsx**: Componente que maneja la lógica de movimiento e interacción de cada mascota
- **src/components/ImageUploader.tsx**: Componente para cargar nuevas imágenes
- **src/components/GameStats.tsx**: Componente para mostrar estadísticas del juego

### Sistema de animación

El sistema de animación utiliza un enfoque basado en `setTimeout` en lugar de `requestAnimationFrame` para garantizar un rendimiento constante incluso cuando el navegador está ocupado con otros eventos. Además, se implementa un sistema de detección de estancamiento que asegura que las mascotas siempre estén en movimiento.

### Optimizaciones de rendimiento

- Uso de `memo` para evitar re-renderizados innecesarios
- Referencias (`useRef`) para mantener valores actualizados sin causar re-renderizados
- Web Workers para separar la lógica de animación del hilo principal
- Throttling de actualizaciones de estado para reducir la carga de renderizado
- Propiedades CSS como `will-change` para optimizar las animaciones

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Créditos

Desarrollado con ❤️ por [Tu Nombre]

Iconos proporcionados por [Lucide React](https://lucide.dev/)
