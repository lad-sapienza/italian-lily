import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import styled, { keyframes } from "styled-components"
import { Container } from "react-bootstrap"

const HeaderSection = ({ siteTitle }) => {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <StyledHeader 
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      className={isVisible ? "visible" : ""}
    >
      <Container fluid="lg" className="header-container">
        <Link to="/" className="logo-link">
          <StaticImage
            src="../images/Logo_ItalianLily-1-300x120.png"
            width={300}
            quality={100}
            formats={["AUTO", "WEBP", "AVIF"]}
            alt={siteTitle}
            className="logo"
          />
        </Link>
        
        <div className="divider"></div>
        
        <div className="center-image">
            <StaticImage
            src="../images/banda_loghi.png"
            width={400}
            quality={100}
            formats={["AUTO", "WEBP", "AVIF"]}
            alt="Partner logos"
            className="logos-band"
          />
        </div>
        
        <div className="divider"></div>
      </Container>
    </StyledHeader>
  )
}

const slideDown = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
`

const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 120px; /* Altezza fissa */
    background: linear-gradient(
    to bottom,
    rgba(173, 216, 230, 0.2) 80%,  /* lightblue @20% opacity */
    transparent 100%
  );
  z-index: 80;
  transform: translateY(-90%);
  transition: transform 0.5s cubic-bezier(0.33, 1, 0.68, 1);
  border-radius: 0 0 40px 40px;
  box-shadow: 0 8px 32px rgba(173, 216, 230, 0.1);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  padding-bottom: 20px;
  overflow: hidden;
  border: 1px solid rgba(173, 216, 230, 0.3);
  border-top: none;

  /* Area sensibile al hover */
  &::before {
    content: '';
    position: absolute;
    bottom: -30px;
    left: 0;
    width: 100%;
    height: 30px;
  }

  &.visible {
    transform: translateY(0);
    animation: ${slideDown} 0.5s ease-out;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
  }

  .logo-link {
    display: block;
    transition: all 0.4s ease;
    flex: 1;
  }

  .logo {
    width: 300px;
    height: auto;
    transform: scale(0.9);
    opacity: 0.8;
    transition: all 0.5s cubic-bezier(0.33, 1, 0.68, 1);
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
  }

  .divider {
    height: 60px;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.1);
    margin: 0 20px;
  }

  .center-image {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .logos-band {
    width: 400px;
    height: auto;
    opacity: 0.9;
    transition: all 0.5s cubic-bezier(0.33, 1, 0.68, 1);
    transform: scale(0.95);
  }

  &.visible {
    .logo, .logos-band {
      transform: scale(1);
      opacity: 1;
    }
  }

  @media (max-width: 1200px) {
    .logos-band {
      width: 300px;
    }
  }

  @media (max-width: 992px) {
    height: 100px;
    transform: translateY(0) !important;
    animation: none !important;
    
    .logo {
      width: 220px;
      transform: scale(1) !important;
      opacity: 1 !important;
    }

    .logos-band {
      width: 250px;
      transform: scale(1) !important;
      opacity: 1 !important;
    }

    .divider {
      height: 40px;
      margin: 0 10px;
    }
  }

  @media (max-width: 768px) {
    .logos-band {
      display: none;
    }
    
    .divider {
      display: none;
    }
  }

  @media (max-width: 576px) {
    height: 80px;
    padding-bottom: 10px;
    
    .logo {
      width: 180px;
    }
  }
`

export default HeaderSection