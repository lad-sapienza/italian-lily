import React, { useState, useEffect } from "react";
import { Accordion, Row, Col, Stack, Button } from "react-bootstrap";
import { GatsbyImage, getImage, StaticImage, useStaticQuery, graphql } from "gatsby-plugin-image";

/**
 * BookRecordTutorialModal
 * ------------------------------------------------------------
 * 3-step guided tour for the Book Record pages.
 * Images are served from /static/image (Gatsby → /public/static/…).
 * ------------------------------------------------------------
 */
const BookRecordTutorialModal = ({ show, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedImg, setExpandedImg] = useState(null);

  // Body scroll lock when modal open
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [show]);

  // --------------------------------------------------
  // 1) Carico le immagini via GraphQL
  // --------------------------------------------------
  const data = useStaticQuery(graphql`
    query TutorialImages {
      twoColumns: file(relativePath: { eq: "images/two_columns_view.png" }) {
        childImageSharp {
          gatsbyImageData(width: 800, placeholder: BLURRED)
        }
      }
      verticalView: file(relativePath: { eq: "images/vertical_view.png" }) {
        childImageSharp {
          gatsbyImageData(width: 800, placeholder: BLURRED)
        }
      }
    }
  `);

  // Body static text
  const fieldsOverview = (
    <div style={{ lineHeight: 1.6, fontSize: 16, color: "#5c3944" }}>
      {/* … qui lasci tutto com’è … */}
    </div>
  );

  // --------------------------------------------------
  // 2) Configuro i passi, associando a ciascuno l’‘imageData’ se serve
  // --------------------------------------------------
  const steps = [
    {
      title: "Two Columns Record Page",
      layout: "img-only",
      imageData: getImage(data.twoColumns),
      imgAlt: "Vista a due colonne della scheda",
    },
    {
      title: "Vertical View Record Page",
      layout: "img-only",
      imageData: getImage(data.verticalView),
      imgAlt: "Vista verticale della scheda",
    },
    {
      title: "Fields Overview",
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

  // --------------------------------------------------
  // 3) Helper per il rendering dell’immagine con GatsbyImage
  // --------------------------------------------------
  const renderGatsbyImg = (imageData, alt) => (
    <GatsbyImage
      image={imageData}
      alt={alt}
      style={{
        cursor: "zoom-in",
        borderRadius: 12,
        maxWidth: "100%",
        height: "auto",
      }}
      onClick={() => {
        // GatsbyImage non espone direttamente la src: usa un <img> normale per l’overlay
        const img = document.createElement("img");
        img.src = imageData.images.fallback.src;
        img.alt = alt;
        setExpandedImg(img.src);
      }}
    />
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="record-tutorial-heading"
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
          onKeyDown={(e) =>
            e.key === "Escape" ? setExpandedImg(null) : null
          }
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
            Step {currentStep + 1} of {steps.length}
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
              id="record-tutorial-heading"
              style={{ margin: 0, color: "#5c3944", fontSize: 22 }}
            >
              {step.title}
            </h3>
          </div>

          {/* Layouts */}
          {step.layout === "img-only" && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              {renderGatsbyImg(step.imageData, step.imgAlt)}
            </div>
          )}

          {step.layout === "text-only" && fieldsOverview}
        </div>

        {/* Footer nav */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "18px 30px",
            borderTop: "1px solid rgba(212,201,168,0.5)",
          }}
        >
          <Button
            variant="outline-secondary"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <div style={{ display: "flex", gap: 10 }}>
            {steps.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentStep(idx)}
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor:
                    idx === currentStep
                      ? "#5c3944"
                      : "rgba(90,74,58,0.35)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
          <Button variant="primary" onClick={nextStep}>
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookRecordTutorialModal;
