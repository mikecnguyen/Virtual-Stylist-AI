import React, { useState } from 'react';
import { X, Send, Sparkles, Download, Wand2, User, Play, Loader2, Video as VideoIcon } from 'lucide-react';
import { GeneratedImage } from '../types';
import { editImage, generateModelLook, generateRunwayVideo } from '../services/geminiService';

interface ImageEditorProps {
  image: GeneratedImage;
  onClose: () => void;
  onUpdateImage: (id: string, newUrl: string) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ image, onClose, onUpdateImage }) => {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(image.url);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(image.videoUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const getBase64FromUrl = (url: string) => {
    // Basic extraction assuming data URI. For object URIs or external URLs, 
    // fetch logic would be needed, but we mostly deal with data URIs here.
    return url.split(',')[1];
  };

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    
    setIsEditing(true);
    setCurrentVideoUrl(null); // Reset video if editing image
    setError(null);
    setLoadingMessage("Gemini is redesigning...");
    
    try {
      const base64Data = getBase64FromUrl(currentImageUrl);
      if (!base64Data) throw new Error("Invalid image data");

      const newImageUrl = await editImage(base64Data, prompt);
      setCurrentImageUrl(newImageUrl);
      onUpdateImage(image.id, newImageUrl);
      setPrompt('');
    } catch (err) {
      setError("Failed to edit image. Please try again.");
    } finally {
      setIsEditing(false);
      setLoadingMessage('');
    }
  };

  const handleTryOnModel = async () => {
    setIsEditing(true);
    setCurrentVideoUrl(null);
    setError(null);
    setLoadingMessage("Styling a model for you...");

    try {
      const base64Data = getBase64FromUrl(currentImageUrl);
      if (!base64Data) throw new Error("Invalid image data");

      const newImageUrl = await generateModelLook(base64Data);
      setCurrentImageUrl(newImageUrl);
      onUpdateImage(image.id, newImageUrl);
    } catch (err) {
      setError("Failed to generate model look.");
    } finally {
      setIsEditing(false);
      setLoadingMessage('');
    }
  };

  const handleRunwayWalk = async () => {
    setIsVideoGenerating(true);
    setError(null);
    setLoadingMessage("Preparing the runway (this may take a minute)...");

    try {
      const base64Data = getBase64FromUrl(currentImageUrl);
      if (!base64Data) throw new Error("Invalid image data");

      const videoUrl = await generateRunwayVideo(base64Data);
      setCurrentVideoUrl(videoUrl);
      // We don't update the parent `videoUrl` permanently here to keep it simple, 
      // but you could call an `onUpdateVideo` prop if needed.
    } catch (err) {
      console.error(err);
      setError("Failed to generate video. Make sure you have a paid API key selected.");
    } finally {
      setIsVideoGenerating(false);
      setLoadingMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEdit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row h-[90vh]">
        
        {/* Main Preview Area */}
        <div className="relative flex-1 bg-stone-900 flex items-center justify-center p-6 overflow-hidden">
          
          {/* Loading Overlay */}
          {(isEditing || isVideoGenerating) && (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-900/80 z-20 backdrop-blur-sm">
              <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-xl">
                <Loader2 className="w-10 h-10 text-stone-900 animate-spin mb-4" />
                <span className="font-medium text-stone-900 text-center animate-pulse">
                  {loadingMessage}
                </span>
              </div>
            </div>
          )}

          {/* Content */}
          {currentVideoUrl ? (
             <video 
               src={currentVideoUrl} 
               controls 
               autoPlay 
               loop 
               className="max-w-full max-h-full rounded-lg shadow-2xl border border-stone-800"
             />
          ) : (
            <img 
              src={currentImageUrl} 
              alt="Editing Preview" 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
            />
          )}

          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white/80 hover:text-white transition-colors md:hidden z-30"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full md:w-[400px] flex flex-col bg-white border-l border-stone-200">
          <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
            <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Magic Editor
            </h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-stone-200 rounded-full text-stone-500 transition-colors hidden md:block"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* Context Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Editing</span>
              </div>
              <p className="text-sm font-medium text-stone-900">
                {image.style ? `${image.style} Outfit` : 'Original Upload'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <VideoIcon size={16} />
                Visualize
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleTryOnModel}
                  disabled={isEditing || isVideoGenerating}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <User className="w-6 h-6 text-stone-600 group-hover:text-stone-900" />
                  <span className="text-sm font-medium text-stone-700">Try on Model</span>
                </button>
                <button
                  onClick={handleRunwayWalk}
                  disabled={isEditing || isVideoGenerating}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <Play className="w-6 h-6 text-stone-600 group-hover:text-amber-600" />
                  <span className="text-sm font-medium text-stone-700">Runway Walk</span>
                </button>
              </div>
              <p className="text-xs text-stone-400 leading-tight">
                * Video generation requires a paid API key and takes ~1 min.
              </p>
            </div>

            <div className="border-t border-stone-100 my-4" />

            {/* Prompt Editor */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide flex items-center gap-2">
                <Wand2 size={16} />
                Custom Edit
              </h4>
              <p className="text-sm text-stone-500">
                Describe changes like <em>"change background to a city street"</em> or <em>"add a red handbag"</em>.
              </p>
              
              <div className="relative group">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What would you like to change?"
                  className="w-full min-h-[100px] p-4 text-stone-900 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-stone-900 focus:border-transparent outline-none resize-none transition-all shadow-sm group-hover:border-stone-400"
                  disabled={isEditing || isVideoGenerating}
                />
                <button
                  onClick={handleEdit}
                  disabled={!prompt.trim() || isEditing || isVideoGenerating}
                  className="absolute bottom-3 right-3 p-2 bg-stone-900 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-stone-100 bg-stone-50">
             {currentVideoUrl ? (
                <a 
                  href={currentVideoUrl} 
                  download={`stylist-runway-${Date.now()}.mp4`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-stone-900 text-white font-medium rounded-xl hover:bg-stone-800 transition-all shadow-md"
                >
                  <Download size={18} />
                  Download Video
                </a>
             ) : (
                <a 
                  href={currentImageUrl} 
                  download={`stylist-edit-${Date.now()}.png`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-stone-300 text-stone-700 font-medium rounded-xl hover:bg-stone-50 hover:text-stone-900 hover:border-stone-400 transition-all shadow-sm"
                >
                  <Download size={18} />
                  Download Image
                </a>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};