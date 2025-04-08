import  { useState } from "react";
import { useDropzone } from "react-dropzone";
import imageCompression from "browser-image-compression";

// Add individual dimensions to the UploadedImage interface
interface UploadedImage {
  file: File;
  dimensions: { width: number; height: number };
  customWidth?: number | null;
  customHeight?: number | null;
}

const ImgConverter = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [convertedImages, setConvertedImages] = useState<{ file: File; dimensions: { width: number; height: number } }[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);

  const handleDrop = async (acceptedFiles: File[]) => {
    const imagesWithDimensions: UploadedImage[] = [];

    for (const file of acceptedFiles) {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (event) => {
        img.onload = () => {
          imagesWithDimensions.push({
            file,
            dimensions: { width: img.width, height: img.height },
            customWidth: null,
            customHeight: null,
          });

          if (imagesWithDimensions.length === acceptedFiles.length) {
            setUploadedImages((prev) => [...prev, ...imagesWithDimensions]);
          }
        };
        img.src = event.target?.result as string;
      };

      reader.readAsDataURL(file);
    }
  };

  const resizeImage = async (file: File, width: number, height: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              async (blob) => {
                if (blob) {
                  const resizedFile = new File([blob], file.name, { type: file.type });
                  resolve(resizedFile);
                } else {
                  reject(new Error("Failed to resize image"));
                }
              },
              file.type,
              1
            );
          } else {
            reject(new Error("Failed to get canvas context"));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleConvert = async () => {
    setIsConverting(true);
    const webpImages: { file: File; dimensions: { width: number; height: number } }[] = [];

    for (const { file, dimensions, customWidth: individualWidth, customHeight: individualHeight } of uploadedImages) {
      try {
        let processedFile = file;

        // Determine the width and height to use
        const width = individualWidth ?? customWidth ?? dimensions.width; // Use individual width, then general width, then original width
        const height = individualHeight ?? customHeight ?? dimensions.height; // Use individual height, then general height, then original height

        processedFile = await resizeImage(file, width, height);

        // Compress and convert the image to WebP
        const compressedFile = await imageCompression(processedFile, {
          maxSizeMB: 1, // Limit file size to 1MB
          useWebWorker: true, // Use web workers for better performance
          fileType: "image/webp", // Convert to WebP
        });

        const webpFile = new File([compressedFile], file.name.replace(/\.[^/.]+$/, ".webp"), {
          type: "image/webp",
        });

        // Get dimensions of the converted WebP image
        const img = new Image();
        const blobUrl = URL.createObjectURL(webpFile);
        img.src = blobUrl;

        await new Promise((resolve) => {
          img.onload = () => {
            webpImages.push({
              file: webpFile,
              dimensions: { width: img.width, height: img.height },
            });
            URL.revokeObjectURL(blobUrl); // Clean up the object URL
            resolve(null);
          };
        });
      } catch (error) {
        console.error("Error converting image:", error);
      }
    }

    setConvertedImages(webpImages);
    setIsConverting(false);
  };

  const handleDimensionChange = (index: number, width: number | null, height: number | null) => {
    setUploadedImages((prev) =>
      prev.map((image, i) =>
        i === index ? { ...image, customWidth: width, customHeight: height } : image
      )
    );
  };

  const handleDiscard = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    convertedImages.forEach((image) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(image.file);
      link.download = image.file.name;
      link.click();
    });
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
    <div className="space-y-10 p-10 bg-gray-50 rounded-3xl shadow-2xl">
      {/* Header Section */}
      <div className=" pl-6">
        <h2 className="text-5xl font-extrabold text-gray-800 transition-transform duration-300 hover:scale-105">
          Image Converter
        </h2>
        <p className="text-lg mt-4 text-gray-600">
          Drag and drop images to convert them to WebP format. You can also specify custom dimensions for resizing.
        </p>
      </div>

      {/* Custom Dimensions Input */}
      <div className="flex flex-col md:flex-row gap-6 bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="width" className="text-lg font-medium text-gray-700 mb-2">
            General Width (px)
          </label>
          <input
            id="width"
            type="number"
            value={customWidth || ""}
            onChange={(e) => setCustomWidth(Number(e.target.value) || null)}
            placeholder="e.g., 800"
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          />
        </div>
        <div className="flex flex-col w-full md:w-1/2">
          <label htmlFor="height" className="text-lg font-medium text-gray-700 mb-2">
            General Height (px)
          </label>
          <input
            id="height"
            type="number"
            value={customHeight || ""}
            onChange={(e) => setCustomHeight(Number(e.target.value) || null)}
            placeholder="e.g., 600"
            className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
          />
        </div>
      </div>

      {/* Drag and Drop Area */}
      <div
        {...getRootProps()}
        className={`p-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-dashed border-4 ${
          isDragActive ? "border-blue-500" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-800 transition-transform duration-300 hover:scale-105">
            {isDragActive ? "Drop the files here..." : "Drag and drop your images here"}
          </h3>
          <p className="text-gray-600 mt-3">Or click to select files</p>
        </div>
      </div>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">Uploaded Images</h3>
          <ul className="space-y-4">
            {uploadedImages.map((image, index) => (
              <li
                key={index}
                className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-medium text-gray-800">{image.file.name}</span>
                    <p className="text-sm text-gray-600">
                      Original Dimensions: {image.dimensions.width}x{image.dimensions.height}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDiscard(index)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors duration-300"
                  >
                    Discard
                  </button>
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col w-full md:w-1/2">
                    <label
                      htmlFor={`customWidth-${index}`}
                      className="text-lg font-medium text-gray-700 mb-2"
                    >
                      Custom Width (px)
                    </label>
                    <input
                      id={`customWidth-${index}`}
                      type="number"
                      value={image.customWidth || ""}
                      onChange={(e) =>
                        handleDimensionChange(
                          index,
                          Number(e.target.value) || null,
                          image.customHeight || null
                        )
                      }
                      placeholder="e.g., 800"
                      className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    />
                  </div>
                  <div className="flex flex-col w-full md:w-1/2">
                    <label
                      htmlFor={`customHeight-${index}`}
                      className="text-lg font-medium text-gray-700 mb-2"
                    >
                      Custom Height (px)
                    </label>
                    <input
                      id={`customHeight-${index}`}
                      type="number"
                      value={image.customHeight || ""}
                      onChange={(e) =>
                        handleDimensionChange(
                          index,
                          image.customWidth || null,
                          Number(e.target.value) || null
                        )
                      }
                      placeholder="e.g., 600"
                      className="p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Convert Button */}
      {uploadedImages.length > 0 && (
        <button
          onClick={handleConvert}
          className="w-full py-4 bg-blue-500 text-white text-lg font-medium rounded-lg shadow hover:bg-blue-600 transition-transform duration-300 hover:scale-105"
        >
          Convert Images
        </button>
      )}

      {/* Conversion Status */}
      {isConverting && (
        <div className="text-center text-lg font-medium text-blue-500">
          Converting images...
        </div>
      )}

      {/* Converted Images */}
      {convertedImages.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-gray-800">Converted Images</h3>
          <ul className="space-y-4">
            {convertedImages.map(({ file, dimensions }, index) => (
              <li
                key={index}
                className="flex flex-col gap-4 bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-medium text-gray-800">{file.name}</span>
                    <p className="text-sm text-gray-600">
                      Converted Dimensions: {dimensions.width}x{dimensions.height}
                    </p>
                  </div>
                  <a
                    href={URL.createObjectURL(file)}
                    download={file.name}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-transform duration-300 hover:scale-105"
                  >
                    Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <button
            onClick={handleSaveAll}
            className="w-full py-4 bg-green-500 text-white text-lg font-medium rounded-lg shadow hover:bg-green-600 transition-transform duration-300 hover:scale-105"
          >
            Save All Images
          </button>
        </div>
      )}
    </div>
  );
};

export default ImgConverter;
