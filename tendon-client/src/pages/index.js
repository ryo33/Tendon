import React from 'react'

import Layout from '../components/layout'
import SEO from '../components/seo'
import SpeechInput from '../components/speech-input.js'

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <SpeechInput />
  </Layout>
)

export default IndexPage
