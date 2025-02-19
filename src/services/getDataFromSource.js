import csv from "csvtojson"
import json2geoJson from "./transformers/json2geojson.js"
import sourcePropTypes from "./sourcePropTypes.js"
import { withPrefix } from "gatsby"

const getDataFromSource = async source => {
  let {
    path2data,
    dEndPoint,
    dToken,
    dTable,
    id,
    dQueryString,
    transType,
    geoField,
  } = source

  let sourceUrl
  let options = {}
  let output

  if (path2data) {
    sourceUrl = path2data.startsWith("http") ? path2data : withPrefix(path2data)
    if (path2data.toLowerCase().endsWith(".csv")) {
      transType = "csv2json"
    }
    if (path2data.toLowerCase().endsWith(".geojson")) {
      transType = "json"
    }
  } else {
    if (dEndPoint) {
      sourceUrl = dEndPoint
    } else if (process.env.GATSBY_DIRECTUS_ENDPOINT) {
      sourceUrl = process.env.GATSBY_DIRECTUS_ENDPOINT
    } else {
      throw new Error(
        "Either `dEndPoint` or env variable `GATSBY_DIRECTUS_ENDPOINT` are needed",
      )
    }
    if (dEndPoint || process.env.GATSBY_DIRECTUS_ENDPOINT) {
      if (!dTable) {
        throw new Error(
          "Parameter `dTable` is requirted with `GATSBY_DIRECTUS_ENDPOINT` or `dEndPoint`",
        )
      }
      sourceUrl += `${sourceUrl.endsWith("/") ? "" : "/"}items/${dTable}`
    }
    if (id) {
      sourceUrl += `/${id}`
    }
    sourceUrl += `?${dQueryString ? dQueryString : ""}`

    const token = dToken ? dToken : process.env.GATSBY_DIRECTUS_TOKEN

    if (token) {
      options = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    }
  }

  try {
    const response = await fetch(sourceUrl, options)

    switch (transType) {
      case "text":
        output = await response.text()
        break

      case "csv2json":
        const csvText = await response.text()
        output = await csv().fromString(csvText)
        break

      case "geojson":
        const respJson = await response.json()
        output = json2geoJson(respJson.data, geoField)
        break

      case "json":
      default:
        output = await response.json()
        break
    }

    if (output.errors) {
      throw new Error(
        `Error communicating with server: ${output.errors[0].message}`,
      )
    }

    return Object.hasOwn(output, "data") ? output.data : output
  } catch (error) {
    // console.log(error)
    throw Error(error)
  }
}

getDataFromSource.PropTypes = {
  source: sourcePropTypes,
}

export default getDataFromSource
