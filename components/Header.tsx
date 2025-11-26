import React from 'react';
import { Shirt, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-4 md:px-8 border-b border-stone-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-stone-900 text-white rounded-full">
            <Shirt size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Virtual Stylist</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-stone-500 text-sm">
          <Sparkles size={16} />
          <span>Upload an item & let us style it</span>
        </div>
      </div>
    </header>
  );
};
