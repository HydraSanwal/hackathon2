import React from 'react';
import { Redirect } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function HomePage() {
  const { siteConfig } = useDocusaurusContext();
  return <Redirect to="/docs/" />;
}

export default HomePage;