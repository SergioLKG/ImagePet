"use client"

import { useState, useEffect, useRef, type RefObject } from "react"

interface BouncingImageProps {
  imageUrl: string
  containerRef: RefObject<HTMLDivElement>
}

const BouncingImage = ({ imageUrl, containerRef }: BouncingImageProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [velocity, setVelocity] = useState({ x: 3, y: 2 })
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 })
  const [rotation, setRotation] = useState(0)
  const imageRef = useRef<HTMLImageElement>(null)
  const animationRef = useRef<number>(0)

  // Inicializar posición aleatoria y velocidad
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight

      // Posición inicial aleatoria
      setPosition({
        x: Math.random() * (containerWidth - dimensions.width),
        y: Math.random() * (containerHeight - dimensions.height),
      })

      // Velocidad aleatoria (entre 2 y 5)
      setVelocity({
        x: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3),
        y: (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3),
      })
    }

    // Cargar la imagen para obtener sus dimensiones reales
    const img = new Image()
    img.src = imageUrl
    img.onload = () => {
      // Mantener la proporción pero limitar el tamaño
      const maxSize = 120
      const ratio = img.width / img.height
      let width, height

      if (ratio > 1) {
        width = maxSize
        height = maxSize / ratio
      } else {
        height = maxSize
        width = maxSize * ratio
      }

      setDimensions({ width, height })
    }
  }, [imageUrl])

  // Efecto de animación
  useEffect(() => {
    const animate = () => {
      if (!containerRef.current) return

      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight

      setPosition((prevPos) => {
        let newX = prevPos.x + velocity.x
        let newY = prevPos.y + velocity.y
        let newVelocityX = velocity.x
        let newVelocityY = velocity.y
        let shouldRotate = false

        // Rebote en los bordes horizontales
        if (newX <= 0 || newX + dimensions.width >= containerWidth) {
          newVelocityX = -newVelocityX
          newX = newX <= 0 ? 0 : containerWidth - dimensions.width
          shouldRotate = true
        }

        // Rebote en los bordes verticales
        if (newY <= 0 || newY + dimensions.height >= containerHeight) {
          newVelocityY = -newVelocityY
          newY = newY <= 0 ? 0 : containerHeight - dimensions.height
          shouldRotate = true
        }

        // Actualizar velocidad si cambió
        if (newVelocityX !== velocity.x || newVelocityY !== velocity.y) {
          setVelocity({ x: newVelocityX, y: newVelocityY })
        }

        // Añadir un pequeño giro aleatorio al rebotar
        if (shouldRotate) {
          setRotation(Math.random() * 30 - 15)
        }

        return { x: newX, y: newY }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [velocity, dimensions])

  return (
    <div
      className="absolute transition-transform duration-300 ease-in-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <img
        ref={imageRef}
        src={imageUrl || "/placeholder.svg"}
        alt="Mascota virtual"
        className="w-full h-full object-contain rounded-full shadow-lg"
        style={{
          filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))",
        }}
      />
    </div>
  )
}

export default BouncingImage
