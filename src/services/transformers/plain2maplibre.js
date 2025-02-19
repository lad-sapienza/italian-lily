// Mappa degli operatori da Directus a MapLibre

// Mappa dei connettori logici
const connector_map = {
  _and: "all",
  _or: "any",
}

/**
 * Trasforma un plain object in una espressione compatibile con MapLibre
 * https://maplibre.org/maplibre-style-spec/expressions/
 * @param {String} conn   uno dei connettori logici: _and o _or
 * @param {Array} plain   Array di oggetti con chiavi 'field', 'operator' e 'value'
 * @returns {Array}       Array compatibile con MapLibre Style Expression
 */

const plain2maplibre = (conn, plain) => {
  const maplibre = []

  // Usa il connettore logico passato dalla funzione (default: "any")
  const logicalConnector = connector_map[conn] || "any"
  maplibre.push(logicalConnector)

  plain.forEach(el => {
    const operator = el.operator || "_eq" // Default operator
    switch (operator) {
      case "_eq":
        maplibre.push(["==", ["get", el.field], ["literal", el.value]])
        break
      case "_neq":
        maplibre.push(["!=", ["get", el.field], ["literal", el.value]])
        break
      case "_lt":
        maplibre.push(["<", ["get", el.field], ["literal", el.value]])
        break
      case "_lte":
        maplibre.push(["<=", ["get", el.field], ["literal", el.value]])
        break
      case "_gt":
        maplibre.push([">", ["get", el.field], ["literal", el.value]])
        break
      case "_gte":
        maplibre.push([">=", ["get", el.field], ["literal", el.value]])
        break
      case "_in":
        maplibre.push(["in", ["get", el.field], ["literal", el.value]])
        break
      case "_nin":
        maplibre.push(["!in", ["get", el.field], ["literal", el.value]])
        break
      case "_icontains":
        maplibre.push([
          ">=",
          ["index-of", el.value.toLowerCase(), ["downcase", ["get", el.field]]],
          0,
        ])
        break
      case "_contains":
        maplibre.push([">=", ["index-of", el.value, ["get", el.field]], 0])
        break
      case "_ncontains":
        maplibre.push(["<", ["index-of", el.value, ["get", el.field]], 0])
        break
      case "_starts_with":
        maplibre.push([
          "==",
          ["slice", ["get", el.field], 0, el.value.length],
          ["literal", el.value],
        ])
        break
      case "_istarts_with":
        maplibre.push([
          "==",
          ["slice", ["downcase", ["get", el.field]], 0, el.value.length],
          ["literal", el.value.toLowerCase()],
        ])
        break
      case "_nstarts_with":
        maplibre.push([
          "!",
          ["==", ["slice", ["get", el.field], 0, el.value.length], el.value],
        ])
        break
      case "_nistarts_with":
        maplibre.push([
          "!",
          [
            "==",
            ["slice", ["downcase", ["get", el.field]], 0, el.value.length],
            el.value.toLowerCase(),
          ],
        ])
        break
      case "_ends_with":
        maplibre.push([
          "==",
          ["slice", ["get", el.field], -el.value.length],
          ["literal", el.value],
        ])
        break
      case "_iends_with":
        maplibre.push([
          "==",
          ["slice", ["downcase", ["get", el.field]], -el.value.length],
          ["literal", el.value.toLowerCase()],
        ])
        break
      case "_nends_with":
        maplibre.push([
          "!",
          ["==", ["slice", ["get", el.field], -el.value.length], el.value],
        ])
        break
      case "_niends_with":
        maplibre.push([
          "!",
          [
            "==",
            ["slice", ["downcase", ["get", el.field]], -el.value.length],
            el.value.toLowerCase(),
          ],
        ])
        break
      case "_empty":
        maplibre.push(["==", ["get", el.field], ""])
        break
      case "_nempty":
        maplibre.push(["!=", ["get", el.field], ""])
        break
      case "_null":
        maplibre.push(["==", ["get", el.field], null])
        break
      case "_nnull":
        maplibre.push(["!=", ["get", el.field], null])
        break
      default:
        // Fallback per operatori sconosciuti: usa _eq come predefinito
        maplibre.push(["==", ["get", el.field], ["literal", el.value]])
        break
    }
  })

  return maplibre
}

export default plain2maplibre
