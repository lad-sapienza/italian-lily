import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import styled, { keyframes } from "styled-components"
import { Container } from "react-bootstrap"

const HeaderSection = ({ siteTitle }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <StyledHeader className={isCollapsed ? "collapsed" : ""}>
      <Container fluid="lg" className="header-container">
        <div className="logo-wrapper">
          <StaticImage
            src="../images/Logo_ItalianLily-1-300x120.png"
            width={300}
            quality={100}
            formats={["AUTO", "WEBP", "AVIF"]}
            alt={siteTitle}
            className="logo"
          />
        </div>
        
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
        
        <button 
          className="collapse-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Espandi header" : "Collassa header"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </Container>
    </StyledHeader>
  )
}

const slideDown = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
`

const slideUp = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-90%); }
`

const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: linear-gradient(
    to bottom,
    rgba(173, 216, 230, 0.2) 80%,
    transparent 100%
  );
  z-index: 80;
  transform: translateY(0);
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

  &.collapsed {
    transform: translateY(-90%);
    animation: ${slideUp} 0.5s ease-out;
    
    .logo, .logos-band {
      transform: scale(0.9);
      opacity: 0.8;
    }
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    position: relative;
  }

  .logo-wrapper {
    display: block;
    flex: 1;
  }

  .logo {
    width: 300px;
    height: auto;
    transform: scale(1);
    opacity: 1;
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
    opacity: 1;
    transition: all 0.5s cubic-bezier(0.33, 1, 0.68, 1);
    transform: scale(1);
  }

  .collapse-button {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(173, 216, 230, 0.3);
    border: 1px solid rgba(173, 216, 230, 0.5);
    border-top: none;
    border-radius: 0 0 20px 20px;
    width: 40px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.7);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(173, 216, 230, 0.5);
      color: rgba(0, 0, 0, 0.9);
    }
    
    svg {
      transition: transform 0.3s ease;
    }
  }

  &.collapsed {
    .collapse-button svg {
      transform: rotate(180deg);
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
    
    .collapse-button {
      display: none;
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