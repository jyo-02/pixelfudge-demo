"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="bg-base-200 pt-12 pb-44">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Pixel Fudge Hub
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            href="/edit-image"
            className="group block bg-base-100 w-full max-w-sm mx-auto rounded-lg shadow-md transform transition duration-200 hover:shadow-xl hover:scale-105"
          >
            <figure className="overflow-hidden rounded-t-lg">
              <img
                src="https://res.cloudinary.com/dlnmf4ulx/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1745759114/Screen-Shot-2016-03-02-at-23.04.53_k2bkcq.png"
                alt="Image Editor"
                className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </figure>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Image Editor</h2>
              <p className="text-sm text-gray-600">
                Resize, transform, and enhance your images effortlessly.
              </p>
            </div>
          </Link>

          <Link
            href="/video-upload"
            className="group block bg-base-100 w-full max-w-sm mx-auto rounded-lg shadow-md transform transition duration-200 hover:shadow-xl hover:scale-105"
          >
            <figure className="overflow-hidden rounded-t-lg">
              <img
                src="https://res.cloudinary.com/dlnmf4ulx/image/upload/w_1000,ar_16:9,c_fill,g_auto,e_sharpen/v1745760128/WhatsApp_Image_2025-04-27_at_6.51.51_PM_v1mbwq.jpg"
                alt="Video Editor"
                className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </figure>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Video Editor</h2>
              <p className="text-sm text-gray-600">
                Trim, compress, and download your videos in a snap.
              </p>
            </div>
          </Link>

          <Link
            href="/transcribe-video"
            className="group block bg-base-100 w-full max-w-sm mx-auto rounded-lg shadow-md transform transition duration-200 hover:shadow-xl hover:scale-105"
          >
            <figure className="overflow-hidden rounded-t-lg">
              <img
                src="https://res.cloudinary.com/dlnmf4ulx/image/upload/v1745945196/transcribe-videos-faster_sqbdil.png"
                alt="Transcribe Youtube Video"
                className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </figure>
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">Transcription AI</h2>
              <p className="text-sm text-gray-600">
              Convert any YouTube video into a clean, punctuated transcript in seconds.             
               </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
