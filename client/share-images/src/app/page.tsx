'use client';
import { useState } from 'react';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [minutes, setMinutes] = useState(60);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('minutes', minutes.toString());

    try {
      console.log(process.env.NEXT_PUBLIC_API_URL);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/images`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        // Show popup with the link
        alert(`Your image link: ${url}`);
        // Reset form
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      alert('Error uploading image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-8">
      <main className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-8 text-center">Share Your Images</h1>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="imageInput"
            onChange={handleFileSelect}
          />
          <label
            htmlFor="imageInput"
            className="cursor-pointer inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Select Image to Share
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Supports JPG, PNG and GIF files
          </p>
        </div>

        {previewUrl && (
          <div className="mt-8 space-y-4">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-64 mx-auto rounded-lg"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="minutes" className="text-sm text-gray-600">
                  Available for (minutes):
                </label>
                <input
                  type="number"
                  id="minutes"
                  min="1"
                  max="10080"
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className="border rounded px-2 py-1 w-24"
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400"
              >
                {isUploading ? 'Uploading...' : 'Share Image'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
