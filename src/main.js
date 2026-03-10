import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './global.css';
const router = createRouter({ routeTree, defaultPreload: 'intent' });
const root = document.getElementById('root');
createRoot(root).render(_jsx(StrictMode, { children: _jsx(RouterProvider, { router: router }) }));
