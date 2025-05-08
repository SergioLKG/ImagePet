"use client";

import type React from "react";
import {
  useState,
  useEffect,
  useRef,
  type RefObject,
  memo,
  useCallback,
} from "react";
import { Heart } from "lucide-react";

interface BouncingImageProps {
  id: string;
  imageUrl: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onInteraction: (
    id1: string,
    id2: string,
    position: { x: number; y: number }
  ) => void;
  allImages: ImagePosition[];
  happiness: number;
  onHappinessChange: (id: string, newHappiness: number) => void;
  isGrabbed?: boolean;
}

export interface ImagePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
}

// Sistema global de animación para todas las imágenes
const animationTimers: { [key: string]: number } = {};
const animationStates: { [key: string]: { running: boolean } } = {};

// Función para generar velocidades aleatorias pero siempre significativas
const generateRandomVelocity = () => {
  const speed = 2 + Math.random() * 3; // Entre 2 y 5
  const angleRad = Math.random() * Math.PI * 2; // Ángulo aleatorio en radianes
  return {
    x: Math.cos(angleRad) * speed,
    y: Math.sin(angleRad) * speed,
  };
};

const BouncingImage = memo(
  ({
    id,
    imageUrl,
    containerRef,
    onInteraction,
    allImages,
    happiness,
    onHappinessChange,
    isGrabbed = false,
  }: BouncingImageProps) => {
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [dimensions, setDimensions] = useState({ width: 100, height: 100 });
    const [rotation, setRotation] = useState(0);
    const [scale, setScale] = useState(1);
    const imageRef = useRef<HTMLDivElement>(null);
    const lastTimeRef = useRef<number>(0);
    const stuckCounterRef = useRef<number>(0);
    const lastPositionRef = useRef({ x: 0, y: 0 });
    const positionRef = useRef({ x: 50, y: 50 });
    const velocityRef = useRef({ x: 3, y: 3 });
    const lastInteractionTimeRef = useRef<number>(0);
    const happinessRef = useRef<number>(happiness);

    // Actualizar la referencia cuando cambia la felicidad
    useEffect(() => {
      happinessRef.current = happiness;
    }, [happiness]);

    // Inicializar posición aleatoria y velocidad
    useEffect(() => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // Posición inicial aleatoria (evitando los bordes)
        const initialX = 50 + Math.random() * (containerWidth - 150);
        const initialY = 50 + Math.random() * (containerHeight - 150);

        setPosition({
          x: initialX,
          y: initialY,
        });
        positionRef.current = { x: initialX, y: initialY };

        // Guardar la posición inicial para detección de estancamiento
        lastPositionRef.current = { x: initialX, y: initialY };

        // Velocidad inicial con dirección aleatoria pero magnitud significativa
        const newVelocity = generateRandomVelocity();
        velocityRef.current = newVelocity;
      }

      // Cargar la imagen para obtener sus dimensiones reales
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Mantener la proporción pero limitar el tamaño
        const maxSize = 120;
        const ratio = img.width / img.height;
        let width, height;

        if (ratio > 1) {
          width = maxSize;
          height = maxSize / ratio;
        } else {
          height = maxSize;
          width = maxSize * ratio;
        }

        setDimensions({ width, height });
      };

      // Inicializar el estado de animación para esta imagen
      animationStates[id] = { running: true };

      return () => {
        // Limpiar animación al desmontar
        if (animationTimers[id]) {
          window.clearTimeout(animationTimers[id]);
          delete animationTimers[id];
        }
        delete animationStates[id];
      };
    }, [imageUrl, containerRef, id]);

    // Función para detectar interacciones amistosas con distancia mínima
    const checkInteractions = useCallback(() => {
      const currentTime = Date.now();
      // Evitar múltiples interacciones en un período corto de tiempo (800ms)
      if (currentTime - lastInteractionTimeRef.current < 800) return;

      // Verificar que allImages existe y es un array
      if (!allImages || !Array.isArray(allImages)) return;

      allImages.forEach((otherImage) => {
        if (otherImage.id !== id) {
          // Verificar si hay interacción (distancia cercana)
          const centerX = positionRef.current.x + dimensions.width / 2;
          const centerY = positionRef.current.y + dimensions.height / 2;
          const otherCenterX = otherImage.x + otherImage.width / 2;
          const otherCenterY = otherImage.y + otherImage.height / 2;

          // Calcular distancia entre centros
          const distance = Math.sqrt(
            Math.pow(centerX - otherCenterX, 2) +
              Math.pow(centerY - otherCenterY, 2)
          );

          // Si están lo suficientemente cerca pero no demasiado (para evitar interacciones constantes)
          const minDistance = (dimensions.width + otherImage.width) / 2;
          const maxDistance = minDistance * 1.5;

          if (distance < maxDistance && distance > minDistance * 0.8) {
            // Punto medio de la interacción
            const interactionPoint = {
              x: (centerX + otherCenterX) / 2,
              y: (centerY + otherCenterY) / 2,
            };

            // Notificar la interacción
            onInteraction(id, otherImage.id, interactionPoint);
            lastInteractionTimeRef.current = currentTime;

            // Efecto visual de felicidad
            setScale(1.2);
            setTimeout(() => setScale(1), 300);

            // Rotación alegre
            setRotation(Math.random() * 20 - 10);

            // Aumentar felicidad con cada interacción
            onHappinessChange(id, Math.min(100, happinessRef.current + 15));

            // Cambiar ligeramente la dirección para que parezca que juegan
            const newVelocityX =
              velocityRef.current.x * 0.8 + otherImage.velocityX * 0.2;
            const newVelocityY =
              velocityRef.current.y * 0.8 + otherImage.velocityY * 0.2;

            // Asegurar que la velocidad nunca sea cercana a cero
            const minSpeed = 2;
            const vx =
              Math.abs(newVelocityX) < minSpeed
                ? newVelocityX >= 0
                  ? minSpeed
                  : -minSpeed
                : newVelocityX;
            const vy =
              Math.abs(newVelocityY) < minSpeed
                ? newVelocityY >= 0
                  ? minSpeed
                  : -minSpeed
                : newVelocityY;

            velocityRef.current = { x: vx, y: vy };
          }
        }
      });
    }, [allImages, dimensions, id, onHappinessChange, onInteraction]);

    // Sistema de animación basado en setTimeout en lugar de requestAnimationFrame
    useEffect(() => {
      if (isGrabbed) return; // No animar si está siendo arrastrado

      const runAnimation = () => {
        if (!animationStates[id]?.running) return;

        if (!containerRef.current) {
          // Programar la próxima animación
          animationTimers[id] = window.setTimeout(runAnimation, 16);
          return;
        }

        const now = Date.now();
        // Calcular delta time para animación suave independiente de framerate
        if (!lastTimeRef.current) lastTimeRef.current = now;
        const deltaTime = Math.min(32, now - lastTimeRef.current) / 16; // Normalizado a ~60fps, con límite para evitar saltos grandes
        lastTimeRef.current = now;

        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        // Reducir felicidad muy gradualmente (solo cada ~5 segundos)
        if (happinessRef.current > 0 && Math.random() > 0.995) {
          onHappinessChange(id, happinessRef.current - 1);
        }

        // Ajustar velocidad basada en felicidad
        const happinessFactor = Math.max(0.5, happinessRef.current / 100);

        // Verificar si la imagen se está moviendo
        const currentVelocity = Math.sqrt(
          velocityRef.current.x * velocityRef.current.x +
            velocityRef.current.y * velocityRef.current.y
        );
        if (currentVelocity < 1) {
          // Si la velocidad es muy baja, darle un impulso significativo
          const newVelocity = generateRandomVelocity();
          velocityRef.current = newVelocity;
        }

        // Calcular nueva posición con delta time para movimiento suave
        let newX =
          positionRef.current.x +
          velocityRef.current.x * happinessFactor * deltaTime;
        let newY =
          positionRef.current.y +
          velocityRef.current.y * happinessFactor * deltaTime;
        let newVelocityX = velocityRef.current.x;
        let newVelocityY = velocityRef.current.y;
        let shouldRotate = false;

        // Rebote en los bordes horizontales
        if (newX <= 0 || newX + dimensions.width >= containerWidth) {
          newVelocityX = -newVelocityX * 1.1; // Añadir un poco de energía en el rebote
          newX = newX <= 0 ? 0 : containerWidth - dimensions.width;
          shouldRotate = true;
        }

        // Rebote en los bordes verticales
        if (newY <= 0 || newY + dimensions.height >= containerHeight) {
          newVelocityY = -newVelocityY * 1.1; // Añadir un poco de energía en el rebote
          newY = newY <= 0 ? 0 : containerHeight - dimensions.height;
          shouldRotate = true;
        }

        // Actualizar velocidad si cambió
        if (
          newVelocityX !== velocityRef.current.x ||
          newVelocityY !== velocityRef.current.y
        ) {
          velocityRef.current = { x: newVelocityX, y: newVelocityY };
        }

        // Añadir un pequeño giro aleatorio al rebotar
        if (shouldRotate) {
          setRotation(Math.random() * 20 - 10);
        }

        // Detectar si la mascota está estancada comparando con la posición anterior
        const distance = Math.sqrt(
          Math.pow(newX - lastPositionRef.current.x, 2) +
            Math.pow(newY - lastPositionRef.current.y, 2)
        );

        if (distance < 0.5) {
          stuckCounterRef.current += 1;

          // Si está estancada por más de 5 frames, darle un impulso aleatorio
          if (stuckCounterRef.current > 5) {
            const newVelocity = generateRandomVelocity();
            velocityRef.current = newVelocity;
            stuckCounterRef.current = 0;
          }
        } else {
          stuckCounterRef.current = 0;
        }

        // Actualizar la última posición conocida
        lastPositionRef.current = { x: newX, y: newY };
        positionRef.current = { x: newX, y: newY };

        // Actualizar la posición en el estado (esto causa re-renderizado)
        // Usamos un throttle para reducir actualizaciones de estado
        if (
          Math.abs(newX - position.x) > 1 ||
          Math.abs(newY - position.y) > 1
        ) {
          setPosition({ x: newX, y: newY });
        }

        // Verificar interacciones con otras mascotas
        checkInteractions();

        // Comportamiento aleatorio ocasional para que parezcan más vivas (solo ~cada 5 segundos)
        if (Math.random() > 0.995) {
          const newVx = velocityRef.current.x + (Math.random() * 2 - 1) * 0.5;
          const newVy = velocityRef.current.y + (Math.random() * 2 - 1) * 0.5;

          // Asegurar velocidad mínima
          const minSpeed = 2;
          const vx =
            Math.abs(newVx) < minSpeed
              ? newVx >= 0
                ? minSpeed
                : -minSpeed
              : newVx;
          const vy =
            Math.abs(newVy) < minSpeed
              ? newVy >= 0
                ? minSpeed
                : -minSpeed
              : newVy;

          velocityRef.current = { x: vx, y: vy };
        }

        // Programar la próxima animación
        animationTimers[id] = window.setTimeout(runAnimation, 16);
      };

      // Iniciar la animación
      animationStates[id] = { running: true };
      runAnimation();

      return () => {
        // Detener la animación al desmontar
        animationStates[id] = { running: false };
        if (animationTimers[id]) {
          window.clearTimeout(animationTimers[id]);
        }
      };
    }, [
      dimensions,
      isGrabbed,
      id,
      checkInteractions,
      onHappinessChange,
      containerRef,
      position.x,
      position.y,
    ]);

    // Permitir arrastrar la imagen
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      // La lógica de arrastre se maneja en el componente padre
    };

    // Manejar eventos táctiles
    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      // La lógica de arrastre se maneja en el componente padre
    };

    return (
      <div
        ref={imageRef}
        className={`absolute transition-all duration-200 ease-in-out cursor-pointer ${
          happiness < 30 ? "opacity-70" : ""
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          zIndex: isGrabbed ? 100 : 10,
          willChange: "transform, left, top", // Optimización para navegadores modernos
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <img
          src={imageUrl || "/placeholder.svg"}
          alt="Mascota virtual"
          className="w-full h-full object-contain rounded-full shadow-lg"
          style={{
            filter: `drop-shadow(0 0 8px rgba(255, 255, 255, 0.5)) brightness(${
              (happiness / 100) * 0.3 + 0.7
            })`,
          }}
          draggable={false}
          loading="eager"
        />

        {/* Indicador de felicidad */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center">
          <Heart
            className={`w-5 h-5 ${
              happiness > 70
                ? "text-red-500"
                : happiness > 40
                ? "text-pink-400"
                : "text-gray-400"
            }`}
            fill={happiness > 30 ? "currentColor" : "none"}
          />
          <div className="ml-1 w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-500 to-red-500 transition-all duration-300"
              style={{ width: `${happiness}%` }}
            />
          </div>
        </div>
      </div>
    );
  }
);

BouncingImage.displayName = "BouncingImage";

export default BouncingImage;
