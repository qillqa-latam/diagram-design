import { PlaygroundApp } from './app.js';
import './styles.css';

const appRoot = document.getElementById('app');
if (appRoot) {
  const app = new PlaygroundApp(appRoot);
  app.init();
}
