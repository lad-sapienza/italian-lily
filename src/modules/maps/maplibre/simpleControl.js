import React from "react"
import ReactDOM from "react-dom/client"
import ControlPanel from "./controlPanel"

class SimpleControl {
  onAdd(map) {
    this.map = map
    this.container = document.createElement("div")
    this.container.classList.add("maplibregl-ctrl", "maplibregl-ctrl-group")
    
    // Crea il root per React all'interno di this.container e rendi il ControlPanel
    this.root = ReactDOM.createRoot(this.container)
    this.root.render(<ControlPanel mapInstance={this.map} />)

    return this.container
  }

  onRemove() {
    // Smonta il componente con la nuova API
    if (this.root) {
      this.root.unmount()
    }
    this.container.parentNode.removeChild(this.container)
    this.map = undefined
  }
}

export default SimpleControl
