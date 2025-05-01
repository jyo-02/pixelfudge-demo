"use client";
import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";

function extractVideoId(url) {
  try {
    const u = new URL(url.trim());
    if (u.searchParams.has("v")) return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
    const parts = u.pathname.split("/");
    return parts.pop();
  } catch (err) {
    return null;
  }
}

function formatErrorMessage(message) {
  if (!message) return "Something went wrong. Please try again.";

  try {
    const parsed = JSON.parse(message);
    if (parsed.message) {
      return parsed.message;
    }
  } catch {}

  const normalized = message.toLowerCase();

  if (normalized.includes("network"))
    return "Network error — please check your internet connection.";
  if (normalized.includes("not found"))
    return "The requested video could not be found. Please check the link or ID.";
  if (normalized.includes("quota"))
    return "Usage limit exceeded — please try again later.";
  if (normalized.includes("timeout"))
    return "The request timed out — please try again shortly.";
  if (normalized.includes("invalid"))
    return "Invalid input — please double-check the link or video ID.";
  if (normalized.includes("overloaded"))
    return "The model is overloaded. Please try again later.";

  return message
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export default function TranscribeVideoPage() {
  const [input, setInput] = useState("");
  const [rawText, setRawText] = useState("");
  const [cleanedText, setCleanedText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchTranscript = async () => {
    const videoId = extractVideoId(input);
    if (!videoId) {
      toast.error("Enter a valid YouTube link or ID");
      return;
    }

    setLoading(true);
    setRawText("");
    setCleanedText("");

    try {
      const res = await fetch(`/api/transcribe-video?videoId=${videoId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Transcription failed. Try again.");
      }

      setRawText(data.rawText);
      setCleanedText(data.cleanedText);
      toast.success("Transcription completed");
    } catch (err) {
      toast.error(formatErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setInput("");
    setRawText("");
    setCleanedText("");
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {" "}
      <Toaster position="top-right" />
      
        <h1 className="text-3xl font-bold mb-6 text-center">Video Transcription</h1>
      <section className="max-w-4xl mx-auto bg-base-200 p-6 rounded-2xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Paste YouTube Link or ID</h2>
        <div className="flex space-x-4">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="https://youtu.be/VIDEO_ID or VIDEO_ID"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="btn btn-soft btn-primary"
            onClick={fetchTranscript}
            disabled={loading}
          >
            {loading ? "Transcribing…" : "Get Transcript"}
          </button>
        </div>
      </section>
      {rawText && (
        <section className="max-w-4xl mx-auto grid gap-6">
          <div className="bg-base-200  p-6 rounded-2xl shadow">
            <h3 className="text-lg font-semibold mb-2">Transcript</h3>
            <div className="prose max-w-none whitespace-pre-wrap text-sm ">
              {cleanedText}
            </div>
            <div className="card-actions justify-between mt-6">

            <button
              className="btn btn-soft btn-secondary"
              onClick={reset}
              >
              Reset
            </button>
            <button
              className="btn btn-soft btn-primary"
              onClick={() => {
                  const blob = new Blob([cleanedText], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `transcript_${Date.now()}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                >
              Download Transcript
            </button>
                </div>
          </div>
        </section>
      )}
    </div>
  );
}
