import React, { useState } from "react"
import { useMapEvent } from "react-leaflet/hooks"
import L from "leaflet"

const getFeaturesInView = map => {
  var features = []
  map.eachLayer(function (lyr) {
    if (lyr instanceof L.Marker) {
      if (map.getBounds().contains(lyr.getLatLng())) {
        features.push(lyr.feature)
      }
    }
  })
  return features
}

const ListVisibleFeatures = ({ elTemplate }) => {
  const [lyrList, setLyrList] = useState([])

  const map = useMapEvent("moveend", () => {
    setLyrList(getFeaturesInView(map))
  })

  if (lyrList.length === 0) {
    return <></>
  } else {
    return (
      <div>
        <div className="leaflet-bottom leaflet-left">
          <div className="leaflet-control leaflet-bar m-1 p-1" style={{
            maxHeight: '200px',
            overflow: 'auto',
            background: 'rgba(255, 255, 255, .7)'
          }}>
            <div className="border-bottom mb-1">Items: <strong>{lyrList.length}</strong></div>
            {lyrList.map((l, i) => {
              return <React.Fragment key={i}>{elTemplate(l)}</React.Fragment>
            })}
          </div>
        </div>
      </div>
    )
  }
}

export { ListVisibleFeatures }
