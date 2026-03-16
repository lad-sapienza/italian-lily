import React, { useState } from "react"
import { Link } from "gatsby"

const Chevron = ({ direction = "left" }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {direction === "left" ? (
      <path d="M15 18l-6-6 6-6" />
    ) : (
      <path d="M9 6l6 6-6 6" />
    )}
  </svg>
)

export const MiniSchedina = ({ items, type }) => {
  const [index, setIndex] = useState(0)

  if (!items || items.length === 0) {
    return <div className="text-muted small mt-auto">Nessun {type} associato</div>
  }

  const current = items[index]
  const canScroll = items.length > 1
  const fonteId = current?.f_fonti_id?.id ?? current?.f_fonti_id

  const next = () => {
    if (!canScroll) return
    setIndex((prev) => (prev + 1) % items.length)
  }

  const prev = () => {
    if (!canScroll) return
    setIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  if (type === "luogo") {
    return (
      <div>
        <div className="d-flex align-items-center">
          <button
            className="btn btn-sm p-0 me-2"
            onClick={prev}
            style={{ border: "none", background: "none" }}
          >
            ◀
          </button>

          <div className="flex-grow-1 p-2 bg-white rounded border">
            <div className="fw-semibold">{current.f_luoghi_id?.nome_localita}</div>
            {current.spostato_in_qualita_di && (
              <div className="small">As: {current.spostato_in_qualita_di}</div>
            )}
            {current.prima_attestazione_anno && (
              <div className="small">From: {current.prima_attestazione_anno}</div>
            )}
            {current.ultima_attestazione_anno && (
              <div className="small">To: {current.ultima_attestazione_anno}</div>
            )}
          </div>

          <button
            className="btn btn-sm p-0 ms-2"
            onClick={next}
            style={{ border: "none", background: "none" }}
          >
            ▶
          </button>
        </div>

        <div className="text-center small text-muted mt-1">
          {index + 1} di {items.length}
        </div>
      </div>
    )
  }

  return (
    <div
      className="position-relative h-100"
      style={{
        width: "100%",
        minHeight: 0,
      }}
    >
      {canScroll && (
        <button
          onClick={prev}
          aria-label="Previous volume"
          style={{
            position: "absolute",
            left: "0",
            top: "50%",
            transform: "translateY(-50%)",
            width: "32px",
            height: "120px",
            border: "none",
            borderRadius: "999px",
            background: "rgba(0,0,0,0.035)",
            color: "#666",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 3,
          }}
        >
          <Chevron direction="left" />
        </button>
      )}

      {canScroll && (
        <button
          onClick={next}
          aria-label="Next volume"
          style={{
            position: "absolute",
            right: "0",
            top: "50%",
            transform: "translateY(-50%)",
            width: "32px",
            height: "120px",
            border: "none",
            borderRadius: "999px",
            background: "rgba(0,0,0,0.035)",
            color: "#666",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 3,
          }}
        >
          <Chevron direction="right" />
        </button>
      )}

      <div
        style={{
          height: "100%",
          width: "100%",
          paddingLeft: canScroll ? "2.75rem" : "0",
          paddingRight: canScroll ? "2.75rem" : "0",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            overflowY: "auto",
            padding: "0.5rem 0.25rem 0.5rem 0.25rem",
            background: "transparent",
          }}
        >
          <div
            style={{
              width: "100%",
              margin: "0 auto",
              padding: "0.5rem 0.25rem 0.75rem 0.25rem",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#8a6f6f",
                marginBottom: "0.45rem",
              }}
            >
              Associated volume
            </div>

            <div
              style={{
                fontSize: "1.1rem",
                lineHeight: "1.45",
                color: "#4a3a3a",
                marginBottom: "0.85rem",
                wordBreak: "break-word",
              }}
            >
              {fonteId ? (
                <Link
                  to={`/book/?tb=f_fonti&id=${fonteId}`}
                  className="text-decoration-none"
                  style={{ color: "#4a3a3a" }}
                >
                  {current.f_fonti_id?.titolo_breve || "Untitled"}
                </Link>
              ) : (
                current.f_fonti_id?.titolo_breve || "Untitled"
              )}
            </div>

            {current.f_fonti_id?.titolo_esteso && (
              <div
                className="small text-muted mb-3"
                style={{
                  lineHeight: "1.65",
                }}
                dangerouslySetInnerHTML={{ __html: current.f_fonti_id.titolo_esteso }}
              />
            )}

            {current.tipo_di_rapporto?.length > 0 && (
              <div
                className="small mb-2"
                style={{
                  color: "#6d5b5b",
                  lineHeight: "1.6",
                }}
              >
                <span className="fw-semibold">Role:</span>{" "}
                {current.tipo_di_rapporto.join(", ")}
              </div>
            )}

            {current.note_sul_rapporto_ && (
              <div
                className="small"
                style={{
                  color: "#666",
                  lineHeight: "1.7",
                }}
                dangerouslySetInnerHTML={{ __html: current.note_sul_rapporto_ }}
              />
            )}

            <div
              className="small mt-3"
              style={{
                color: "#9a9a9a",
              }}
            >
              {index + 1} / {items.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}