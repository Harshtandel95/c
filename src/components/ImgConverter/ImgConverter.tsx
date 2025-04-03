import { useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";

const ImgConverter = () => {
  const [convertedImages, setConvertedImages] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);

  const handleDrop = async (acceptedFiles: File[]) => {
    setUploadedImages((prev) => [...prev, ...acceptedFiles]); // Append new files to the uploaded images list
    setIsConverting(true);
    const webpImages: File[] = [];

    for (const file of acceptedFiles) {
      try {
        // Compress and convert the image to WebP with optional custom dimensions
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1, // Limit file size to 1MB
          useWebWorker: true, // Use web workers for better performance
          fileType: "image/webp", // Convert to WebP
          maxWidthOrHeight: customWidth || customHeight ? Math.max(customWidth || 0, customHeight || 0) : undefined, // Custom dimensions
        });
        const webpFile = new File([compressedFile], file.name.replace(/\.[^/.]+$/, ".webp"), {
          type: "image/webp",
        });
        webpImages.push(webpFile);
      } catch (error) {
        console.error("Error converting image:", error);
      }
    }

    setConvertedImages((prev) => [...prev, ...webpImages]); // Append new converted images to the existing list
    setIsConverting(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/gif": [".gif"],
      "image/svg+xml": [".svg"],
    },
    onDrop: handleDrop,
  });

  return (
    <div className="space-y-8 p-8 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 rounded-2xl shadow-2xl">
      {/* Header Section */}
      <div className="border-l-4 border-emerald-500 pl-6">
        <h2 className="text-4xl font-extrabold text-gray-900">Image Converter</h2>
        <p className="text-gray-700 mt-3 text-lg">
          Drag and drop images to convert them to WebP format. Optionally, specify custom dimensions.
        </p>
      </div>

      {/* Custom Dimensions Input */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-col">
          <label htmlFor="width" className="text-gray-700 font-medium">
            Custom Width (px)
          </label>
          <input
            id="width"
            type="number"
            value={customWidth || ""}
            onChange={(e) => setCustomWidth(Number(e.target.value) || null)}
            placeholder="e.g., 800"
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="height" className="text-gray-700 font-medium">
            Custom Height (px)
          </label>
          <input
            id="height"
            type="number"
            value={customHeight || ""}
            onChange={(e) => setCustomHeight(Number(e.target.value) || null)}
            placeholder="e.g., 600"
            className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Drag and Drop Area */}
      <div
        {...getRootProps()}
        className={`p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-dashed border-2 ${
          isDragActive ? "border-emerald-500" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <h3 className="text-2xl font-semibold text-gray-800 text-center">
          {isDragActive ? "Drop the files here..." : "Drag and drop your images here"}
        </h3>
        <p className="text-gray-600 mt-3 text-center">Or click to select files</p>
      </div>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Uploaded Images</h3>
          <ul className="space-y-2">
            {uploadedImages.map((image, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow">
                <span className="text-gray-800">{image.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conversion Status */}
      {isConverting && (
        <div className="text-center text-emerald-500 font-medium">Converting images...</div>
      )}

      {/* Converted Images */}
      {convertedImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Converted Images</h3>
          <ul className="space-y-2">
            {convertedImages.map((image, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow">
                <span className="text-gray-800">{image.name}</span>
                <a
                  href={URL.createObjectURL(image)}
                  download={image.name}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg shadow hover:bg-emerald-600 transition-colors duration-300"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Info */}
      <div className="text-center text-gray-600 text-sm">
        Supported formats: <span className="font-medium">PNG, JPEG, GIF, SVG</span>. Output format: <span className="font-medium">WebP</span>.
      </div>
    </div>
  );
};

export default ImgConverter;
