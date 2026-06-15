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
import { Calendar03Icon } from "@hugeicons/core-free-icons";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function PricingCards() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const igId = searchParams.get("igId");
  const date = searchParams.get("date");

  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState({ isOpen: false, message: "" });

  const handlePayment = async (planName: string) => {
    if (!igId) {
      setErrorInfo({
        isOpen: true,
        message: "Missing User ID. Please restart from the profile.",
      });
      return;
    }
    setLoading(true);

    try {
      const cashfree = await load({ mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT as "sandbox" | "production" });
      if (!cashfree) {
        throw new Error(
          "Failed to load payment gateway. Please check your connection.",
        );
      }


      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || ""}/api/payments/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            igAccountId: igId,
            planName: planName,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to initiate payment on the server.",
        );
      }

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
      } else {
        throw new Error("No session ID returned");
      }
    } catch (error) {
      setErrorInfo({
        isOpen: true,
        message: "Could not connect to payment gateway.",
      });

      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-dvh w-full items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8 ${jakarta.className}`}
    >
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Confirm your booking
          </h1>
          <p className="text-base font-medium text-zinc-500">
            You&apos;re almost there!
          </p>
        </div>

        {/* Pricing Cards Container */}
        <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
          {/* ----------------- BASIC CARD (₹9) ----------------- */}
          <div className="relative flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[32px] border border-zinc-200 bg-white p-8 shadow-xl shadow-black/3">
            <div>
              {/* Top Row: Title & Price */}
              <div className="mb-8 flex items-start justify-between border-b border-zinc-100 pb-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">
                    Live Chat Session
                  </h3>
                  <p className="mt-1 text-sm font-medium text-zinc-500">
                    Available for a limited time
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-extrabold tracking-tight text-zinc-900">
                    ₹5
                  </span>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                    per session
                  </p>
                </div>
              </div>

              {/* Feature List */}
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                    <HugeiconsIcon size={14} icon={Calendar03Icon} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Scheduled Date
                    </p>
                    <p className="text-sm font-medium text-zinc-500">
                      {date || "Today"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                    <MessageCircle size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Direct Messages
                    </p>
                    <p className="text-sm font-medium text-zinc-500">
                      Casual, friendly 1-on-1 chat
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <ImageOff size={14} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Text Only</p>
                    <p className="text-sm font-medium text-zinc-500">
                      No photo or picture sharing allowed
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <Ban size={14} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Strictly SFW
                    </p>
                    <p className="text-sm font-medium text-zinc-500">
                      No adult content or nudes allowed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={() => handlePayment("Daily")}
              disabled={loading}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-[15px] font-bold text-white shadow-md transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:scale-100 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Pay ₹5 & Secure Spot</span>
                </>
              )}
            </button>
          </div>

          {/* ----------------- PREMIUM CARD (₹99) ----------------- */}
          {/* <div className="relative flex w-full flex-1 flex-col justify-between overflow-hidden rounded-[32px] border border-zinc-200 bg-white p-8 shadow-xl shadow-black/3">
            <div>
             
              <div className="mb-8 flex items-start justify-between border-b border-zinc-100 pb-6">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">Premium</h3>
                  <p className="mt-1 text-sm font-medium text-zinc-500">
                    24 Hours
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-extrabold tracking-tight text-zinc-900">
                    ₹99
                  </span>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                    One Time
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                    <HugeiconsIcon size={14} icon={Calendar03Icon} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Scheduled Date
                    </p>
                    <p className="text-sm font-medium text-zinc-500">
                      {date || "Today"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                    <MessageCircle size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Private Messaging
                    </p>
                    <p className="text-sm font-medium text-zinc-500">
                      Intimate, unrestricted 1-on-1 conversations
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-500">
                    <CircleCheck size={14} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Multimedia Supported
                    </p>
                    <p className="text-sm font-medium text-zinc-500">
                      Exchange text, photos, and private media
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                 
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-500">
                    <CircleCheck size={14} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      18+ Content Permitted
                    </p>
                    <p className="text-sm font-medium text-zinc-500">
                      Uncensored mature and explicit content allowed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handlePayment("Premium")}
              disabled={loading}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-[15px] font-bold text-white shadow-md transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:scale-100 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Pay ₹99 & Secure Spot</span>
                </>
              )}
            </button>
          </div> */}
        </div>

        {/* Footer Text */}
        <p className="px-4 text-center text-xs font-medium text-zinc-400">
          Payments are securely processed via Cashfree. By proceeding, you agree
          to our terms of service.
        </p>
      </div>

      <ErrorModal
        isOpen={errorInfo.isOpen}
        onClose={() => setErrorInfo({ ...errorInfo, isOpen: false })}
        message={errorInfo.message}
      />
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
