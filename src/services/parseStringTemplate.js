const parseStringTemplate = (str, obj) => {
  let parts = str.split(/\$\{(?!\d)[\wæøåÆØÅ]*\}/)
  let args = str.match(/[^{}]+(?=})/g) || []
  let parameters = args.map(
    argument =>
      obj[argument] || (obj[argument] === undefined ? "" : obj[argument]),
  )
  return String.raw({ raw: parts }, ...parameters)
}

export default parseStringTemplate;