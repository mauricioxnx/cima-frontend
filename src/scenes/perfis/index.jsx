import { useEffect, useState } from 'react'
import {
  Box, Typography, useTheme, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, IconButton, CircularProgress
} from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { tokens } from '../../theme'
import { getPerfis, createPerfil, updatePerfil, deletePerfil } from '../../services/api'
import Header from '../../components/Header'
import AddOutlinedIcon from '@mui/icons-material/AddOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'

const emptyP = { nome: '', descricao: '' }

const Perfis = () => {
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)

  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(emptyP)
  const [saving, setSaving]   = useState(false)

  const load = async () => {
    setLoading(true)
    setData((await getPerfis()) ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyP); setModal(true) }
  const openEdit   = r  => { setEditing(r); setForm(r); setModal(true) }

  const handleSave = async () => {
    setSaving(true)
    try {
      editing ? await updatePerfil(editing.id, form) : await createPerfil(form)
      setModal(false)
      await load()
    } catch (e) {
      alert(e?.response?.data?.mensagem ?? 'Erro')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Remover perfil?')) return
    await deletePerfil(id)
    await load()
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    {
      field: 'nome', headerName: 'Nome', flex: 1,
      cellClassName: 'name-column--cell',
      renderCell: ({ row }) => <strong>{row.nome}</strong>
    },
    { field: 'descricao', headerName: 'Descrição', flex: 2 },
    {
      field: 'totalUtilizadores', headerName: 'Utilizadores', width: 120,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap="6px">
          <AdminPanelSettingsOutlinedIcon fontSize="small" />
          <Typography>{row.totalUtilizadores ?? 0}</Typography>
        </Box>
      )
    },
    {
      field: '_acoes', headerName: '', width: 120, sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" gap="8px">
          <IconButton
            size="small"
            onClick={() => openEdit(row)}
            sx={{ color: colors.greenAccent[400] }}
          >
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row.id)}
            sx={{ color: colors.redAccent?.[400] ?? '#e74c3c' }}
          >
            <DeleteOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      )
    },
  ]

  return (
    <Box m="20px">

      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="PERFIS" subtitle="Controlo de acessos" />
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={openCreate}
          sx={{
            background: colors.blueAccent[700],
            '&:hover': { background: colors.blueAccent[600] }
          }}
        >
          Novo Perfil
        </Button>
      </Box>

      {/* TABELA */}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          '& .MuiDataGrid-root': { border: 'none' },
          '& .MuiDataGrid-cell': { borderBottom: 'none' },
          '& .name-column--cell': { color: colors.greenAccent[300] },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: colors.blueAccent[700],
            borderBottom: 'none',
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: colors.primary[400],
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: colors.blueAccent[700],
          },
          '& .MuiCheckbox-root': {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        {loading
          ? <Box display="flex" justifyContent="center" mt="100px"><CircularProgress /></Box>
          : <DataGrid checkboxSelection rows={data} columns={columns} />
        }
      </Box>

      {/* MODAL CRIAR / EDITAR */}
      <Dialog
        open={modal}
        onClose={() => setModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { background: colors.primary[400] } }}
      >
        <DialogTitle sx={{ color: colors.grey[100] }}>
          {editing ? 'Editar Perfil' : 'Novo Perfil'}
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '16px', pt: '16px !important' }}>
          <TextField
            label="Nome"
            value={form.nome}
            onChange={set('nome')}
            fullWidth
            variant="filled"
            sx={{ '& .MuiInputBase-root': { background: colors.primary[500] } }}
          />
          <TextField
            label="Descrição"
            value={form.descricao ?? ''}
            onChange={set('descricao')}
            fullWidth
            multiline
            rows={3}
            variant="filled"
            sx={{ '& .MuiInputBase-root': { background: colors.primary[500] } }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setModal(false)}
            sx={{ color: colors.grey[300] }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{
              background: colors.blueAccent[700],
              '&:hover': { background: colors.blueAccent[600] }
            }}
          >
            {saving ? 'A guardar...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}

export default Perfis