import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface UploadZoneProps {
  onImageSelected: (file: File) => void;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <div
        className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out cursor-pointer
          ${dragActive ? "border-stone-800 bg-stone-100 scale-[1.02]" : "border-stone-300 bg-white hover:border-stone-400 hover:bg-stone-50"}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
          disabled={isProcessing}
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-12 h-12 text-stone-400 animate-spin mb-4" />
            <p className="text-stone-500 font-medium">Analyzing your wardrobe item...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center p-6 space-y-4">
            <div className="p-4 bg-stone-100 rounded-full group-hover:bg-white group-hover:shadow-md transition-all">
              <Upload className="w-8 h-8 text-stone-600 group-hover:text-stone-900" />
            </div>
            <div>
              <p className="text-lg font-semibold text-stone-800">
                Click or drag to upload an item
              </p>
              <p className="text-sm text-stone-500 mt-1">
                Upload a skirt, shirt, or accessory to generate outfits
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <ImageIcon size={14} />
              <span>Supports JPG, PNG</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};