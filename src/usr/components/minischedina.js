import React, { useState } from "react"

export const MiniSchedina = ({ items, type }) => {
  const [index, setIndex] = useState(0)
  if (!items || items.length === 0) {
    return <div className="text-muted small mt-auto">Nessun {type} associato</div>
  }

  const current = items[index]

  const next = () => setIndex((prev) => (prev + 1) % items.length)
  const prev = () => setIndex((prev) => (prev - 1 + items.length) % items.length)

  return (
    <div>
      <div className="d-flex align-items-center">
        <button className="btn btn-sm p-0 me-2" onClick={prev} style={{ border: 'none', background: 'none' }}>
          ◀
        </button>
        <div className="flex-grow-1 p-2 bg-white rounded border">
          {type === "luogo" ? (
            <>
              <div className="fw-semibold">{current.f_luoghi_id?.nome_localita}</div>
              {current.spostato_in_qualita_di && <div className="small">As: {current.spostato_in_qualita_di}</div>}
              {current.prima_attestazione_anno && <div className="small">From: {current.prima_attestazione_anno}</div>}
              {current.ultima_attestazione_anno && <div className="small">To: {current.ultima_attestazione_anno}</div>}
            </>
          ) : (
            <>
              <div className="fw-semibold">{current.f_fonti_id?.titolo_breve}</div>
              {current.f_fonti_id?.titolo_esteso && (
                <div
                  className="small text-muted"
                  dangerouslySetInnerHTML={{ __html: current.f_fonti_id.titolo_esteso }}
                />
              )}
              {current.tipo_di_rapporto?.length > 0 && (
                <div className="small">Role: {current.tipo_di_rapporto.join(', ')}</div>
              )}
              {current.note_sul_rapporto_ && (
                <div
                  className="small"
                  dangerouslySetInnerHTML={{ __html: current.note_sul_rapporto_ }}
                />
              )}
            </>
          )}
        </div>
        <button className="btn btn-sm p-0 ms-2" onClick={next} style={{ border: 'none', background: 'none' }}>
          ▶
        </button>
      </div>
      <div className="text-center small text-muted mt-1">{index + 1} di {items.length}</div>
    </div>
  )
}
