"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import BouncingImage from "./components/BouncingImage";
import ImageUploader from "./components/ImageUploader";
import GameStats from "./components/GameStats";
import type { ImagePosition } from "./components/BouncingImage";
import { Heart } from "lucide-react";

interface ImageData {
  id: string;
  url: string;
  happiness: number;
}

interface InteractionPair {
  id1: string;
  id2: string;
  lastTime: number;
}

// Crear un worker para manejar las actualizaciones de posición
const createPositionWorker = () => {
  if (typeof window === "undefined") return null;

  const workerCode = `
    let interval;
    
    self.onmessage = function(e) {
      if (e.data.type === 'start') {
        // Iniciar el intervalo para enviar señales de actualización
        interval = setInterval(() => {
          self.postMessage({ type: 'update' });
        }, 100);
      } else if (e.data.type === 'stop') {
        // Detener el intervalo
        clearInterval(interval);
      }
    };
  `;

  const blob = new Blob([workerCode], { type: "application/javascript" });
  const workerUrl = URL.createObjectURL(blob);

  try {
    return new Worker(workerUrl);
  } catch (e) {
    console.error("Error creating worker:", e);
    return null;
  }
};

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [imagePositions, setImagePositions] = useState<ImagePosition[]>([]);
  const [totalInteractions, setTotalInteractions] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [grabbedImageId, setGrabbedImageId] = useState<string | null>(null);
  const [interactionEffects, setInteractionEffects] = useState<
    { position: { x: number; y: number }; time: number }[]
  >([]);
  // Registro de interacciones recientes para evitar duplicados
  const [recentInteractions, setRecentInteractions] = useState<
    InteractionPair[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const positionUpdateIntervalRef = useRef<number | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const interactionTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const imagesRef = useRef<ImageData[]>([]);

  // Mantener una referencia actualizada de las imágenes
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Inicializar el worker para actualizaciones de posición
  useEffect(() => {
    // Crear el worker solo en el cliente
    if (typeof window !== "undefined") {
      workerRef.current = createPositionWorker();

      if (workerRef.current) {
        // Configurar el listener para el worker
        workerRef.current.onmessage = (e) => {
          if (e.data.type === "update") {
            updatePositions();
          }
        };

        // Iniciar el worker
        workerRef.current.postMessage({ type: "start" });
      } else {
        // Fallback si el worker no se puede crear
        positionUpdateIntervalRef.current = window.setInterval(
          updatePositions,
          100
        );
      }
    }

    return () => {
      // Limpiar el worker o el intervalo
      if (workerRef.current) {
        workerRef.current.postMessage({ type: "stop" });
        workerRef.current.terminate();
      }

      if (positionUpdateIntervalRef.current) {
        clearInterval(positionUpdateIntervalRef.current);
      }

      // Limpiar todos los timeouts de interacción
      Object.values(interactionTimeoutRef.current).forEach((timeout) => {
        clearTimeout(timeout);
      });
    };
  }, []);

  // Cargar puntuación máxima del localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("imagepet-highscore");
    if (savedHighScore) {
      setHighScore(Number.parseInt(savedHighScore));
    }
  }, []);

  // Función para actualizar posiciones
  const updatePositions = useCallback(() => {
    if (imagesRef.current.length > 0 && containerRef.current) {
      const elements = containerRef.current.querySelectorAll("[data-image-id]");
      const newPositions: ImagePosition[] = [];

      elements.forEach((el) => {
        const id = el.getAttribute("data-image-id") || "";
        const rect = el.getBoundingClientRect();
        const containerRect = containerRef.current!.getBoundingClientRect();

        // Encontrar la velocidad actual
        const existingPosition = imagePositions.find((pos) => pos.id === id);

        newPositions.push({
          id,
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top,
          width: rect.width,
          height: rect.height,
          velocityX: existingPosition?.velocityX || 3, // Valor por defecto más alto
          velocityY: existingPosition?.velocityY || 3, // Valor por defecto más alto
        });
      });

      setImagePositions(newPositions);
    }
  }, [imagePositions]);

  // Limpiar interacciones antiguas
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      // Eliminar interacciones más antiguas que 5 segundos
      setRecentInteractions((prev) =>
        prev.filter((interaction) => now - interaction.lastTime < 5000)
      );
    }, 5000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const handleImageUpload = useCallback(
    (newImageUrl: string) => {
      const newId = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      setImages((prev) => [
        ...prev,
        {
          id: newId,
          url: newImageUrl,
          happiness: 70, // Comienzan moderadamente felices
        },
      ]);

      // Forzar una actualización de posiciones después de añadir una nueva imagen
      setTimeout(updatePositions, 100);
    },
    [updatePositions]
  );

  const handleInteraction = useCallback(
    (id1: string, id2: string, position: { x: number; y: number }) => {
      // Crear una clave única para esta interacción
      const interactionKey = id1 < id2 ? `${id1}-${id2}` : `${id2}-${id1}`;

      // Verificar si esta interacción ya ocurrió recientemente
      const isRecent = recentInteractions.some(
        (interaction) =>
          (interaction.id1 === id1 && interaction.id2 === id2) ||
          (interaction.id1 === id2 && interaction.id2 === id1)
      );

      if (isRecent) {
        return; // Evitar contar la misma interacción múltiples veces
      }

      // Registrar esta interacción como reciente
      setRecentInteractions((prev) => [
        ...prev,
        { id1, id2, lastTime: Date.now() },
      ]);

      // Incrementar contador de interacciones
      setTotalInteractions((prev) => {
        const newTotal = prev + 1;
        // Actualizar puntuación máxima si es necesario
        if (newTotal > highScore) {
          setHighScore(newTotal);
          localStorage.setItem("imagepet-highscore", newTotal.toString());
        }
        return newTotal;
      });

      // Añadir efecto visual en el punto de interacción
      setInteractionEffects((prev) => [
        ...prev,
        { position, time: Date.now() },
      ]);

      // Limpiar efectos antiguos usando un timeout con referencia
      if (interactionTimeoutRef.current[interactionKey]) {
        clearTimeout(interactionTimeoutRef.current[interactionKey]);
      }

      interactionTimeoutRef.current[interactionKey] = setTimeout(() => {
        setInteractionEffects((prev) =>
          prev.filter((effect) => Date.now() - effect.time < 1000)
        );
        delete interactionTimeoutRef.current[interactionKey];
      }, 1000);
    },
    [highScore, recentInteractions]
  );

  const handleHappinessChange = useCallback(
    (id: string, newHappiness: number) => {
      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, happiness: newHappiness } : img
        )
      );
    },
    []
  );

  // Manejar arrastre de imágenes
  const handleMouseDown = useCallback((id: string) => {
    setGrabbedImageId(id);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!grabbedImageId || !containerRef.current) return;

      let clientX: number, clientY: number;

      if ("touches" in e) {
        // Es un evento táctil
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        // Es un evento de ratón
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = clientX - containerRect.left;
      const y = clientY - containerRect.top;

      // Actualizar la posición de la imagen arrastrada
      const grabbedImage = document.querySelector(
        `[data-image-id="${grabbedImageId}"]`
      ) as HTMLElement;
      if (grabbedImage) {
        const width = grabbedImage.offsetWidth;
        const height = grabbedImage.offsetHeight;

        // Mantener dentro de los límites del contenedor
        const newX = Math.max(
          0,
          Math.min(containerRect.width - width, x - width / 2)
        );
        const newY = Math.max(
          0,
          Math.min(containerRect.height - height, y - height / 2)
        );

        grabbedImage.style.left = `${newX}px`;
        grabbedImage.style.top = `${newY}px`;

        // Aumentar felicidad al acariciar (mover)
        const imageData = imagesRef.current.find(
          (img) => img.id === grabbedImageId
        );
        if (imageData && imageData.happiness < 100) {
          handleHappinessChange(
            grabbedImageId,
            Math.min(100, imageData.happiness + 0.5)
          );
        }
      }
    },
    [grabbedImageId, handleHappinessChange]
  );

  const handleMouseUp = useCallback(() => {
    setGrabbedImageId(null);
  }, []);

  // Memoizar los efectos de interacción para evitar re-renderizados innecesarios
  const memoizedInteractionEffects = useMemo(() => {
    return interactionEffects.map((effect, index) => (
      <div
        key={`effect-${index}-${effect.time}`}
        className="absolute w-12 h-12 -ml-6 -mt-6 pointer-events-none"
        style={{
          left: `${effect.position.x}px`,
          top: `${effect.position.y}px`,
          zIndex: 50,
        }}
      >
        <Heart
          className="w-full h-full text-pink-500 animate-pulse"
          fill="currentColor"
          style={{
            opacity: 1 - (Date.now() - effect.time) / 1000,
          }}
        />
      </div>
    ));
  }, [interactionEffects]);

  return (
    <div
      className="relative h-screen w-full bg-gradient-to-b from-blue-700 to-slate-900 overflow-hidden"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Fondo con efecto de brillo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 to-transparent opacity-10"></div>

      {/* Efectos de interacción */}
      {memoizedInteractionEffects}

      {/* Contenedor de imágenes rebotando */}
      <div className="absolute inset-0">
        {images.map((image) => (
          <div
            key={image.id}
            data-image-id={image.id}
            onMouseDown={() => handleMouseDown(image.id)}
            onTouchStart={() => handleMouseDown(image.id)}
          >
            <BouncingImage
              id={image.id}
              imageUrl={image.url}
              containerRef={containerRef}
              onInteraction={handleInteraction}
              allImages={imagePositions || []} // Asegurarnos de que siempre pasamos un array
              happiness={image.happiness}
              onHappinessChange={handleHappinessChange}
              isGrabbed={grabbedImageId === image.id}
            />
          </div>
        ))}
      </div>

      {/* Panel de estadísticas */}
      <GameStats
        totalInteractions={totalInteractions}
        highScore={highScore}
        petCount={images.length}
      />

      {/* Panel de control */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 p-4 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-2xl font-bold mb-2 text-center">
            Imagepet
          </h1>
          <p className="text-blue-200 text-center mb-4 text-sm">
            {images.length === 0
              ? "Sube imágenes para crear mascotas virtuales"
              : "¡Arrastra tus mascotas para hacerlas felices!"}
          </p>
          <ImageUploader onImageUpload={handleImageUpload} />

          {images.length === 0 && (
            <p className="text-white text-center mt-4 text-sm">
              Sube una imagen para adoptar tu primera mascota virtual
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
