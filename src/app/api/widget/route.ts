import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://cdn.userjot.com/sdk/v2/uj.js", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch widget" }, { status: 500 });
    }

    const script = await response.text();

    return new Response(script, {
      headers: {
        "Content-Type": "application/javascript",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Widget proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch widget" }, { status: 500 });
  }
}
