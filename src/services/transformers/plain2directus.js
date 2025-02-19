/**
 * Transforms plain object to Directus Filter rule syntax
 * https://docs.directus.io/reference/filter-rules.html
 * @param {String} conn   one of the logic connectors _and and _or
 * @param {Array} plain  Array of objects with field, operator and value keys
 * @returns {Object}      Object with query compatible to Directus API
 */
const plain2directus = (conn, plain) => {
  const directus = {}

  if (plain.length === 1) {
    directus[plain[0].field] = {
      [plain[0].operator]: plain[0].value,
    }
  } else {
    directus[conn] = []
    plain.forEach((el, i) => {
      directus[conn].push({
        [el.field]: {
          [el.operator]: el.value,
        },
      })
    })
  }

  return directus
}

export default plain2directus
