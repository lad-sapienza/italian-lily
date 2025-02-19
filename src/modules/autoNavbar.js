import * as React from "react"
import { Container, Nav, Navbar } from "react-bootstrap"
import { withPrefix } from "gatsby"
import styled from "styled-components"
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
    <Menu>
      <Navbar expand="lg" className="custom-navbar">
        <Container>
          <Navbar.Brand href={withPrefix(`/`)} className="navbar-brand">
            {props.siteTitle}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {data.allMdx.nodes.map((menuItem, index) => (
                <div className="containerLink" key={index}>
                  <Nav.Link
                    href={withPrefix(`/${menuItem.frontmatter.slug}`)}
                    className="nav-item my-2 nav-link-custom"
                  >
                    {menuItem.frontmatter.title}
                  </Nav.Link>
                </div>
              ))}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </Menu>
  )
}

// Stile della navbar
const Menu = styled.div`
  .custom-navbar {
    background-color: #aa1a10 !important; /* Colore rosso */
    color: #ffffff; /* Testo bianco */
  }

  .navbar-brand {
    font-size: 1.5rem; /* Aumentato leggermente il font della scritta */
    font-weight: bold;
    color: #ffffff !important; /* Testo visibile sul rosso */
  }

  .navbar-brand:hover {
    color: #f8d7da !important; /* Colore chiaro al passaggio del mouse */
  }

  .nav-item {
    font-size: 1.1rem; /* Testo leggermente più grande per i link */
    font-weight: 500;
    color: #ffffff !important; /* Testo bianco per i link */
  }

  .nav-item:hover {
    color: #f8d7da !important; /* Testo chiaro al passaggio del mouse */
  }

  .nav-link-custom {
    transition: color 0.3s ease; /* Transizione fluida sul colore */
  }

  @media (max-width: 768px) {
    .navbar-brand {
      font-size: 1.2rem; /* Riduce il font su mobile */
    }

    .nav-item {
      font-size: 1rem; /* Riduce il font dei link su mobile */
    }
  }
`

export default AutoNavbar
