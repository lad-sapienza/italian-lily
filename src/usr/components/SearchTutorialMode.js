// src/components/SearchTutorialMode.js
import React, { useState, useEffect } from "react";

/**
 * SearchTutorialMode
 * ------------------------------------------------------------
 * 3-step guided tour for the Search interface.
 * Images are served from /static/image (Gatsby → /image/...).
 * ------------------------------------------------------------
 */
const SearchTutorialMode = ({ show, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedImg, setExpandedImg] = useState(null);

  // lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  /* ------------------------------------------------------------------
   * Steps configuration
   * ----------------------------------------------------------------*/
  const steps = [
    {
      title: "Explore the data: learn how to use",
      img: "/images/search_explanation_final.png",
      layout: "img-only",    // just the image under the title
    },
    {
      title: "Search Criteria",
      layout: "text-only",   // full‐text box with fields, operators, infos
    },
    {
      title: "The Results",
      img: "/images/explanation_card_output.png",
      layout: "img-only",
    },
  ];

  // Static text for step 2
  const searchInstructions = (
    <div style={{ lineHeight: 1.6, fontSize: 16, color: "#5c3944" }}>
      <h4 style={{ marginTop: 0, color: "#a76d77" }}>FIELDS</h4>
      <ul style={{ paddingLeft: 20 }}>
        <li>
          <strong>Full Title</strong> — This field shows the complete title of a work as it appears on the Title Page.
        </li>
        <li>
          <strong>Genre</strong> — This field indicates whether an edition belongs to the category/macro-area of historical or legal works.
        </li>
        <li>
          <strong>Language</strong> — This field shows the language in which a work is written.
        </li>
      </ul>

      <h4 style={{ color: "#a76d77" }}>OPERATORS</h4>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Equals</strong> — matches records whose field value is exactly the one you enter.</li>
        <li><strong>Doesn't equal</strong> — matches records whose field value is different from the one you enter.</li>
        <li><strong>Less than</strong> — matches numeric or date values strictly below the entered value.</li>
        <li><strong>Less than or equal to</strong> — matches values below or exactly equal to the entered value.</li>
        <li><strong>Greater than</strong> — matches values strictly above the entered value.</li>
        <li><strong>Greater than or equal to</strong> — matches values above or exactly equal to the entered value.</li>
        <li><strong>Is null</strong> — matches records where the field has no value.</li>
        <li><strong>Isn't null</strong> — matches records where the field contains any value.</li>
        <li><strong>Contains</strong> — matches records whose field includes the given substring.</li>
        <li><strong>Doesn't contain</strong> — matches records whose field does not include the given substring.</li>
        <li><strong>Starts with</strong> — matches records whose field begins with the given substring.</li>
        <li><strong>Doesn't start with</strong> — excludes records whose field begins with the given substring.</li>
        <li><strong>Ends with</strong> — matches records whose field ends with the given substring.</li>
        <li><strong>Doesn't end with</strong> — excludes records whose field ends with the given substring.</li>
        <li><strong>Is empty</strong> — matches records whose field is the empty string.</li>
        <li><strong>Isn't empty</strong> — matches records whose field is not the empty string.</li>
      </ul>

      <h4 style={{ color: "#a76d77" }}>ADDITIONAL INFORMATION</h4>
      <ul style={{ paddingLeft: 20 }}>
        <li>
          <strong>AND / OR criteria</strong> — Combine multiple filters:
          <br />• <em>AND</em> means all criteria must be met.
          <br />• <em>OR</em> means any one of the criteria may be met.
        </li>
        <li>
          <strong>Case-insensitive</strong> — letter-case differences are ignored (so “Art” and “art” are treated the same).
        </li>
      </ul>
    </div>
  );

  /** Navigation */
  const nextStep = () =>
    setCurrentStep(s => (s < steps.length - 1 ? s + 1 : (onClose(), s)));
  const prevStep = () => setCurrentStep(s => (s > 0 ? s - 1 : s));

  /** Helper: renders image with zoom-in click */
  const renderImg = (url, styleExtra = {}) => (
    <img
      src={url}
      alt={`Step ${currentStep + 1}`}
      style={{
        cursor: "zoom-in",
        borderRadius: 12,
        maxWidth: "100%",
        height: "auto",
        ...styleExtra,
      }}
      onClick={() => setExpandedImg(url)}
    />
  );

  if (!show) return null;
  const step = steps[currentStep];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-tutorial-heading"
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
          role="button"
          tabIndex={0}
          onClick={() => setExpandedImg(null)}
          onKeyDown={e => e.key === "Escape" && setExpandedImg(null)}
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
            alt="Expanded"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: 12 }}
          />
        </div>
      )}

      {/* Main modal card */}
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
            backgroundColor: "#a76d77",
            color: "white",
            fontSize: 18,
            fontWeight: 600,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            Search Tutorial {currentStep + 1} / {steps.length}
          </span>
          <button
            aria-label="Close tutorial"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: 24,
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 30 }}>
          {/* Step badge & title */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
            <div
              style={{
                width: 44,
                height: 44,
                backgroundColor: "#a76d77",
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
              id="search-tutorial-heading"
              style={{ margin: 0, color: "#5c3944", fontSize: 22 }}
            >
              {step.title}
            </h3>
          </div>

          {/* Content by layout */}
          {step.layout === "top" && (
            <>
              <p
                style={{
                  whiteSpace: "pre-line",
                  color: "#5c3944",
                  fontSize: 16,
                  lineHeight: 1.65,
                  marginBottom: 26,
                }}
              >
                {step.content}
              </p>
              {step.img && renderImg(step.img)}
            </>
          )}

          {step.layout === "img-only" && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              {renderImg(step.img, { maxHeight: 400 })}
            </div>
          )}

          {step.layout === "text-only" && searchInstructions}
        </div>

        {/* Footer: navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "18px 30px",
            borderTop: "1px solid rgba(212,201,168,0.5)",
          }}
        >
          {/* Back */}
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
              color: currentStep === 0 ? "rgba(90,74,58,0.5)" : "#5c3944",
              cursor: currentStep === 0 ? "not-allowed" : "pointer",
              fontSize: 15,
            }}
          >
            Back
          </button>

          {/* Dots */}
          <div style={{ display: "flex", gap: 10 }}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                aria-label={`Go to step ${idx + 1}`}
                onClick={() => setCurrentStep(idx)}
                onKeyDown={e =>
                  (e.key === "Enter" || e.key === " ") && setCurrentStep(idx)
                }
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor:
                    idx === currentStep ? "#5c3944" : "rgba(90,74,58,0.35)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          {/* Next / Finish */}
          <button
            onClick={nextStep}
            style={{
              padding: "10px 28px",
              backgroundColor: "#a76d77",
              border: "none",
              borderRadius: 25,
              color: "white",
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchTutorialMode;
