import React, { Suspense, lazy } from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "sonner"
import { AppShell } from "./components/layout/app-shell"
import "./index.css"

// Lazy-load pages
const Dashboard = lazy(() => import("./features/dashboard"))
const Modules = lazy(() => import("./features/modules"))
const Contents = lazy(() => import("./features/contents"))
const Fields = lazy(() => import("./features/fields"))
const Settings = lazy(() => import("./features/settings"))

function LoadingFallback() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-sm text-muted-foreground">加载中...</div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route
            index
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="modules"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Modules />
              </Suspense>
            }
          />
          <Route
            path="contents"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Contents />
              </Suspense>
            }
          />
          <Route
            path="fields"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Fields />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
    <Toaster richColors position="top-right" />
  </React.StrictMode>
)
