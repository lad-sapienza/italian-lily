const path = require("path")
const postTemplate = path.resolve(`./src/templates/contents.jsx`)

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    query {
      allMdx {
        nodes {
          id
          frontmatter {
            description
            slug
            title
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `)

  if (result.errors) {
    reporter.panicOnBuild("Error loading MDX result", result.errors)
  }

  // Create blog post pages.
  const posts = result.data.allMdx.nodes

  posts.forEach(node => {
    const pagePath =
      node.frontmatter.slug === "home" ? "/" : node.frontmatter.slug

    createPage({
      path: pagePath,
      component: `${postTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
      context: { id: node.id },
    })
  })
}
