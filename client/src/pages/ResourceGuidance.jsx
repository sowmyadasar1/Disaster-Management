import React from "react";

export default function ResourceGuidance() {
  const steps = [
    "/images/resource-guidance/1.png",
    "/images/resource-guidance/2.png",
    "/images/resource-guidance/3.png",
    "/images/resource-guidance/4.png",
    "/images/resource-guidance/5.png",
    "/images/resource-guidance/6.png",
    "/images/resource-guidance/7.png",
    "/images/resource-guidance/8.png",
  ];

  return (
    <div
      style={{
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "40px",
        backgroundColor: "#f0f2f5", // light background for the page
        minHeight: "100vh",
      }}
    >
      {steps.map((img, index) => (
        <div
          key={index}
          style={{
            width: "100%",               // almost full width
            maxWidth: "1200px",          // cap on very large screens
            backgroundColor: "#ffffff", // white card background
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <img
            src={img}
            alt={`Step ${index + 1}`}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      ))}
    </div>
  );
}
