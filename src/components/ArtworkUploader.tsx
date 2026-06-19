import React, { useState, useRef } from "react";
import { Upload, Plus, CheckCircle, Image as ImageIcon } from "lucide-react";
import { Artwork } from "../types";

interface ArtworkUploaderProps {
  onAddArtwork: (newArt: Artwork) => void;
  activeThemeColor: string;
}

export default function ArtworkUploader({
  onAddArtwork,
  activeThemeColor,
}: ArtworkUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Invalid format. Please select a PNG or JPG image file.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setSuccess(false);

    // Auto seed titles if empty
    if (!title) {
      const cleanName = file.name.split(".")[0];
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
    if (!artist) {
      setArtist("Guest Curator");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !title.trim()) return;

    const uploadedArtwork: Artwork = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim() || "Guest Curator",
      url: previewUrl,
      description: "A custom user uploaded image. Inserted directly as a high-density fragment shader coordinate onto the responsive cylindrical spiral helix cylinder track.",
      category: "Uploads",
      year: new Date().getFullYear().toString(),
      cameraSpecs: {
        shutter: "1/200s",
        iso: "ISO 400",
        aperture: "f/2.8 Digital",
        lens: "Virtual WebGL-L3 Interface"
      }
    };

    onAddArtwork(uploadedArtwork);
    setSuccess(true);
    setPreviewUrl(null);
    setTitle("");
    setArtist("");

    // Automatically hide success notification after a few seconds
    setTimeout(() => {
      setSuccess(false);
    }, 4000);
  };

  return (
    <div
      id="artwork-upload-panel"
      className="bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 w-full md:w-80 text-white shadow-2xl transition-all duration-300"
    >
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-4">
        <Upload className="w-5 h-5" style={{ color: activeThemeColor }} />
        <h3 className="font-sans font-semibold tracking-wider uppercase text-xs">
          Inject Custom Artwork
        </h3>
      </div>

      {success && (
        <div className="mb-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl flex items-center gap-2 text-xs font-sans">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Injected successfully into the Helix track!</span>
        </div>
      )}

      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? "border-white bg-white/5"
              : "border-white/10 hover:border-white/30 hover:bg-white/5"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <ImageIcon className="w-8 h-8 text-neutral-500 hover:text-neutral-300 transition" />
          <div>
            <p className="font-sans text-xs text-neutral-300 font-medium">Drag & drop image file</p>
            <p className="font-sans text-[10px] text-neutral-500 mt-1">Supports JPEG, PNG, WEBP</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 font-sans text-xs">
          {/* Cover Preview thumbnail */}
          <div className="relative h-24 rounded-lg overflow-hidden border border-white/10 bg-black">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/70 hover:bg-black rounded text-[10px]"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
              Artwork Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Virtual Horizon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 block">
              Artist Creator
            </label>
            <input
              type="text"
              placeholder="e.g. Guest Curator"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-lg font-medium text-black transition flex items-center justify-center gap-1.5"
            style={{ backgroundColor: activeThemeColor }}
          >
            <Plus className="w-4 h-4" />
            <span>Mount Helix Mesh</span>
          </button>
        </form>
      )}
    </div>
  );
}
