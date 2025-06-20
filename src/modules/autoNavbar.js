import * as React from "react"
import { Container, Nav, Navbar } from "react-bootstrap"
import { withPrefix } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"
import styled, { keyframes } from "styled-components"
import { useStaticQuery, graphql } from "gatsby"

function AutoNavbar(props) {
  const data = useStaticQuery(graphql`
    {
      allMdx(
        filter: { frontmatter: { menu_position: { gt: 0 } } }
        sort: { frontmatter: { menu_position: ASC } }
      ) {
        nodes {
          id
          frontmatter {
            slug
            title
            menu_position
          }
        }
      }
    }
  `)
  return (
    <>
      <StyledMenu>
        <Navbar expand="lg" variant="dark" className="floating-nav">
          <Container>
            <Navbar.Brand href={withPrefix(`/`)} className="brand">
              <StaticImage
                src="../usr/images/Logo_ItalianLily-1-300x120.png"
                width={120}
                quality={100}
                formats={["AUTO", "WEBP", "AVIF"]}
                alt={props.siteTitle}
                className="nav-logo"
              />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbar" className="hamburger" />
            <Navbar.Collapse id="navbar">
              <Nav className="ms-auto">
                {data.allMdx.nodes.map((menuItem, index) => (
                  <Nav.Link
                    key={index}
                    href={withPrefix(`/${menuItem.frontmatter.slug}`)}
                    className="nav-link"
                  >
                    <span className="link-text">{menuItem.frontmatter.title}</span>
                  </Nav.Link>
                ))}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </StyledMenu>
      <NavbarSpacer />
    </>
  )
}

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`

const StyledMenu = styled.div`
  .floating-nav {
    background: linear-gradient(135deg, #e8c4c4 0%, #d8a5a5 100%);
    border-radius: 0 0 30px 30px;
    padding: 1.2rem 2rem;
    box-shadow: 0 8px 32px rgba(181, 107, 107, 0.2);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    height: 80px;
    animation: ${floatAnimation} 6s ease-in-out infinite;
    position: sticky;
    top: 0;
    z-index: 1020;
    
    &:hover {
      box-shadow: 0 12px 40px rgba(181, 107, 107, 0.3);
      transform: translateY(-2px);
    }
  }

  .brand {
    display: flex;
    align-items: center;
    // adjust padding/margin if necessary
  }

  .nav-logo {
    height: auto;
    max-height: 60px;
    // adjust max-height to fit navbar height
  }

  .nav-link {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.1rem;
    font-weight: 500;
    color: #5c3d3d !important;
    padding: 0.8rem 1.5rem !important;
    margin: 0 0.3rem;
    position: relative;
    transition: all 0.4s ease;
    border-radius: 20px;
    overflow: hidden;

    .link-text {
      position: relative;
      z-index: 2;
    }

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(210, 163, 163, 0.4) 0%, rgba(188, 143, 143, 0.2) 100%);
      border-radius: 20px;
      transform: scaleX(0);
      transform-origin: right;
      transition: transform 0.4s cubic-bezier(0.65, 0, 0.35, 1);
    }

    &:hover {
      color: #3d2a2a !important;
      
      &::before {
        transform: scaleX(1);
        transform-origin: left;
      }
    }
  }

  .hamburger {
    border: none;
    padding: 0.5rem;
    
    &:focus {
      box-shadow: none;
    }

    .navbar-toggler-icon {
      background-image: url("data:images/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%2892, 61, 61, 0.8%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
    }
  }

  @media (max-width: 992px) {
    .floating-nav {
      border-radius: 0;
      padding: 1rem;
      height: auto;
      animation: none;
    }

    .brand {
      font-size: 1.6rem;
      &::after {
        display: none;
      }
    }

    .nav-logo {
      max-height: 50px;
    }

    .nav-link {
      padding: 0.8rem 1rem !important;
      margin: 0.3rem 0;
      text-align: center;
    }

    .navbar-collapse {
      background: linear-gradient(135deg, #f0dada 0%, #e2c2c2 100%);
      border-radius: 0 0 20px 20px;
      margin: 0 -2rem;
      padding: 0 2rem 1rem;
      box-shadow: 0 8px 16px rgba(181, 107, 107, 0.15);
    }
  }

  @media (max-width: 576px) {
    .brand {
      font-size: 1.4rem;
    }

    .nav-link {
      font-size: 1rem;
    }
  }
`

const NavbarSpacer = styled.div`
  height: 80px;
  
  @media (max-width: 992px) {
    height: 70px;
  }
`

export default AutoNavbar
