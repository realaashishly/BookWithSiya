"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  Loader2,
  MessageCircle,
  Heart,
  X,
} from "lucide-react";
import ErrorModal from "@/components/ui/modal";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon, Time02Icon } from "@hugeicons/core-free-icons";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function PricingCards() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const igId = searchParams.get("igId");
  const date = searchParams.get("date");
  const time = searchParams.get("time");

  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ isOpen: false, message: "" });

  const getEndTime = (startTime: string | null) => {
    if (!startTime) return "N/A";
    const [timeStr, period] = startTime.split(" ");
    const [h, m] = timeStr.split(":").map(Number);
    let hours = h;
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    const totalMinutes = hours * 60 + m + 15;
    let endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    const endP = endH >= 12 ? "PM" : "AM";
    if (endH === 0) endH = 12;
    else if (endH > 12) endH -= 12;

    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")} ${endP}`;
  };

  const handlePayment = async () => {
    if (!igId) {
      setErrorInfo({
        isOpen: true,
        message: "Missing User ID. Please restart from the profile.",
      });
      return;
    }
    setLoading(true);

    try {
      const cashfree = await load({ mode: "sandbox" });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            igAccountId: igId,
            planId: "1-day",
            scheduledDate: date,
            scheduledTime: time,
          }),
        },
      );
      const data = await response.json();
      console.log("Response Data:", data);
      if (data.payment_session_id) {
        cashfree
          .checkout({
            paymentSessionId: data.payment_session_id,
            redirectTarget: "_modal",
          })
          .then(
            (result: {
              error?: { message: string };
              paymentDetails?: unknown;
            }) => {
              if (result.error)
                setErrorInfo({ isOpen: true, message: result.error.message });
              else if (result.paymentDetails)
                router.push(`/success?igId=${igId}`);
            },
          );
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setErrorInfo({
        isOpen: true,
        message: "Could not connect to payment gateway.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#1c1c1e] text-white p-6 flex flex-col items-center justify-center ${jakarta.className}`}
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            15-Minute Live Chat
          </h1>
          <p className="text-zinc-400">Connect via Instagram DMs</p>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-[#2a2a2c] border border-white/10 p-8 transition-all hover:border-white/20">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-semibold">15-Minute Chat</h3>
            <span className="text-3xl font-bold">₹6</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <MessageCircle size={18} /> Casual friendly chats
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <Heart size={18} /> Safe & private space
            </div>

            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <HugeiconsIcon size={18} icon={Calendar03Icon} />
              <span className="font-semibold">{date || "Today"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <HugeiconsIcon size={18} icon={Time02Icon} />
              <span>
                {time} to {getEndTime(time)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-red-400">
              <X size={18} /> No adult content/nudes
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-10 w-full h-14 rounded-full bg-white text-black font-bold text-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              "Start Chatting"
            )}
          </button>

          <ErrorModal
            isOpen={errorInfo.isOpen}
            onClose={() => setErrorInfo({ ...errorInfo, isOpen: false })}
            message={errorInfo.message}
          />
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1c1c1e]" />}>
      <PricingCards />
    </Suspense>
  );
}
