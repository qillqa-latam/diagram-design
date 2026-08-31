import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { Layout } from './components/Layout.js';
import { mdxComponents } from './mdx-components.js';
import { DiagramPage } from './pages/DiagramPage.js';
import { SemanticPatternPage } from './pages/SemanticPatternPage.js';
import { EXAMPLES } from '../../shared/examples.js';
import { categorySlug } from './nav.js';

import HomePage from './content/index.mdx';
import InstallationPage from './content/getting-started/installation.mdx';
import QuickStartPage from './content/getting-started/quick-start.mdx';
import TokensPage from './content/concepts/tokens.mdx';
import LayoutGridPage from './content/concepts/layout-grid.mdx';
import ThemesMotionPage from './content/concepts/themes-motion.mdx';
import TasteGatePage from './content/concepts/taste-gate.mdx';
import DiagramsIndexPage from './content/diagrams/index.mdx';
import SemanticPatternsIndexPage from './content/semantic-patterns/index.mdx';
import CliPage from './content/guides/cli.mdx';
import ImportersPage from './content/guides/importers.mdx';
import ExportPage from './content/guides/export.mdx';

function MdxPage({ children }: { children: ReactNode }) {
  return <MDXProvider components={mdxComponents}>{children}</MDXProvider>;
}

export function AppRouter() {
  const diagramRoutes = EXAMPLES.filter(
    (e) => e.category !== 'Semantic Patterns' && e.category !== 'Importers'
  ).map((e) => (
    <Route
      key={e.id}
      path={`/diagrams/${categorySlug(e.category)}/${e.id}`}
      element={
        <MdxPage>
          <DiagramPage category={categorySlug(e.category)} id={e.id} />
        </MdxPage>
      }
    />
  ));

  const patternRoutes = EXAMPLES.filter((e) => e.category === 'Semantic Patterns').map((e) => (
    <Route
      key={e.id}
      path={`/semantic-patterns/${e.id}`}
      element={
        <MdxPage>
          <SemanticPatternPage id={e.id} />
        </MdxPage>
      }
    />
  ));

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <MdxPage>
              <HomePage />
            </MdxPage>
          }
        />
        <Route
          path="getting-started/installation"
          element={
            <MdxPage>
              <InstallationPage />
            </MdxPage>
          }
        />
        <Route
          path="getting-started/quick-start"
          element={
            <MdxPage>
              <QuickStartPage />
            </MdxPage>
          }
        />
        <Route
          path="concepts/tokens"
          element={
            <MdxPage>
              <TokensPage />
            </MdxPage>
          }
        />
        <Route
          path="concepts/layout-grid"
          element={
            <MdxPage>
              <LayoutGridPage />
            </MdxPage>
          }
        />
        <Route
          path="concepts/themes-motion"
          element={
            <MdxPage>
              <ThemesMotionPage />
            </MdxPage>
          }
        />
        <Route
          path="concepts/taste-gate"
          element={
            <MdxPage>
              <TasteGatePage />
            </MdxPage>
          }
        />
        <Route
          path="diagrams"
          element={
            <MdxPage>
              <DiagramsIndexPage />
            </MdxPage>
          }
        />
        {diagramRoutes}
        <Route
          path="semantic-patterns"
          element={
            <MdxPage>
              <SemanticPatternsIndexPage />
            </MdxPage>
          }
        />
        {patternRoutes}
        <Route
          path="guides/cli"
          element={
            <MdxPage>
              <CliPage />
            </MdxPage>
          }
        />
        <Route
          path="guides/importers"
          element={
            <MdxPage>
              <ImportersPage />
            </MdxPage>
          }
        />
        <Route
          path="guides/export"
          element={
            <MdxPage>
              <ExportPage />
            </MdxPage>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
