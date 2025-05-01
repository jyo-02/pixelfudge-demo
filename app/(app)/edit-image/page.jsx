"use client";

import React, { useState, useRef, useEffect } from "react";
import { CldImage } from "next-cloudinary";
import { toast } from "react-hot-toast";

const socialFormats = {
  "Twitter Post (16:9) (Most Widely Used)": {
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
  },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
  "Profile Picture (1:1)": { width: 150, height: 150, aspectRatio: "1:1" },
};

const transformations = [
  { key: "none", label: "None", props: {} },
  {
    key: "bgremoval",
    label: "Remove Background",
    props: { removeBackground: true },
  },
  { key: "enhance", label: "Auto Enhance", props: { enhance: true } },
  { key: "blur", label: "Blur", props: { blur: true } },
  { key: "redeye", label: "Redeye", props: { redeye: true } },
  { key: "cartoonify", label: "Cartoonify", props: { cartoonify: true } },
  {
    key: "bgreplace",
    label: "Replace Background",
    props: { replaceBackground: true },
  },
  { key: "restore", label: "Sharpen Image", props: { restore: true } },
  {
    key: "optimize",
    label: "Minimize Size",
    props: {
      crop: "scale",
      width: 1000,
      quality: "auto",
      fetch_format: "auto",
    },
  },
];

export default function EditImage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(
    Object.keys(socialFormats)[0]
  );
  const [selectedTransform, setSelectedTransform] = useState(
    transformations[0].key
  );

  const imageRef = useRef(null);

  useEffect(() => {
    if (uploadedImage) setIsTransforming(true);
  }, [selectedFormat, selectedTransform, uploadedImage]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUploadButtonClick = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setUploadedImage(data.publicId);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    const img = imageRef.current;
    if (!img || isTransforming) return;
    fetch(img.src)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedFormat
          .replace(/\s+/g, "_")
          .toLowerCase()}_${selectedTransform}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("Image downloaded!");
      })
      .catch(() => toast.error("Failed to download image"));
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadedImage(null);
    setSelectedFormat(Object.keys(socialFormats)[0]);
    setSelectedTransform(transformations[0].key);
    toast("Reset complete");
  };

  const baseTransformProps =
    transformations.find((t) => t.key === selectedTransform)?.props || {};
  const formatProps = socialFormats[selectedFormat];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Instant Image Editing Suite
      </h1>
      <div className="card">
        <div className="card-body max-w-4xl  bg-base-200 p-6 rounded-2xl shadow-md mb-8">
          <h2 className="card-title mb-4">Upload an Image</h2>

          <div className="flex items-center space-x-4 w-full">
            <label className="flex w-full items-center rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm hover:border-gray-400 hover:shadow-md cursor-pointer transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="w-full text-left text-sm text-gray-500">
                {selectedFile ? selectedFile.name : "Click to Browse"}
              </span>
            </label>
            <button
              className="btn btn-soft btn-primary"
              onClick={handleUploadButtonClick}
              disabled={isUploading}
            >
              {isUploading ? "Uploading…" : "Upload"}
            </button>
          </div>

          {isUploading && (
            <progress className="progress progress-primary w-full mt-4" />
          )}

          {uploadedImage && (
            <>
              <div className="mt-6 flex flex-col gap-4">
                <div>
                  <h2 className="card-title mb-2">Select Aspect Ratio </h2>
                  <select
                    className="select select-bordered w-full"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                  >
                    {Object.keys(socialFormats).map((format) => (
                      <option key={format} value={format}>
                        {format}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <h2 className="card-title mb-2">Select Image Enhancement</h2>
                  <select
                    className="select select-bordered w-full"
                    value={selectedTransform}
                    onChange={(e) => setSelectedTransform(e.target.value)}
                  >
                    {transformations.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 relative">
                {isTransforming && (
                  <div className="absolute inset-0 bg-base-100 bg-opacity-60 flex items-center justify-center z-10">
                    <span className="loading loading-spinner loading-lg" />
                  </div>
                )}
                <CldImage
                  key={`${uploadedImage}-${selectedFormat}-${selectedTransform}`}
                  width={formatProps.width}
                  height={formatProps.height}
                  src={uploadedImage}
                  alt={`${selectedTransform} preview`}
                  crop="fill"
                  aspectRatio={formatProps.aspectRatio}
                  gravity="auto"
                  {...baseTransformProps}
                  ref={imageRef}
                  onLoadingComplete={() => setIsTransforming(false)}
                />
              </div>

              <div className="card-actions justify-between mt-6">
                <button
                  className="btn btn-soft btn-secondary"
                  onClick={handleReset}
                >
                  Reset
                </button>
                <button
                  className="btn btn-soft btn-primary"
                  onClick={handleDownload}
                  disabled={isTransforming}
                >
                  Download
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
