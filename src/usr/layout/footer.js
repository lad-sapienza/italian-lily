import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import styled from "styled-components"
import { Container } from "react-bootstrap"

const FooterSection = () => {
  return (
    <Footer>
      <Container>
        <div className="footer-content">
          {/* Loghi cliccabili */}
          <div className="logos">
            <a href="https://www.unive.it/pag/13526" target="_blank" rel="noreferrer">
              <StaticImage
                src="../images/cafoscari.png"
                width={120}
                quality={90}
                formats={["AUTO", "WEBP"]}
                alt="Università Ca' Foscari"
                className="logo"
              />
            </a>
            <a href="https://www.unitn.it/" target="_blank" rel="noreferrer">
              <StaticImage
                src="../images/Trrento.png"
                width={120}
                quality={90}
                formats={["AUTO", "WEBP"]}
                alt="Università di Trento"
                className="logo"
              />
            </a>
            <a href="https://www.uniroma1.it/it/pagina-strutturale/home" target="_blank" rel="noreferrer">
              <StaticImage
                src="../images/Uniroma1.png"
                width={120}
                quality={90}
                formats={["AUTO", "WEBP"]}
                alt="Sapienza Università di Roma"
                className="logo"
              />
            </a>
          </div>

          {/* Testo a destra */}
          <div className="footer-text">
            <p>
              <strong>People and Books from Italy to France in the Sixteenth Century</strong>
            </p>
          </div>
        </div>
      </Container>
    </Footer>
  )
}

// Stile aggiornato del footer
const Footer = styled.footer`
  background-color: #f7f1e3; /* Colore pergamena chiaro */
  padding: 2rem 1rem; /* Footer leggermente più basso */
  border-top: 0.5rem solid #d4a373;

  .footer-content {
    display: flex;
    justify-content: space-between; /* Loghi a sinistra, testo a destra */
    align-items: center;
  }

  .logos {
    display: flex;
    gap: 1.5rem; /* Spaziatura tra i loghi */
  }

  .logo {
    max-width: 120px; /* Dimensione dei loghi */
    height: auto;
    display: block;
    transition: transform 0.3s ease; /* Effetto hover */
  }

  .logo:hover {
    transform: scale(1.1); /* Leggero zoom al passaggio del mouse */
  }

  .footer-text {
    font-size: 1.1rem;
    font-style: italic;
    color: #4a3f35;
    text-align: right; /* Allineamento a destra */
    max-width: 50%; /* Occupa massimo metà del footer */
  }

  @media (max-width: 768px) {
    .footer-content {
      flex-direction: column; /* Layout in colonna su schermi piccoli */
      align-items: center;
      text-align: center;
    }

    .logos {
      flex-wrap: wrap; /* Loghi disposti su più righe se necessario */
      justify-content: center;
    }

    .footer-text {
      max-width: 100%; /* Testo centrato su mobile */
    }
  }
`

export default FooterSection
