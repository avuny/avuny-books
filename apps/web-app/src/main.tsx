// apps/web-app/src/main.tsx
// The host owns: route table, QueryClient, env config, guards and layouts.
// web-features owns: the pages. web-host owns: the glue between them.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { HostProviders, reactRouterAdapter } from "@avuny/web-host";
import { WebAppRouter } from "@avuny/web-features/web";
import "@avuny/ui/globals.css"
import { ThemeProvider } from "./components/theme-provider";
import { App } from "./App";
const queryClient = new QueryClient();

// Path constants come from the features, so links and routes can't drift.
const router = createBrowserRouter(WebAppRouter);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ThemeProvider>
  </StrictMode>,
);
