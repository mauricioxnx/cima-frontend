import { useState } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import { CssBaseline, ThemeProvider } from "@mui/material"
import { ColorModeContext, useMode } from "./theme"
import { AuthProvider } from "./hooks/AuthContext"
import { useAuth } from "./hooks/useAuth"

import Topbar from "./scenes/global/Topbar"
import Sidebar from "./scenes/global/Sidebar"

import Login from "./Login/index"
import Dashboard from "./scenes/dashboard"
import UtilizadoresPage from "./scenes/utilizadores"
import PerfisPage from "./scenes/perfis"
import InventarioPage from "./scenes/inventario"
import FornecedoresPage from "./scenes/fornecedores"
import MovimentosPage from "./scenes/Movimentos"
import ManutencoesPage from "./scenes/Manutencoes"
import TarefasPage from "./scenes/tarefas"
import MaquinasPage from "./scenes/maquinas"
import HistoricoPage from "./scenes/historicos"
import RelatoriosPage from "./scenes/relatorio"
import FAQ from "./scenes/faq"

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

function MainLayout({ children, isSidebar, setIsSidebar }) {
  return (
    <div className="app">
      <Sidebar isSidebar={isSidebar} />
      <main className="content">
        <Topbar setIsSidebar={setIsSidebar} />
        {children}
      </main>
    </div>
  )
}

function AppRoutes() {
  const [isSidebar, setIsSidebar] = useState(true)
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Navigate to="/dashboard" replace />
          </PrivateRoute>
        }
      />
      {[
        { path: "/dashboard",    element: <Dashboard /> },
        { path: "/utilizadores", element: <UtilizadoresPage /> },
        { path: "/perfis",       element: <PerfisPage /> },
        { path: "/inventario",   element: <InventarioPage /> },
        { path: "/fornecedores", element: <FornecedoresPage /> },
        { path: "/movimentos",   element: <MovimentosPage /> },
        { path: "/manutencoes",  element: <ManutencoesPage /> },
        { path: "/tarefas",      element: <TarefasPage /> },
        { path: "/maquinas",     element: <MaquinasPage /> },
        { path: "/historico",    element: <HistoricoPage /> },
        { path: "/relatorios",   element: <RelatoriosPage /> },
        { path: "/faq",          element: <FAQ /> },
      ].map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <PrivateRoute>
              <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
                {element}
              </MainLayout>
            </PrivateRoute>
          }
        />
      ))}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  const [theme, colorMode] = useMode()

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}