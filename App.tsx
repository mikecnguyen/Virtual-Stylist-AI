import React, { useState } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ImageEditor } from './components/ImageEditor';
import { OutfitStyle, GeneratedImage } from './types';
import { generateOutfit, fileToGenerativePart } from './services/geminiService';
import { Loader2, AlertCircle, Sparkles, Expand } from 'lucide-react';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<GeneratedImage | null>(null);
  const [outfits, setOutfits] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const handleImageSelect = async (file: File) => {
    try {
      setError(null);
      setIsGenerating(true);
      setOutfits([]); // Clear previous results
      
      const base64 = await fileToGenerativePart(file);
      const original: GeneratedImage = {
        id: 'original',
        url: `data:${file.type};base64,${base64}`,
        description: 'Original Item',
        isOriginal: true
      };
      setOriginalImage(original);

      // Start generating outfits in parallel
      const styles = [
        OutfitStyle.CASUAL, 
        OutfitStyle.BUSINESS, 
        OutfitStyle.NIGHT_OUT,
        OutfitStyle.SPORTY,
        OutfitStyle.FORMAL
      ];
      
      const promises = styles.map(async (style) => {
        try {
          const url = await generateOutfit(base64, style);
          return {
            id: `outfit-${style}`,
            url,
            description: `${style} Outfit`,
            style,
            isOriginal: false
          } as GeneratedImage;
        } catch (err) {
          console.error(`Failed to generate ${style} outfit`, err);
          return null;
        }
      });

      const results = await Promise.all(promises);
      const successfulOutfits = results.filter((item): item is GeneratedImage => item !== null);
      
      if (successfulOutfits.length === 0) {
        setError("Could not generate any outfits. Please check your API key or try a different image.");
      } else {
        setOutfits(successfulOutfits);
      }
    } catch (err) {
      setError("An error occurred while processing your image.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateImage = (id: string, newUrl: string) => {
    if (originalImage && originalImage.id === id) {
      setOriginalImage({ ...originalImage, url: newUrl });
    } else {
      setOutfits(prev => prev.map(outfit => 
        outfit.id === id ? { ...outfit, url: newUrl } : outfit
      ));
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
        
        {/* Intro / Upload Section */}
        <section className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {!originalImage && (
             <>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">
                Redefine your wardrobe.
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-8">
                Upload a single item—a difficult skirt, a bold jacket, or unique shoes—and let our AI stylist create perfect looks for every occasion.
              </p>
            </>
           )}
           
           {!originalImage || isGenerating ? (
             <UploadZone onImageSelected={handleImageSelect} isProcessing={isGenerating} />
           ) : null}

           {error && (
             <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg inline-flex items-center gap-2 border border-red-100">
               <AlertCircle size={20} />
               {error}
             </div>
           )}
        </section>

        {/* Results Section */}
        {originalImage && !isGenerating && (
          <div className="space-y-12 animate-in fade-in duration-1000">
            
            {/* Original Item Display (Small) */}
            <div className="flex flex-col items-center">
               <h3 className="text-sm font-semibold text-stone-400 uppercase tracking-widest mb-4">The Centerpiece</h3>
               <div className="relative group cursor-pointer" onClick={() => setSelectedImage(originalImage)}>
                  <img 
                    src={originalImage.url} 
                    alt="Original" 
                    className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-2xl shadow-md border-4 border-white transition-transform duration-300 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-all flex items-center justify-center">
                    <Sparkles className="text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all" />
                  </div>
               </div>
               <button 
                onClick={() => setOriginalImage(null)}
                className="mt-4 text-sm text-stone-500 hover:text-stone-800 underline underline-offset-4"
               >
                 Upload a different item
               </button>
            </div>

            <div className="border-t border-stone-200" />

            {/* Generated Outfits Grid */}
            <div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-8 text-center">Curated Collections</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {outfits.map((outfit) => (
                  <div key={outfit.id} className="flex flex-col group">
                    <div className="relative overflow-hidden rounded-xl bg-white shadow-sm hover:shadow-xl transition-all duration-500 ease-out border border-stone-100">
                      <div className="aspect-[3/4] overflow-hidden bg-stone-100 relative">
                        <img 
                          src={outfit.url} 
                          alt={outfit.description} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
                          <button 
                            onClick={() => setSelectedImage(outfit)}
                            className="bg-white text-stone-900 px-6 py-2 rounded-full font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center gap-2 hover:bg-stone-900 hover:text-white"
                          >
                            <Expand size={16} />
                            View & Edit
                          </button>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-bold tracking-widest uppercase text-stone-400">Style</span>
                           <Sparkles size={14} className="text-amber-400" />
                        </div>
                        <h4 className="text-xl font-serif font-bold text-stone-900">{outfit.style}</h4>
                        <p className="text-sm text-stone-500 mt-2 line-clamp-2">
                          A curated {outfit.style?.toLowerCase()} look featuring your item.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedImage && (
        <ImageEditor 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)}
          onUpdateImage={handleUpdateImage}
        />
      )}
    </div>
  );
};

export default App;