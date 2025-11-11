"use client";

import { useEffect, useState } from "react";
import { SlideRenderer } from "./slide-renderer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { createSlide } from "@/lib/actions/slides";
import { useRouter } from "next/navigation";

interface SlideViewerProps {
  presentation: any;
}

export function SlideViewer({ presentation }: SlideViewerProps) {
  const { slides, theme } = presentation;
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const slideElements = document.querySelectorAll('[data-slide-index]');
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      slideElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + window.scrollY;
        const elementBottom = elementTop + rect.height;

        if (scrollPosition >= elementTop && scrollPosition <= elementBottom) {
          setActiveSlide(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [slides.length]);

  const handleAddSlide = async (afterIndex: number) => {
    setIsAdding(true);
    const result = await createSlide({
      presentationId: presentation.id,
      layout: "blank",
      order: afterIndex + 1,
    });

    if (result.success) {
      router.refresh();
    }
    setIsAdding(false);
  };

  const scrollToSlide = (index: number) => {
    const element = document.querySelector(`[data-slide-index="${index}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] overflow-auto scroll-smooth">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="space-y-8">
          {slides.map((slide: any, index: number) => (
            <div key={slide.id}>
              {/* Slide Container */}
              <div
                data-slide-index={index}
                className="relative group"
                id={`slide-${index}`}
              >
                {/* Slide Number Badge */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Slide {index + 1}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    CONTENT
                  </span>
                </div>

                {/* Slide Renderer */}
                <SlideRenderer
                  slide={slide}
                  theme={theme}
                  slideNumber={index + 1}
                  totalSlides={slides.length}
                />
              </div>

              {/* Add Slide Button Between Slides */}
              {index < slides.length - 1 && (
                <div className="flex items-center justify-center py-6">
                  <Button
                    onClick={() => handleAddSlide(index)}
                    disabled={isAdding}
                    size="icon"
                    className="rounded-full w-12 h-12 shadow-lg hover:scale-110 transition-transform"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* Add Slide Button After Last Slide */}
              {index === slides.length - 1 && (
                <div className="flex items-center justify-center py-8">
                  <Button
                    onClick={() => handleAddSlide(index)}
                    disabled={isAdding}
                    size="icon"
                    className="rounded-full w-12 h-12 shadow-lg hover:scale-110 transition-transform"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Slide Navigation Sidebar */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        {slides.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => scrollToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              activeSlide === index
                ? 'bg-neutral-900 dark:bg-neutral-100 w-3 h-3'
                : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-500 dark:hover:bg-neutral-400'
            }`}
            title={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
