import * as React from "react";
import { StaticImage } from "gatsby-plugin-image";
import styled from "styled-components";
import { Container, Row, Col } from "react-bootstrap";
import { Github, Bug } from "react-bootstrap-icons";

const FooterSection = () => {
  return (
    <Footer>
      <Container>
        <Row className="py-4 align-items-center">

          {/* Left Column - Title & Subtitle */}
          <Col md={3} className="section-left text-md-start text-center mb-3 mb-md-0">
            <Title>Italian Lily</Title>
            <Subtitle>People and Books from Italy to France in the Sixteenth Century</Subtitle>
          </Col>

          {/* Center Column - Project Logos + Contact Box */}
          <Col md={6} className="section-center text-center">
            <div className="logos">
              <a href="https://www.unive.it/pag/13526" target="_blank" rel="noreferrer">
                <StaticImage
                  src="../images/cafoscari.png"
                  width={260}
                  alt="Università Ca' Foscari"
                  className="logo"
                />
              </a>
              <a href="https://www.unitn.it/" target="_blank" rel="noreferrer">
                <StaticImage
                  src="../images/Trrento.png"
                  width={260}
                  alt="Università di Trento"
                  className="logo"
                />
              </a>
              <a href="https://www.uniroma1.it/it/pagina-strutturale/home" target="_blank" rel="noreferrer">
                <StaticImage
                  src="../images/Uniroma1.png"
                  width={260}
                  alt="Sapienza Università di Roma"
                  className="logo"
                />
              </a>
            </div>
            <ContactBox>
              <a href="https://italianlily.digilab.uniroma1.it/chi-siamo/" target="_blank" rel="noreferrer">
                Contact Us
              </a>
            </ContactBox>
          </Col>

          {/* Right Column - LAD & Programmers */}
          <Col md={3} className="section-right text-md-end text-center fs-6">
            <p>
              Build with: <strong>s:CMS</strong>, a digital framework by{' '}
              <a href="https://lad.saras.uniroma1.it" target="_blank" rel="noreferrer">
                LAD: Laboratorio di Archeologia Digitale
              </a>
            </p>
            <hr />
            <div className="d-flex justify-content-md-end justify-content-center align-items-center">
              <a
                href="mailto:erasmo.difonso@libero.it"
                title="Invia una mail a Erasmo di Fonso"
                className="me-3 d-flex align-items-center"
              >
                {/* Use mixBlendMode to remove white background */}
                <img
                  src="/image/logo_erasmo.svg"
                  width={40}
                  alt="Erasmo di Fonso"
                  className="me-2 icon"
                  style={{ mixBlendMode: 'multiply' }}
                />
                Erasmo di Fonso
              </a>
              <a
                href="https://github.com/lab-archeologia-digitale/sCMS"
                target="_blank"
                rel="noreferrer"
                title="Codice sorgente"
                className="me-2"
              >
                <Github />
              </a>
              <a
                href="https://github.com/lab-archeologia-digitale/sCMS/issues"
                target="_blank"
                rel="noreferrer"
                title="Segnala un problema"
              >
                <Bug />
              </a>
            </div>
          </Col>

        </Row>
      </Container>
    </Footer>
  );
};

// Styled Components
const Footer = styled.footer`
  background-color: #f8f4e9;
  border-top: 4px solid #5a3921;
  padding: 2rem 0;
  color: #5a3921;

  a {
    color: #5a3921;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #8c6a56;
      text-decoration: underline;
    }
  }

  .section-left {
    padding-right: 1.5rem;
    border-right: 1px solid #d4a373;
  }

  .section-center {
    padding: 0 1.5rem;
    border-left: 1px solid #d4a373;
    border-right: 1px solid #d4a373;
  }

  .section-right {
    padding-left: 1.5rem;
  }

  .logos {
    display: flex;
    gap: 3rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .logo {
    transition: transform 0.3s ease;
  }

  .logo:hover {
    transform: scale(1.1);
  }
`;

// Contact Box below logos
const ContactBox = styled.div`
  background-color: #e9dfcf;
  padding: 0.75rem 1.5rem;
  display: inline-block;
  border-radius: 0.5rem;

  a {
    font-family: 'Lora', serif;
    font-size: 1rem;
    font-weight: bold;
    color: #5a3921;
  }
`;

const Title = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #3e2c1c;
`;

const Subtitle = styled.p`
  font-family: 'Lora', serif;
  font-size: 1.1rem;
  font-style: italic;
  color: #5a3921;
  margin: 0;
`;

export default FooterSection;
