import './src/site.css';
import { useCopyButtons } from './src/chrome';
import { DocsPage } from './src/DocsPage';
import { Landing } from './src/Landing';
import { Press } from './src/print';
import { Router, usePath, asset } from './src/router';

// The display face is ours to host: the library itself needs no font install.
const face = document.createElement('style');
face.textContent = `@font-face { font-family: Archivo; src: url(${asset('/fonts/archivo.woff2')}) format('woff2-variations'); font-weight: 100 900; font-stretch: 62% 125%; font-display: swap; }`;
document.head.appendChild(face);

function Routes() {
  const path = usePath();
  useCopyButtons();
  return path.startsWith('/docs') ? <DocsPage /> : <Landing />;
}

export default function App() {
  return (
    <Router>
      <Press>
        <Routes />
      </Press>
    </Router>
  );
}
