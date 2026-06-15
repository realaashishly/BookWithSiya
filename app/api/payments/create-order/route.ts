import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const backendUrl =
      process.env.NEXT_PUBLIC_EXPRESS_SERVER_URL || "http://localhost:8000";
    const targetUrl = `${backendUrl}/api/payments/create/order`;

    console.log(`[Next.js Proxy] Forwarding payment request to: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[Next.js Proxy] CRITICAL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Backend communication failed",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}
