import { readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const filePath = join(process.cwd(), "graph-viz-fixed.html");
    const htmlContent = readFileSync(filePath, "utf-8");

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error reading graph HTML:", error);
    return NextResponse.json(
      { error: "Failed to load graph visualization" },
      { status: 500 }
    );
  }
}
