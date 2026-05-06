import { useEffect, useState } from "react";
import {
  Box,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import { tokens } from "../theme"
import Header from "./Header"

import {
  getMaquinas,
  createMaquina,
  updateMaquina,
  deleteMaquina,
} from "../services/api";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const empty = {
  modelo: "",
  tipo: "",
  matriculaNSerie: "",
  dataAquisicao: "",
  estado: "ACTIVO",
};

const tipos = [
  "Escavadora",
  "Carregadeira",
  "Grua",
  "Caminhão",
  "Dumper",
  "Compactador",
  "Betoneira",
  "Gerador",
  "Outro",
];

const estados = ["ACTIVO", "INACTIVO", "EM_MANUTENCAO"];

const Maquinas = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMaquinas();
      setData(res ?? []);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(row);
    setModal(true);
  };

  const handleSave = async () => {
    try {
      if (editing) {
        await updateMaquina(editing.id, form);
      } else {
        await createMaquina(form);
      }
      setModal(false);
      load();
    } catch (e) {
      alert("Erro ao guardar");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remover equipamento?")) return;
    await deleteMaquina(id);
    load();
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },

    {
      field: "modelo",
      headerName: "Modelo",
      flex: 1,
      renderCell: (params) => <strong>{params.value}</strong>,
    },

    { field: "tipo", headerName: "Tipo", flex: 1 },

    {
      field: "matriculaNSerie",
      headerName: "Matrícula / Série",
      flex: 1,
    },

    {
      field: "dataAquisicao",
      headerName: "Data Aquisição",
      flex: 1,
    },

    {
      field: "estado",
      headerName: "Estado",
      flex: 1,
    },

    {
      field: "acoes",
      headerName: "Ações",
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" gap="10px">
          <Button
            size="small"
            sx={{ backgroundColor: cores.blueAccent[600] }}
            onClick={() => openEdit(row)}
          >
            <EditIcon />
          </Button>

          <Button
            size="small"
            sx={{ backgroundColor: cores.redAccent[600] }}
            onClick={() => handleDelete(row.id)}
          >
            <DeleteIcon />
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="MÁQUINAS"
        subtitle="Gestão de Máquinas e Veículos"
      />

      <Box display="flex" justifyContent="end" mb="10px">
        <Button
          variant="contained"
          onClick={openCreate}
          sx={{ backgroundColor: cores.blueAccent[600] }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Novo Equipamento
        </Button>
      </Box>

      <Box
        height="65vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: cores.blueAccent[700],
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: cores.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: cores.blueAccent[700],
          },
        }}
      >
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      {/* MODAL */}
      <Dialog open={modal} onClose={() => setModal(false)} fullWidth>
        <DialogTitle>
          {editing ? "Editar Equipamento" : "Novo Equipamento"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Modelo"
            margin="dense"
            value={form.modelo}
            onChange={handleChange("modelo")}
          />

          <TextField
            select
            fullWidth
            label="Tipo"
            margin="dense"
            value={form.tipo}
            onChange={handleChange("tipo")}
          >
            {tipos.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Estado"
            margin="dense"
            value={form.estado}
            onChange={handleChange("estado")}
          >
            {estados.map((e) => (
              <MenuItem key={e} value={e}>
                {e}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Matrícula / Série"
            margin="dense"
            value={form.matriculaNSerie}
            onChange={handleChange("matriculaNSerie")}
          />

          <TextField
            fullWidth
            type="date"
            label="Data Aquisição"
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={form.dataAquisicao}
            onChange={handleChange("dataAquisicao")}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Maquinas;