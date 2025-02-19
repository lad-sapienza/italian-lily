import React, { useRef, useEffect, useState } from "react"
import Viz from "viz.js"
import { Module, render } from "viz.js/full.render.js"
import PropTypes from "prop-types"
import * as d3 from "d3"
import { ZoomIn, ZoomOut, Fullscreen } from "react-bootstrap-icons"
import { createRoot } from "react-dom/client"
import { flushSync } from "react-dom"
import styled from "styled-components"

/**
 * GraphVizComponent renders a directed graph using viz.js from a DOT string.
 *
 * @param {string} dot - The DOT string representing the graph.
 * @param {array} data - The array of edges representing the graph.
 * @param {string} width - The width of the graph container.
 * @param {string} height - The height of the graph container.
 * @param {string} containerClassNames - Additional class names for the container.
 * @param {function} onClickNode - Function to call when a node is clicked.
 */
const HarrisMatrix = ({
  dot,
  data = [],
  width = "100%",
  height = "400px",
  containerClassNames = null,
  onClickNode = nodeText => {
    console.log(nodeText)
  }, // Default onClickNode function
}) => {
  const graphRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (data.length === 0 && !dot) {
      setError("Either `data` or `dot` params are required to show a graph")
      return
    }

    let graphDot = dot // Create a new variable for the dot string
    if (data.length > 0) {
      // Convert data array to DOT format
      graphDot = `digraph G { ${data.map(r => `${r[0]} -> ${r[1]}; `).join(" ")}}`
    }

    const viz = new Viz({ Module, render })

    viz
      .renderSVGElement(graphDot)
      .then(element => {
        if (graphRef.current) {
          graphRef.current.innerHTML = ""
          graphRef.current.appendChild(element)

          const svg = d3.select(element)
          svg
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("preserveAspectRatio", "xMidYMid meet")

          const zoom = d3.zoom().on("zoom", event => {
            svg.attr("transform", event.transform)
          })

          svg.call(zoom)

          // Add click event to nodes
          svg.selectAll("g.node").on("click", function (event) {
            const nodeText = d3.select(this).select("title").text()
            onClickNode(nodeText)
          })

          // Add zoom controls
          const controls = document.createElement("div")
          controls.style.display = "flex"
          controls.style.gap = "5px"
          controls.style.position = "absolute"
          controls.style.bottom = "1rem"
          controls.style.right = "1rem"
          controls.style.padding = "5px"
          controls.style.borderRadius = "5px"
          controls.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)"

          const zoomInButton = document.createElement("button")
          zoomInButton.classList.add("btn", "btn-primary", "btn-sm")
          zoomInButton.onclick = () => {
            svg.transition().duration(750).call(zoom.scaleBy, 1.2)
          }
          const rootZoomIn = createRoot(zoomInButton)
          flushSync(() => {
            rootZoomIn.render(<ZoomIn />)
          })

          const zoomOutButton = document.createElement("button")
          zoomOutButton.classList.add("btn", "btn-primary", "btn-sm")
          zoomOutButton.onclick = () => {
            svg.transition().duration(750).call(zoom.scaleBy, 0.8)
          }
          const rootZoomOut = createRoot(zoomOutButton)
          flushSync(() => {
            rootZoomOut.render(<ZoomOut />)
          })

          const resetZoomButton = document.createElement("button")
          resetZoomButton.classList.add("btn", "btn-primary", "btn-sm")
          resetZoomButton.onclick = () => {
            svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity)
          }
          const rootResetZoom = createRoot(resetZoomButton)
          flushSync(() => {
            rootResetZoom.render(<Fullscreen />)
          })

          controls.appendChild(zoomInButton)
          controls.appendChild(zoomOutButton)
          controls.appendChild(resetZoomButton)
          graphRef.current.appendChild(controls)
        }
      })
      .catch(error => {
        setError("Failed to render the graph")
      })
  }, [dot, data, onClickNode])

  return (
    <GraphDiv
      ref={graphRef}
      style={{ width, height, overflow: "hidden", position: "relative" }}
      className={containerClassNames}
    >
      {error && <p className="text-danger">{error}</p>}
    </GraphDiv>
  )
}

const GraphDiv = styled.div`
  g.node {
    cursor: pointer;

    &:hover > ellipse {
      fill: #ebebeb;
    }
    text {
      font-size: 10px;
      font-family: sans-serif;
    }
  }
`

HarrisMatrix.propTypes = {
  /**
   * The DOT string representing the graph. Required.
   */
  dot: PropTypes.string.isRequired,
  /**
   * The array of edges representing the graph. Optional, default: [].
   */
  data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
  /**
   * The width of the graph container. Optional, default: "100%".
   */
  width: PropTypes.string,
  /**
   * The height of the graph container. Optional, default: "400px".
   */
  height: PropTypes.string,
  /**
   * Additional class names for the container. Optional, default: null.
   */
  containerClassNames: PropTypes.string,
  /**
   * Function to call when a node is clicked. Optional, default: logs node text.
   */
  onClickNode: PropTypes.func,
}

export { HarrisMatrix }
