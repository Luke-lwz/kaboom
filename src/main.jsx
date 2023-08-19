import { render } from 'preact';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import App from './App'
import './index.css'

render(
  <BrowserRouter>
    <Analytics mode={'production'} />;
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
