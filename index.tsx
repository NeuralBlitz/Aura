import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import htm from 'htm';
import * as THREE from 'three';
import App from './App';

// Expose to window for Forge code execution
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).htm = htm;
(window as any).THREE = THREE;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOMClient.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);