// apps/web-app/src/main.tsx
// The host owns: route table, QueryClient, env config, guards and layouts.
// web-features owns: the pages. web-host owns: the glue between them.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { HostProviders, reactRouterAdapter } from "@avuny/web-host";
import {
  DashboardPage,
  ProductDetailsPage,
  ProductsPage,
  productPaths,
} from "@avuny/web-features/web";

const queryClient = new QueryClient();

// Path constants come from the features, so links and routes can't drift.
const router = createBrowserRouter([
  { path: "/", element: <DashboardPage /> },
  { path: productPaths.list, element: <ProductsPage /> },
  { path: productPaths.detailPattern, element: <ProductDetailsPage /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HostProviders router={reactRouterAdapter} queryClient={queryClient}>
      <RouterProvider router={router} />
    </HostProviders>
  </StrictMode>,
);
