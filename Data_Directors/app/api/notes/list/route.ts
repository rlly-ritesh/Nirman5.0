import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function GET() {
  try {
    console.log(
      `[NOTES/LIST] Calling backend at: ${BACKEND_URL}/api/notes/list`
    );

    const response = await fetch(`${BACKEND_URL}/api/notes/list`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    console.log(`[NOTES/LIST] Backend response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    console.log(
      `[NOTES/LIST] Raw backend response:`,
      JSON.stringify(data).substring(0, 300)
    );
    console.log(
      `[NOTES/LIST] Backend returned ${data.files?.length || 0} files`
    );

    return NextResponse.json(data);
  } catch (error) {
    console.log("[NOTES/LIST] Backend not available, returning empty list");
    // Return empty list when backend is not available
    return NextResponse.json(
      { status: "success", files: [] },
      { status: 200 }
    );
  }
}
