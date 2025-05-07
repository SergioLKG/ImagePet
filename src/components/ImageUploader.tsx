"use client"

import type React from "react"
import { useState, type ChangeEvent } from "react"
import { Upload } from "lucide-react"

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void
}

const ImageUploader = ({ onImageUpload }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const processFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          onImageUpload(e.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragging ? "border-purple-400 bg-purple-900 bg-opacity-30" : "border-purple-500"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input id="file-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <Upload className="w-8 h-8 mx-auto mb-2 text-purple-300" />
      <p className="text-white font-medium">
        {isDragging ? "¡Suelta para adoptar tu mascota!" : "Haz clic o arrastra una imagen para adoptar"}
      </p>
      <p className="text-purple-300 text-sm mt-1">Cada imagen se convertirá en una mascota virtual</p>
    </div>
  )
}

export default ImageUploader
