import React, { useState, useEffect } from "react";

/**
 * TutorialModal – v3
 * ------------------------------------------------------------
 * 4-step guided tour for the WebGIS page.
 * Images are served from /static/image → /image/...
 * ------------------------------------------------------------
 */
const TutorialModal = ({ show, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedImg, setExpandedImg] = useState(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  const steps = [
    {
      title: "Introduction",
      content:
        "Welcome to the WebGIS page. Here you can interactively explore historical movements directly on the map below.",
      img: "/image/map.png",      // static, not expandable
      layout: "top",
    },
    {
      title: "Timeline & Dashboard",
      content:
        "Timeline — drag the time slider to select the year range you want to explore.\n" +
        "Dashboard — view aggregated data: a histogram for years and a pie chart for locations.",
      img: "/image/map_explanation.png", // expandable
      layout: "top",  // text above, image below
    },
    {
      title: "Additional Note",
      content:
        "The start and end dates may sometimes be hypothetical, based on deductions from historical written sources.",
      img: null,
      layout: "text-only",
    },
    {
      title: "Download & Export",
      content:
        "Use the “Download” button at the top-left of the map to export data.\n\n" +
        "• Format — choose CSV, JSON, or GeoJSON.\n" +
        "• Scope — choose between Visible extent (current map view + timeline filter) or All data shown on the map (timeline filter only).\n" +
        "• The exported archive includes a README text file describing all columns.\n\n" +
        "Tip: to export only what you are seeing, first set the time range, then pan/zoom the map to the area of interest before choosing “Visible extent”.\n\n",
      img: null,
      layout: "text-only",
    },
  ];

  const nextStep = () =>
    setCurrentStep((s) =>
      s < steps.length - 1 ? s + 1 : (onClose(), s)
    );
  const prevStep = () =>
    setCurrentStep((s) => (s > 0 ? s - 1 : s));

  if (!show) return null;
  const step = steps[currentStep];

  // Helper: renders an expandable image
  const renderExpandableImg = (url, styleExtra = {}) => (
    <img
      src={url}
      alt={`Step ${currentStep + 1} illustration`}
      style={{
        cursor: "zoom-in",
        borderRadius: 12,
        maxWidth: "100%",
        height: "auto",
        ...styleExtra,
      }}
      onClick={() => setExpandedImg(url)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setExpandedImg(url);
      }}
    />
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutorial-heading"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(5px)",
        zIndex: 2000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Expanded image overlay */}
      {expandedImg && (
        <div
          onClick={() => setExpandedImg(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter" || e.key === " ")
              setExpandedImg(null);
          }}
          role="button"
          tabIndex={0}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            cursor: "zoom-out",
            zIndex: 2100,
          }}
        >
          <img
            src={expandedImg}
            alt="Expanded illustration"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 12 }}
          />
        </div>
      )}

      {/* Modal card */}
      <div
        style={{
          width: "90%",
          maxWidth: 700,
          maxHeight: "80vh",
          backgroundColor: "rgba(255,255,255,0.97)",
          borderRadius: 18,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 20,
            backgroundColor: "#5a4a3a",
            color: "white",
            fontSize: 18,
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span id="tutorial-heading">
            Tutorial – Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={onClose}
            aria-label="Close tutorial"
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: 24,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 30,
          }}
        >
          {/* Title badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                backgroundColor: "#5a4a3a",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 18,
                color: "white",
                fontWeight: "bold",
                fontSize: 20,
              }}
            >
              {currentStep + 1}
            </div>
            <h3
              style={{
                margin: 0,
                color: "#5a4a3a",
                fontSize: 22,
              }}
            >
              {step.title}
            </h3>
          </div>

          {/* Content & image rendering */}
          {step.layout === "top" && (
            <>
              <p
                style={{
                  whiteSpace: "pre-line",
                  color: "#5a4a3a",
                  fontSize: 16,
                  lineHeight: 1.6,
                  marginBottom: 26,
                }}
              >
                {step.content}
              </p>
              {step.img && currentStep === 0 && (
                <img
                  src={step.img}
                  alt="Overview map"
                  style={{
                    display: "block",
                    margin: "0 auto",
                    maxWidth: 250,
                    borderRadius: 12,
                  }}
                />
              )}
              {step.img && currentStep === 1 && (
                <div style={{ textAlign: "center" }}>
                  {renderExpandableImg(step.img, { maxHeight: 400 })}
                </div>
              )}
            </>
          )}

          {step.layout === "text-only" && (
            <p
              style={{
                whiteSpace: "pre-line",
                color: "#5a4a3a",
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              {step.content}
            </p>
          )}
        </div>

        {/* Footer navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "18px 30px",
            borderTop: "1px solid rgba(212,201,168,0.5)",
          }}
        >
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              padding: "10px 22px",
              backgroundColor:
                currentStep === 0
                  ? "rgba(90,74,58,0.15)"
                  : "rgba(90,74,58,0.35)",
              border: "none",
              borderRadius: 25,
              color:
                currentStep === 0
                  ? "rgba(90,74,58,0.5)"
                  : "#5a4a3a",
              cursor:
                currentStep === 0 ? "not-allowed" : "pointer",
              fontSize: 15,
            }}
          >
            Back
          </button>

          <div style={{ display: "flex", gap: 10 }}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                aria-label={`Go to step ${idx + 1}`}
                onClick={() => setCurrentStep(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setCurrentStep(idx);
                }}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor:
                    idx === currentStep
                      ? "#5a4a3a"
                      : "rgba(90,74,58,0.35)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            style={{
              padding: "10px 28px",
              backgroundColor: "#5a4a3a",
              border: "none",
              borderRadius: 25,
              color: "white",
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            {currentStep === steps.length - 1
              ? "Finish"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
