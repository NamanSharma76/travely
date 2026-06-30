"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface HeroSliderProps {
  images: string[]
}

export default function HeroSlider({
  images,
}: HeroSliderProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [images.length])

  const next = () => {
    setCurrent((prev) => (prev + 1) % images.length)
  }

  const prev = () => {
    setCurrent((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    )
  }

  if (!images.length) return null

  return (
    <>
      {/* Slides */}
      <div className="absolute inset-0">
        {images.map((img, index) => (
          <div
            key={`${img}-${index}`}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              current === index
                ? "opacity-100"
                : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${img})`,
            }}
          />
        ))}
      </div>

      {/* Left Arrow */}
      <button
        onClick={prev}
        className="
          absolute
          left-6
          top-1/2
          -translate-y-1/2
          z-20
          h-12
          w-12
          rounded-full
          bg-black/40
          backdrop-blur-md
          border
          border-white/20
          hover:bg-black/60
          transition-all
          flex
          items-center
          justify-center
        "
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={next}
        className="
          absolute
          right-6
          top-1/2
          -translate-y-1/2
          z-20
          h-12
          w-12
          rounded-full
          bg-black/40
          backdrop-blur-md
          border
          border-white/20
          hover:bg-black/60
          transition-all
          flex
          items-center
          justify-center
        "
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index
                ? "w-8 bg-white"
                : "w-2 bg-white/50"
            }`}
          />
        ))}
      </div>
    </>
  )
}