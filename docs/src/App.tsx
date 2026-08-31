import { BrowserRouter } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { AppRouter } from './router.js';
import { mdxComponents } from './mdx-components.js';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/diagram-design';

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <MDXProvider components={mdxComponents}>
        <AppRouter />
      </MDXProvider>
    </BrowserRouter>
  );
}
