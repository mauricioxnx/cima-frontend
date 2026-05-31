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

// ── Permissões por perfil ─────────────────────────────
const PERMISSOES = {
  ADMINISTRADOR:      ['dashboard','utilizadores','perfis','inventario','fornecedores','movimentos','manutencoes','tarefas','maquinas','historico','relatorios','faq'],
  GERENTE_STOCK:      ['dashboard','inventario','fornecedores','movimentos','historico'],
  GERENTE_MANUTENCAO: ['dashboard','manutencoes','tarefas','maquinas','historico'],
  TECNICO:            ['dashboard','tarefas'],
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? children : <Navigate to="/login" replace />
}

// ✅ Protege rota por perfil — redireciona para dashboard se não tiver permissão
function RoleRoute({ children, chave }) {
  const { user, loading } = useAuth()
  if (loading) return null
  const perfil = user?.perfil ?? user?.perfilNome ?? ''
  const permissoes = PERMISSOES[perfil] ?? []
  if (!permissoes.includes(chave)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
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

      {/* DASHBOARD — todos os perfis */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
            <Dashboard />
          </MainLayout>
        </PrivateRoute>
      } />

      {/* RECURSOS HUMANOS — só ADMINISTRADOR */}
      <Route path="/utilizadores" element={
        <PrivateRoute>
          <RoleRoute chave="utilizadores">
            <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
              <UtilizadoresPage />
            </MainLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      <Route path="/perfis" element={
        <PrivateRoute>
          <RoleRoute chave="perfis">
            <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
              <PerfisPage />
            </MainLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* STOCK & COMPRAS — ADMINISTRADOR e GERENTE_STOCK */}
      <Route path="/inventario" element={
        <PrivateRoute>
          <RoleRoute chave="inventario">
            <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
              <InventarioPage />
            </MainLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      <Route path="/fornecedores" element={
        <PrivateRoute>
          <RoleRoute chave="fornecedores">
            <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
              <FornecedoresPage />
            </MainLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      <Route path="/movimentos" element={
        <PrivateRoute>
          <RoleRoute chave="movimentos">
            <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
              <MovimentosPage />
            </MainLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* MANUTENÇÃO — ADMINISTRADOR e GERENTE_MANUTENCAO */}
      <Route path="/manutencoes" element={
        <PrivateRoute>
          <RoleRoute chave="manutencoes">
            <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
              <ManutencoesPage />
            </MainLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* TAREFAS — ADMINISTRADOR, GERENTE_MANUTENCAO e TECNICO */}
      <Route path="/tarefas" element={
        <PrivateRoute>
          <RoleRoute chave="tarefas">
            <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
              <TarefasPage />
            </MainLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      <Route path="/maquinas" element={
        <PrivateRoute>
          <RoleRoute chave="maquinas">
            <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
              <MaquinasPage />
            </MainLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* ANÁLISE — ADMINISTRADOR, GERENTE_STOCK, GERENTE_MANUTENCAO */}
      <Route path="/historico" element={
        <PrivateRoute>
          <RoleRoute chave="historico">
            <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
              <HistoricoPage />
            </MainLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      {/* RELATÓRIOS — só ADMINISTRADOR */}
      <Route path="/relatorios" element={
        <PrivateRoute>
          <RoleRoute chave="relatorios">
            <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
              <RelatoriosPage />
            </MainLayout>
          </RoleRoute>
        </PrivateRoute>
      } />

      <Route path="/faq" element={
        <PrivateRoute>
          <MainLayout isSidebar={isSidebar} setIsSidebar={setIsSidebar}>
            <FAQ />
          </MainLayout>
        </PrivateRoute>
      } />

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