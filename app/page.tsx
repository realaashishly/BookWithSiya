"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Heart, MessageCircle } from "lucide-react";
import ErrorModal from "@/components/ui/modal";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function ProfilePage() {
  const [showError, setShowError] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const igId = searchParams.get("igId");

  const [likes, setLikes] = useState(1000);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // Generates a random number between 1,000 and 10,000 once the page loads
    // Wrapped in a setTimeout to avoid calling setState synchronously in the effect
    const timer = setTimeout(() => {
      const randomInitialLikes = Math.floor(Math.random() * 1001) + 1000;
      setLikes(randomInitialLikes);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  // Restored the click handler to trigger the error modal if igId is missing
  const handleChatClick = () => {
    if (!igId) {
      setShowError(true);
      return;
    }
    router.push(`/pricing?igId=${igId}`);
  };

  return (
    <div
      className={`flex min-h-dvh w-full justify-center bg-white ${jakarta.className}`}
    >
      {/* MAIN CONTENT COLUMN */}
      <div className="relative flex h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-white sm:border-x sm:border-gray-100 sm:shadow-[0_0_40px_rgba(0,0,0,0.03)]">
        
        {/* IMAGE CONTAINER */}
        <div className="relative min-h-0 w-full flex-1 overflow-hidden rounded-b-[2.5rem] shadow-sm">
          <Image
            src="https://w3sua3805t.ufs.sh/f/2agSCUQ5LGsEjFMTGu0bTJzD8r6NaS1P2sZh7XBIdv5EgktM"
            alt="Siya Shah"
            fill
            className="object-cover object-top"
            priority
            unoptimized
          />
        </div>

        {/* TEXT & BUTTONS CONTAINER */}
        <div className="flex shrink-0 flex-col px-6 pb-10 pt-6 sm:px-10 sm:pb-12">
          <h1 className="mb-1 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            Siya Shah
          </h1>
          <p className="text-xl font-medium leading-tight text-gray-400">
            Content Creator from <br /> Indore, India
          </p>

          {/* BUTTONS ROW */}
          <div className="mt-8 flex w-full flex-row gap-3">
            
            {/* Like Button */}
            <button
              onClick={handleLikeClick}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-2xl px-2 py-3.5 transition-colors active:scale-95 ${
                isLiked
                  ? "bg-red-50 hover:bg-red-100"
                  : "bg-[#f3f4f6] hover:bg-gray-200"
              }`}
            >
              <Heart
                size={18}
                className={`shrink-0 transition-colors ${
                  isLiked ? "fill-red-500 text-red-500" : "text-black"
                }`}
              />
              <span
                className={`truncate text-sm font-semibold ${
                  isLiked ? "text-red-600" : "text-black"
                }`}
              >
                {likes.toLocaleString()}
              </span>
            </button>

            {/* Chat Button */}
            <button
              onClick={handleChatClick}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#f8ccde] px-2 py-3.5 transition-colors hover:bg-[#f3b2cd] active:scale-95"
            >
              <MessageCircle size={18} className="shrink-0 text-black" />
              <span className="truncate text-sm font-semibold text-black">
                Chat with me
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ERROR MODAL INJECTION */}
      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        message="Missing User ID. Please click the link from your Instagram DM again."
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/20" />
        </div>
      }
    >
      <ProfilePage />
    </Suspense>
  );
}