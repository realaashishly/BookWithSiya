"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserGroupIcon, Copy01Icon } from "@hugeicons/core-free-icons";
import ErrorModal from "@/components/ui/modal";

// Initialize the premium font
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function ProfilePage() {
  const [showError, setShowError] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const igId = searchParams.get("igId");

  const handleContinue = () => {
    if (!igId) {
      setShowError(true);
      return;
    }
    router.push(`/schedule?igId=${igId}`);
  };

  return (
    // Dark outer canvas matching the reference image's background
    <div
      className={`flex min-h-dvh items-center justify-center bg-[#1c1c1e] p-4 font-sans antialiased ${jakarta.className}`}
    >
      {/* The Main Rounded Card */}
      <div className="relative flex h-[80vh] min-h-[600px] max-h-[750px] w-full max-w-[400px] flex-col overflow-hidden rounded-[2.5rem] bg-[#2a2a2c] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
        {/* Top Full-Bleed Image */}
        <div className="absolute inset-0 h-full w-full">
          <Image
            src="https://w3sua3805t.ufs.sh/f/2agSCUQ5LGsEkZTH01GzoxpX5NIJFrlS4P7RgVhQsnw3EGD0"
            alt="Siya Profile Image"
            fill
            className="object-cover object-center"
            priority
            unoptimized
          />
        </div>

        {/* 
          Dark Smoky Glass Overlay 
          Uses a custom gradient mask so the blur fades smoothly into the image above 
        */}
        <div
          className="absolute inset-x-0 bottom-0 h-[55%] pointer-events-none z-10"
          style={{
            background:
              "linear-gradient(to top, rgba(30,30,32,1) 0%, rgba(30,30,32,0.9) 30%, rgba(30,30,32,0.5) 60%, transparent 100%)",
            backdropFilter: "blur(12px)",
            WebkitMaskImage:
              "linear-gradient(to top, black 50%, transparent 100%)",
            maskImage: "linear-gradient(to top, black 50%, transparent 100%)",
          }}
        ></div>

        {/* Content Section (Anchored to the bottom, above the glass) */}
        <div className="relative z-20 mt-auto flex flex-col p-8 pb-10">
          {/* Name & Verified Badge */}
          <div className="flex items-center gap-2">
            <h1 className="text-[32px] font-semibold tracking-tight text-white">
              Siya Shah
            </h1>

            {/* Custom Verified Badge matching the image exactly */}
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-white drop-shadow-sm"
              fill="currentColor"
            >
              <path d="M11.644 1.571a.5.5 0 0 1 .712 0l2.096 2.153a.5.5 0 0 0 .338.146l2.97-.225a.5.5 0 0 1 .533.435l.405 2.946a.5.5 0 0 0 .237.366l2.58 1.488a.5.5 0 0 1 .206.66l-1.332 2.656a.5.5 0 0 0 0 .392l1.332 2.656a.5.5 0 0 1-.206.66l-2.58 1.488a.5.5 0 0 0-.237.366l-.405 2.946a.5.5 0 0 1-.533.435l-2.97-.225a.5.5 0 0 0-.338.146l-2.096 2.153a.5.5 0 0 1-.712 0l-2.096-2.153a.5.5 0 0 0-.338-.146l-2.97.225a.5.5 0 0 1-.533-.435l-.405-2.946a.5.5 0 0 0-.237-.366l-2.58-1.488a.5.5 0 0 1-.206-.66l1.332-2.656a.5.5 0 0 0 0-.392l-1.332-2.656a.5.5 0 0 1 .206-.66l2.58-1.488a.5.5 0 0 0 .237-.366l.405-2.946a.5.5 0 0 1 .533-.435l2.97.225a.5.5 0 0 0 .338-.146l2.096-2.153z" />
              <path
                d="M10.146 14.854a.5.5 0 0 1-.708 0l-2.5-2.5a.5.5 0 1 1 .708-.708L9.793 13.793l5.854-5.854a.5.5 0 0 1 .708.708l-6.207 6.207z"
                fill="black"
              />
            </svg>
          </div>

          {/* Title & Location */}
          <p className="mt-3 pr-4 text-[16px] leading-relaxed text-zinc-300">
            Content Creator <span className="mx-1.5">•</span> Indore, India
          </p>

          {/* Footer Row: Stats & Button */}
          <div className="mt-4 flex items-center justify-between">
            {/* Left: Stats */}
            <div className="flex items-center gap-5 text-[15px] font-medium text-zinc-300">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={UserGroupIcon} size={18} strokeWidth={2} />
                <span>14.2K</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Copy01Icon} size={18} strokeWidth={2} />
                <span>850</span>
              </div>
            </div>

            {/* Right: CTA Button */}
            <button
              onClick={handleContinue}
              className="flex h-12 items-center justify-center gap-1 rounded-full bg-white px-6 text-[15px] font-bold text-black transition-transform hover:scale-105 active:scale-95"
            >
              Get in touch
              <span className="text-xl font-normal leading-none mb-[2px] ml-1">
                +
              </span>
            </button>

            <ErrorModal
              isOpen={showError}
              onClose={() => setShowError(false)}
              message="Missing User ID. Please click the link from your DM again."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#1c1c1e] text-zinc-500">
          Loading profile...
        </div>
      }
    >
      <ProfilePage />
    </Suspense>
  );
}
