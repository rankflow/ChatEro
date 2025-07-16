'use client';

import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiClick: (emoji: string) => void;
}

export default function EmojiPickerComponent({ onEmojiClick }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Cerrar picker cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEmojiClick = (emojiObject: any) => {
    onEmojiClick(emojiObject.emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-lg transition-all duration-300"
        type="button"
      >
        <Smile className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={350}
            height={400}
            searchDisabled={false}
            skinTonesDisabled={true}
            lazyLoadEmojis={true}
            previewConfig={{
              showPreview: false
            }}
          />
        </div>
      )}
    </div>
  );
} 