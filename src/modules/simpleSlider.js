import React from "react"
import Carousel from "react-bootstrap/Carousel"
import PropTypes from "prop-types"

const SimpleSlider = ({ data, children }) => (
  <Carousel>
    {data.map((el, key) => (
      <Carousel.Item key={key}>
        <img
          src={el.img}
          className="d-block w-100"
          alt={el.caption ? el.caption : el.img}
        />
        {el.caption && <Carousel.Caption>{el.caption}</Carousel.Caption>}
      </Carousel.Item>
    ))}
  </Carousel>
)

SimpleSlider.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      img: PropTypes.string.isRequired,
      capion: PropTypes.string,
    }),
  ).isRequired,
}
export { SimpleSlider }
