import * as React from "react"

import Layout from "../usr/layout/layout"
import Seo from "../modules/seo"

const NotFoundPage = () => (
  <Layout>
    <h1>Oh! We are sorry...</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </Layout>
)

export const Head = () => <Seo title="404: Not Found" />

export default NotFoundPage
