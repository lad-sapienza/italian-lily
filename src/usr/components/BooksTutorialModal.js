import React, { useState, useEffect } from "react";

/**
 * BooksTutorialModal – v2
 * ------------------------------------------------------------
 * 4‑step guided tour for the Books page.
 * Images are served from /static/image (Gatsby → /image/...).
 * ------------------------------------------------------------
 */

const BooksTutorialModal = ({ show, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedImg, setExpandedImg] = useState(null); // url string or null

  /* Body scroll lock when modal open */
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [show]);

  /* --------------------------------------------------------------------
   * Steps configuration
   * ------------------------------------------------------------------ */
  const steps = [
    {
      title: "Welcome",
      content:
        "This page allows you to explore editions printed in France between 1500 and 1599. Use the filters on the left to narrow results and click any title to view full details. This brief tour explains the interface.",
      img: "/image/presentation.png", // small preview, expandable
      layout: "top", // img below text (default)
    },
    {
      title: "Result Card Illustration",
      content: "", // image only
      img: "/image/explanation_card.png",
      layout: "img-only", // large image centred
    },
    {
      title: "Publication Details & People", // text‑only step
      content: null,
      img: null,
      layout: "text-only",
    },
    {
      title: "Filter Dashboard",
      content:
        "The left-hand panel lets you filter results based on:\n• Genre — specifies the type of content.\n• Language — shows the language of the edition.\n• Format — indicates the bibliographic format.\n• Place of Printing — restricts by printing location.\n• Toggles — Has Paratext, Has Privilege, Has Digital Copy.\n• Year Range — drag the slider to focus on a specific period.",
      img: "/image/dashboard.png",
      layout: "side", // image left, text right
    },
  ];

  /** Navigation actions */
  const nextStep = () => setCurrentStep((s) => (s < steps.length - 1 ? s + 1 : (onClose(), s)));
  const prevStep = () => setCurrentStep((s) => (s > 0 ? s - 1 : s));

  if (!show) return null;
  const step = steps[currentStep];

  /* Helper: renders image with expandable click */
  const renderImg = (url, styleExtra = {}) => (
    <img
      src={url}
      alt={`Example – step ${currentStep + 1}`}
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

/* Publication Details / People – static text */
const publicationDetails = (
  <div style={{ lineHeight: 1.6, fontSize: 16, color: "#5c3944" }}>
    <h4 style={{ marginTop: 0, color: "#a76d77" }}>Publication Details</h4>
    <ul style={{ paddingLeft: 20 }}>
      <li><strong>Publication Year</strong> — This field indicates the year in which a work is printed (the time frame ranges from 1500 to 1599).</li>
      <li><strong>Place of Printing</strong> — This field indicates the place in France where a work is printed (the place name is given in French and, in brackets, the corresponding translation in Italian).</li>
      <li><strong>Format</strong> — This field indicates the format in which a work is realized.</li>
      <li><strong>Language</strong> — This field indicates the language in which a work is written.</li>
      <li><strong>Digital Copy</strong> — This field contains the link to the digital copy consulted.</li>
      <li><strong>Library Holding</strong> — This field indicates the institution where the physical copy consulted of a work is held.</li>
    </ul>

    <h4 style={{ color: "#a76d77" }}>People</h4>
    <p style={{ marginBottom: 10 }}>
      Only roles present in an edition are displayed; missing roles are hidden. Possible
      roles include:
    </p>
    <ul style={{ paddingLeft: 20 }}>
      <li><strong>Author</strong> — This field indicates who wrote a work.</li>
      <li><strong>Authority granting book privilege</strong> — This field indicates which authority granted a privilege associated to a work.</li>
      <li><strong>Beneficiary of book privilege</strong> — This field indicates the beneficiary/s of the privilege associated to an edition.</li>
      <li><strong>Book Licensing Authority</strong> — This field indicates which authority granted a licence associated to a work.</li>
      <li><strong>Commentator</strong> — This field indicates the commentator/s of a work.</li>
      <li><strong>Dedicatee</strong> — This field indicates to which individual/s a work is dedicated.</li>
      <li><strong>Dedicator</strong> — This field indicates the author/s of the dedication or dedications in a work.</li>
      <li><strong>Editor</strong> — This field indicates the scientific editor/s of a work.</li>
      <li><strong>Bookseller</strong> — This field indicates the individual/s selling a work.</li>
      <li><strong>Printer</strong> — This field indicates the printer/s of a work.</li>
      <li><strong>Publisher</strong> — This field indicates the funding provider/s of a work.</li>
      <li><strong>Translator</strong> — This field indicates the translator/s of a work.</li>
      <li><strong>Other</strong> — This field indicates people involved in an edition without a specific role.</li>
    </ul>
  </div>
);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="books-tutorial-heading"
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
          onKeyDown={(e) => (e.key === "Escape" ? setExpandedImg(null) : null)}
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
            Books – Tour {currentStep + 1} / {steps.length}
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

        {/* Body content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 30 }}>
          {/* Heading badge & title */}
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
            <h3 id="books-tutorial-heading" style={{ margin: 0, color: "#5c3944", fontSize: 22 }}>
              {step.title}
            </h3>
          </div>

          {/* Dynamic layout rendering */}
          {/* 1. Text on top, img below */}
          {step.layout === "top" && (
            <>
              <p style={{ whiteSpace: "pre-line", color: "#5c3944", fontSize: 16, lineHeight: 1.65, marginBottom: 26 }}>
                {step.content}
              </p>
              {step.img && renderImg(step.img)}
            </>
          )}

          {/* 2. Image only */}
          {step.layout === "img-only" && (
            <div style={{ display: "flex", justifyContent: "center" }}>{renderImg(step.img, { maxHeight: 400 })}</div>
          )}

          {/* 3. Text only (publication details & people) */}
          {step.layout === "text-only" && publicationDetails}

          {/* 4. Side by side (image left, text right) */}
          {step.layout === "side" && (
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 24 }}>
              <div style={{ flex: "0 0 45%" }}>{renderImg(step.img, { width: "100%", maxHeight: 400 })}</div>
              <div style={{ flex: "1 1 55%" }}>
                <p
                  style={{
                    whiteSpace: "pre-line",
                    color: "#5c3944",
                    fontSize: 16,
                    lineHeight: 1.65,
                  }}
                >
                  {step.content}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer – navigation controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "18px 30px",
            borderTop: "1px solid rgba(212,201,168,0.5)",
          }}
        >
          {/* Prev */}
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              padding: "10px 22px",
              backgroundColor: currentStep === 0 ? "rgba(90,74,58,0.15)" : "rgba(90,74,58,0.35)",
              border: "none",
              borderRadius: 25,
              color: currentStep === 0 ? "rgba(90,74,58,0.5)" : "#5c3944",
              cursor: currentStep === 0 ? "not-allowed" : "pointer",
              fontSize: 15,
            }}
          >
            Back
          </button>

          {/* Dots navigation */}
          <div style={{ display: "flex", gap: 10 }}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                role="button"
                tabIndex={0}
                aria-label={`Go to step ${idx + 1}`}
                onClick={() => setCurrentStep(idx)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? setCurrentStep(idx) : null)}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: idx === currentStep ? "#5c3944" : "rgba(90,74,58,0.35)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          {/* Next */}
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

export default BooksTutorialModal;
