"use client";

import React, { useEffect, useRef, useState } from "react";

export default function VisualizePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dynamically load the graph HTML content into an iframe
    if (containerRef.current) {
      const iframe = document.createElement("iframe");
      iframe.src = "/graph";
      iframe.style.width = "100%";
      iframe.style.height = "100vh";
      iframe.style.border = "none";
      iframe.style.margin = "0";
      iframe.style.padding = "0";

      iframe.onload = () => {
        setIsLoading(false);
      };

      containerRef.current.appendChild(iframe);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}
    >
      {isLoading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#1a1a2e",
            color: "white",
            fontSize: "18px",
          }}
        >
          Loading visualization...
        </div>
      )}
    </div>
  );
}
