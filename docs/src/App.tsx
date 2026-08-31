import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router.js';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/diagram-design';

export function App() {
  return (
    <BrowserRouter basename={basename}>
      <AppRouter />
    </BrowserRouter>
  );
}
