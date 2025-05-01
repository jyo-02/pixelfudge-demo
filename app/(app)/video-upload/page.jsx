"use client";
import React, { useState, useCallback } from "react";
import { getCldVideoUrl } from "next-cloudinary";
import { toast } from "react-hot-toast";
import { filesize } from "filesize";
import { CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";

const VideoCard = ({ video }) => {
  const { publicId = "", originalSize = 0, compressedSize = 0 } = video || {};
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [trimmedUrl, setTrimmedUrl] = useState(null);
  const formatSize = useCallback((size) => filesize(size), []);

  const compressionPct =
    originalSize > 0
      ? Math.round((1 - compressedSize / originalSize) * 100)
      : 0;

  const handleTrim = async () => {
    if (!publicId) return toast.error("No video to trim.");
    toast.loading("Trimming…", { id: "trim" });
    try {
      const params = new URLSearchParams({ publicId });
      if (start) params.set("start", start);
      if (end) params.set("end", end);
      const res = await fetch(`/api/trim-video?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Trim failed");
      setTrimmedUrl(data.url);
      toast.success("Trim ready!", { id: "trim" });
    } catch (err) {
      toast.error(err.message || "Trim error", { id: "trim" });
    }
  };

  const randomSuffix = Math.random().toString(36).slice(2, 8);

  const downloadBlob = async (url, filename) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objUrl);
      toast.success(`${filename} downloaded!`);
    } catch (err) {
      toast.error(err.message || "Download error");
    }
  };

  return (
    <div className="card">
      <div className="aspect-video relative">
        <CldVideoPlayer
          width="1920"
          height="1080"
          src={publicId}
          loop
          muted
          className="w-full h-full object-cover"
        />
      </div>
      <div className="card-body p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-semibold">Original Size</div>
            <div>{formatSize(originalSize)}</div>
          </div>
          <div>
            <div className="font-semibold">Compressed Size</div>
            <div>{formatSize(compressedSize)}</div>
          </div>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm">
          <div className="font-semibold">Compression: {compressionPct}%</div>
          <button
            className="btn btn-soft btn-error"
            onClick={() =>
              downloadBlob(
                getCldVideoUrl({ src: publicId, width: 1920, height: 1080 }),
                `video_${randomSuffix}.mp4`
              )
            }
          >
            Download Original
          </button>
        </div>

        <div className="mt-4">
          <input
            type="number"
            placeholder="Start (s)"
            className="input input-bordered w-full mb-2"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <input
            type="number"
            placeholder="End (s)"
            className="input input-bordered w-full mb-2"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
          <button className="btn btn-soft btn-warning" onClick={handleTrim}>
            Trim Video
          </button>
        </div>

        {trimmedUrl && (
          <div className="mt-4">
            <button
              className="btn btn-soft btn-error"
              onClick={() =>
                downloadBlob(trimmedUrl, `trimmed_${randomSuffix}.mp4`)
              }
            >
              Download Trimmed Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function VideoUploaderPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoData, setVideoData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleUploadButtonClick = async () => {
    if (!selectedFile) return toast.error("Select a video first!");
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("originalSize", `${selectedFile.size}`);

    try {
      const res = await fetch("/api/video-upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setVideoData(data);
      toast.success("Upload successful!");
    } catch (err) {
      toast.error(err.message || "Upload error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
      Effortlessly Compress and Trim Your Video      </h1>

      <div className="card mb-6">
        <div className="card-body max-w-4xl  bg-base-200 p-6 rounded-2xl shadow-md mb-8">
          <h2 className="card-title mb-4">Upload a Video</h2>

          <div className="flex items-center space-x-4 w-full">
            <label className="flex w-full items-center rounded-md border border-gray-300 bg-white px-4 py-3 text-gray-700 shadow-sm hover:border-gray-400 hover:shadow-md cursor-pointer transition">
              <input
                type="file"
                accept="video/*"
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
        </div>
      </div>

      {videoData && (
        <div className="card">
          <div className="card-body">
            <h2 className="card-title mb-4">Preview Video</h2>
            <VideoCard video={videoData} />
          </div>
        </div>
      )}
    </div>
  );
}
