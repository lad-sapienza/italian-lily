import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { useLocation } from "@reach/router"

import Navbar from "../../modules/autoNavbar"
import Footer from "./footer"
import Header from "./header"
import "./layout.scss"

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata { title }
      }
    }
  `)

  const location = useLocation()
  // Rimuovo la slash finale, se c’è
  const pathname = location.pathname.replace(/\/$/, "")
  const isMapPage = pathname === "/map"

  return (
    <div className="site-container d-flex flex-column min-vh-100">
      <Navbar siteTitle={data.site.siteMetadata?.title || `Title`} />
      <Header siteTitle={data.site.siteMetadata?.title || `Title`} />

      <main className="flex-grow-1 position-relative">
        {children}
      </main>

      {/* Footer viene montato solo se non siamo su /map o /map/ */}
      {!isMapPage && <Footer className="mt-auto" />}
    </div>
  )
}

export default Layout