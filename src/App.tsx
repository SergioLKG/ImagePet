"use client";

import { useState, useRef } from "react";
import BouncingImage from "./components/BouncingImage";
import ImageUploader from "./components/ImageUploader";

function App() {
  const [images, setImages] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (newImageUrl: string) => {
    setImages((prev) => [...prev, newImageUrl]);
  };

  return (
    <div
      className="relative h-screen w-full bg-gradient-to-b from-blue-700 to-slate-500 overflow-hidden"
      ref={containerRef}
    >
      {/* Fondo con efecto de brillo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-300 to-transparent opacity-20"></div>

      {/* Contenedor de imágenes rebotando */}
      <div className="absolute inset-0">
        {images.map((imageUrl, index) => (
          <BouncingImage
            key={`${imageUrl}-${index}`}
            imageUrl={imageUrl}
            containerRef={containerRef}
          />
        ))}
      </div>

      {/* Panel de control */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-80 p-4 backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <h1 className="text-white text-2xl font-bold mb-2 text-center">
            Imagepet
          </h1>
          <p className="text-blue-200 text-center mb-4 text-sm">
            Tus imágenes cobran vida como mascotas virtuales
          </p>
          <ImageUploader onImageUpload={handleImageUpload} />

          {images.length === 0 && (
            <p className="text-white text-center mt-4 text-sm">
              Sube una imagen para adoptar tu primera mascota virtual
            </p>
          )}

          {images.length > 0 && (
            <p className="text-white text-center mt-4 text-sm">
              ¡Tienes {images.length} mascota{images.length !== 1 ? "s" : ""}{" "}
              virtual{images.length !== 1 ? "es" : ""}!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
