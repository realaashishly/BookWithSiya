"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";
import { MessageCircle, Camera, Video, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import ErrorModal from "@/components/ui/modal";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const links = [
  {
    label: "Book a 15-Minute Chat",
    desc: "Live Instagram DMs • ₹6",
    icon: MessageCircle,
    href: null,
    primary: true,
  },
  {
    label: "Follow on Instagram",
    desc: "@siyashah",
    icon: Camera,
    href: "https://instagram.com",
    primary: false,
  },
  {
    label: "Subscribe on YouTube",
    desc: "Siya Shah Vlogs",
    icon: Video,
    href: "https://youtube.com",
    primary: false,
  },
];

function ProfilePage() {
  const [showError, setShowError] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const igId = searchParams.get("igId");

  const handleClick = (link: (typeof links)[number]) => {
    if (link.href) {
      window.open(link.href, "_blank", "noopener,noreferrer");
      return;
    }
    if (!igId) {
      setShowError(true);
      return;
    }
    router.push(`/schedule?igId=${igId}`);
  };

  return (
    <div
      className={`flex min-h-dvh flex-col items-center bg-[#1c1c1e] px-6 pb-12 pt-16 ${jakarta.className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex w-full max-w-sm flex-col items-center"
      >
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="relative mb-5 h-24 w-24 shrink-0"
        >
          <div className="absolute inset-0 rounded-full bg-linear-to-b from-white/20 to-white/5 p-[2px]">
            <div className="h-full w-full rounded-full bg-[#1c1c1e]" />
          </div>
          <Image
            src="https://w3sua3805t.ufs.sh/f/2agSCUQ5LGsEkZTH01GzoxpX5NIJFrlS4P7RgVhQsnw3EGD0"
            alt="Siya Shah"
            fill
            className="rounded-full object-cover"
            priority
            unoptimized
          />
        </motion.div>

        {/* Name & Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-2"
        >
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Siya Shah
          </h1>
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-blue-400"
            fill="currentColor"
          >
            <path d="M11.644 1.571a.5.5 0 0 1 .712 0l2.096 2.153a.5.5 0 0 0 .338.146l2.97-.225a.5.5 0 0 1 .533.435l.405 2.946a.5.5 0 0 0 .237.366l2.58 1.488a.5.5 0 0 1 .206.66l-1.332 2.656a.5.5 0 0 0 0 .392l1.332 2.656a.5.5 0 0 1-.206.66l-2.58 1.488a.5.5 0 0 0-.237.366l-.405 2.946a.5.5 0 0 1-.533.435l-2.97-.225a.5.5 0 0 0-.338.146l-2.096 2.153a.5.5 0 0 1-.712 0l-2.096-2.153a.5.5 0 0 0-.338-.146l-2.97.225a.5.5 0 0 1-.533-.435l-.405-2.946a.5.5 0 0 0-.237-.366l-2.58-1.488a.5.5 0 0 1-.206-.66l1.332-2.656a.5.5 0 0 0 0-.392l-1.332-2.656a.5.5 0 0 1 .206-.66l2.58-1.488a.5.5 0 0 0 .237-.366l.405-2.946a.5.5 0 0 1 .533-.435l2.97.225a.5.5 0 0 0 .338-.146l2.096-2.153z" />
            <path
              d="M10.146 14.854a.5.5 0 0 1-.708 0l-2.5-2.5a.5.5 0 1 1 .708-.708L9.793 13.793l5.854-5.854a.5.5 0 0 1 .708.708l-6.207 6.207z"
              fill="#1c1c1e"
            />
          </svg>
        </motion.div>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-2 text-sm text-zinc-500"
        >
          Content Creator from Indore, India
        </motion.p>

        {/* Link Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex w-full flex-col gap-3"
        >
          {links.map((link, i) => (
            <motion.button
              key={link.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 + i * 0.08 }}
              onClick={() => handleClick(link)}
              className={`group flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all active:scale-[0.98]
                ${link.primary
                  ? "bg-white text-black hover:bg-white/90 shadow-sm"
                  : "bg-[#2a2a2c] text-zinc-300 hover:bg-[#333335] hover:text-white"
                }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl
                  ${link.primary ? "bg-black/5" : "bg-white/5"}
                `}
              >
                <link.icon
                  size={20}
                  className={link.primary ? "text-black" : "text-zinc-400 group-hover:text-zinc-200"}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-semibold ${link.primary ? "text-black" : "text-white"}`}
                >
                  {link.label}
                </p>
                <p
                  className={`mt-0.5 text-xs ${link.primary ? "text-black/60" : "text-zinc-500"}`}
                >
                  {link.desc}
                </p>
              </div>
              <ExternalLink
                size={16}
                className={
                  link.primary
                    ? "text-black/40"
                    : "text-zinc-600 group-hover:text-zinc-400"
                }
              />
            </motion.button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-10 flex items-center gap-6 text-xs text-zinc-600"
        >
          <span>14.2K followers</span>
          <span className="h-3 w-px bg-white/10" />
          <span>850 posts</span>
        </motion.div>
      </motion.div>

      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        message="Missing User ID. Please click the link from your DM again."
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#1c1c1e]">
          <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
        </div>
      }
    >
      <ProfilePage />
    </Suspense>
  );
}
