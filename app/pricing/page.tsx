"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { Plus_Jakarta_Sans } from "next/font/google";
import {
  Loader2,
  MessageCircle,
  Ban,
  CheckCircle2,
  ImageOff,
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

    const totalMinutes = hours * 60 + m + 40; // Updated to match your 40-minute slot interval
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
        `${process.env.NEXT_PUBLIC_API_URL || ""}/api/payments/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            igAccountId: igId,
            planId: "1-day",
            scheduledDate: date,
            scheduledTime: time,
          }),
        }
      );
      const data = await response.json();
      
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
            }
          );
      } else {
        throw new Error("No session ID returned");
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
    <div className={`flex min-h-dvh w-full justify-center bg-zinc-50 ${jakarta.className}`}>
      
      {/* Desktop-Constrained Mobile View */}
      <div className="relative flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center bg-white px-6 sm:border-x sm:border-gray-100 sm:shadow-[0_0_40px_rgba(0,0,0,0.03)] py-12">
        
        <div className="w-full space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              Confirm your booking
            </h1>
            <p className="text-base font-medium text-zinc-500">
              You&apos;re almost there!
            </p>
          </div>

          {/* Pricing Card */}
          <div className="relative overflow-hidden rounded-[32px] bg-white border border-zinc-200 p-8 shadow-xl shadow-black/3">
            
            {/* Top Row: Title & Price */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b border-zinc-100">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">Live Chat Session</h3>
                <p className="text-sm font-medium text-zinc-500 mt-1">24 Hours</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-extrabold tracking-tight text-zinc-900">₹9</span>
                <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mt-1">One Time</p>
              </div>
            </div>

            {/* Feature List */}
            <div className="space-y-5">
              
              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <HugeiconsIcon size={14} icon={Calendar03Icon} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Scheduled Date</p>
                  <p className="text-sm font-medium text-zinc-500">{date || "Today"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <HugeiconsIcon size={14} icon={Time02Icon} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Selected Time</p>
                  <p className="text-sm font-medium text-zinc-500">{time} to {getEndTime(time)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <MessageCircle size={14} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Direct Messages</p>
                  <p className="text-sm font-medium text-zinc-500">Casual, friendly 1-on-1 chat</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <ImageOff size={14} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Text Only</p>
                  <p className="text-sm font-medium text-zinc-500">No photo or picture sharing allowed</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <Ban size={14} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">Strictly SFW</p>
                  <p className="text-sm font-medium text-zinc-500">No adult content or nudes allowed</p>
                </div>
              </div>

            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-[15px] font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Pay ₹9 & Secure Spot</span>
                </>
              )}
            </button>
          </div>
          
          <p className="text-center text-xs font-medium text-zinc-400 px-4">
            Payments are securely processed via Cashfree. By proceeding, you agree to our terms of service.
          </p>

        </div>

        <ErrorModal
          isOpen={errorInfo.isOpen}
          onClose={() => setErrorInfo({ ...errorInfo, isOpen: false })}
          message={errorInfo.message}
        />
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <PricingCards />
    </Suspense>
  );
}