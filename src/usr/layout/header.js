import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import styled from "styled-components"
import { Container } from "react-bootstrap"

const HeaderSection = ({ siteTitle }) => (
  <Header>
    <Container>
      <div className="header-content">
        <Link to={"/"}>
          <StaticImage
            src="../images/Logo_ItalianLily-1-300x120.png"
            width={225} /* Aumentata del 50% rispetto a 150 */
            quality={100}
            formats={["AUTO", "WEBP"]}
            alt={siteTitle}
            className="logo"
          />
        </Link>
        <div className="header-text">
          <h1>from Italy to France</h1>
        </div>
      </div>
    </Container>
  </Header>
)

// Stile aggiornato dell'header
const Header = styled.header`
  background-color: #f7f1e3; /* Colore neutro, simile a una pergamena chiara */
  color: #4a3f35; /* Testo marrone scuro */
  padding: 2rem 0;
  margin-bottom: 3rem; /* Ridotto leggermente rispetto a prima */

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    max-width: 225px; /* Nuova dimensione del logo */
    height: auto;
  }

  .header-text h1 {
    font-size: 1.8rem; /* Leggermente più grande */
    font-weight: bold;
    color: #4a3f35; /* Marrone scuro */
    margin: 0;
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    .logo {
      max-width: 200px; /* Riduce leggermente il logo su schermi piccoli */
    }

    .header-text h1 {
      font-size: 1.5rem; /* Dimensione ridotta del testo su mobile */
    }
  }
`

export default HeaderSection
