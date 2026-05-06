import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

// Inject JWT token on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 → redirect to login
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────
export const login = (email, senha) =>
  api.post('/auth/login', { email, senha }).then(r => r.data.dados)

// ── Dashboard ─────────────────────────────────────────
export const getDashboard = () =>
  api.get('/relatorios/dashboard').then(r => r.data.dados)

// ── Utilizadores ──────────────────────────────────────
export const getUtilizadores = () =>
  api.get('/utilizadores').then(r => r.data.dados)
export const createUtilizador = d =>
  api.post('/utilizadores', d).then(r => r.data.dados)
export const updateUtilizador = (id, d) =>
  api.put(`/utilizadores/${id}`, d).then(r => r.data.dados)
export const deleteUtilizador = id =>
  api.delete(`/utilizadores/${id}`)
export const desativarUtilizador = id =>
  api.patch(`/utilizadores/${id}/desativar`)

// ── Perfis ────────────────────────────────────────────
export const getPerfis = () =>
  api.get('/perfis').then(r => r.data.dados)
export const createPerfil = d =>
  api.post('/perfis', d).then(r => r.data.dados)
export const updatePerfil = (id, d) =>
  api.put(`/perfis/${id}`, d).then(r => r.data.dados)
export const deletePerfil = id =>
  api.delete(`/perfis/${id}`)

// ── Inventário ────────────────────────────────────────
export const getInventario = () =>
  api.get('/inventario').then(r => r.data.dados)
export const createInventario = d =>
  api.post('/inventario', d).then(r => r.data.dados)
export const updateInventario = (id, d) =>
  api.put(`/inventario/${id}`, d).then(r => r.data.dados)
export const deleteInventario = id =>
  api.delete(`/inventario/${id}`)
export const getSemEstoque = () =>
  api.get('/inventario/sem-estoque').then(r => r.data.dados)
export const getEstoqueBaixo = (min = 5) =>
  api.get(`/inventario/estoque-baixo?min=${min}`).then(r => r.data.dados)

// ── Fornecedores ──────────────────────────────────────
export const getFornecedores = () =>
  api.get('/fornecedores').then(r => r.data.dados)
export const createFornecedor = d =>
  api.post('/fornecedores', d).then(r => r.data.dados)
export const updateFornecedor = (id, d) =>
  api.put(`/fornecedores/${id}`, d).then(r => r.data.dados)
export const deleteFornecedor = id =>
  api.delete(`/fornecedores/${id}`)

// ── Movimentos de Stock ───────────────────────────────
export const getMovimentos = () =>
  api.get('/movimentos-stock').then(r => r.data.dados)
export const createMovimento = d =>
  api.post('/movimentos-stock', d).then(r => r.data.dados)

// ── Manutenções ───────────────────────────────────────
export const getManutencoes = () =>
  api.get('/manutencoes').then(r => r.data.dados)
export const createManutencao = d =>
  api.post('/manutencoes', d).then(r => r.data.dados)
export const updateManutencao = (id, d) =>
  api.put(`/manutencoes/${id}`, d).then(r => r.data.dados)
export const updateEstadoManutencao = (id, estado) =>
  api.patch(`/manutencoes/${id}/estado?estado=${estado}`)
export const deleteManutencao = id =>
  api.delete(`/manutencoes/${id}`)
export const getAtrasadas = () =>
  api.get('/manutencoes/atrasadas').then(r => r.data.dados)
export const getProximas = (dias = 7) =>
  api.get(`/manutencoes/proximas?dias=${dias}`).then(r => r.data.dados)

// ── Tarefas ───────────────────────────────────────────
export const getTarefas = () =>
  api.get('/tarefas/estado/ABERTA').then(r => r.data.dados)
export const createTarefa = d =>
  api.post('/tarefas', d).then(r => r.data.dados)
export const updateEstadoTarefa = (id, estado) =>
  api.patch(`/tarefas/${id}/estado?estado=${estado}`)

// ── Histórico ─────────────────────────────────────────
export const getHistorico = () =>
  api.get('/historico').then(r => r.data.dados)

// ── Máquinas/Veículos ─────────────────────────────────
export const getMaquinas = () =>
  api.get('/maquinas-veiculos').then(r => r.data.dados)
export const createMaquina = d =>
  api.post('/maquinas-veiculos', d).then(r => r.data.dados)
export const updateMaquina = (id, d) =>
  api.put(`/maquinas-veiculos/${id}`, d).then(r => r.data.dados)
export const deleteMaquina = id =>
  api.delete(`/maquinas-veiculos/${id}`)

// ── Relatórios ────────────────────────────────────────
export const getRelatorioInventario = () =>
  api.get('/relatorios/inventario/resumo').then(r => r.data.dados)
export const getRelatorioManutencao = (inicio, fim) => {
  const hoje = new Date().toISOString().split('T')[0]
  const umMesAtras = new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString().split('T')[0]
  
  const i = (inicio && inicio !== 'undefined') ? inicio : umMesAtras
  const f = (fim && fim !== 'undefined') ? fim : hoje

  return api.get(`/relatorios/manutencao/resumo?inicio=${i}&fim=${f}`).then(r => r.data.dados)
}
export const getRelatorioMovimentos = (inicio, fim) =>
  api.get(`/relatorios/stock/movimentos?inicio=${inicio}&fim=${fim}`).then(r => r.data.dados)
export const getRelatorioUtilizadores = () =>
  api.get('/relatorios/utilizadores/resumo').then(r => r.data.dados)

export default api
