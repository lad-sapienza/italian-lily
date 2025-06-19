import React, { useState, useEffect } from "react"
import { useLocation }     from "@reach/router"

export const SwitchLayoutButton = ({ currentLayout }) => {
  const location = useLocation()
  const [search, setSearch] = useState("")

  // Al mount, popolo lo state con la query string effettiva
  useEffect(() => {
    setSearch(location.search)
  }, [location.search])

  const targetLayout = currentLayout === "book" ? "book2" : "book"
  const buttonText =
    currentLayout === "book"
      ? "🔁 Switch to Vertical View"
      : "🔁 Switch to Two-Column View"

  // Uso lo state "search", che inizialmente è "" (server), poi diventa "?tb=…&id=…"
  const href = `/${targetLayout}/${search}`

  return (
    <div className="text-end mb-4">
      <a className="btn btn-outline-secondary" href={href}>
        {buttonText}
      </a>
    </div>
  )
}
