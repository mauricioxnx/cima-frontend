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
  Chip,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import Header        from "./Header"
import { tokens }   from "../theme"

import {
  getTarefas,
  createTarefa,
  updateEstadoTarefa,
  getManutencoes,
  getUtilizadores,
} from "../services/api";

import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const empty = {
  manutencaoId: "",
  utilizadorId: "",
  descricao: "",
  status: "ABERTA",
};

const estados = ["TODOS", "ABERTA", "EM_PROGRESSO", "CONCLUIDA"];

const Tarefas = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [data, setData] = useState([]);
  const [manut, setManut] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState("TODOS");

  const load = async () => {
    setLoading(true);
    try {
      const [t, m, u] = await Promise.all([
        getTarefas(),
        getManutencoes(),
        getUtilizadores(),
      ]);
      setData(t ?? []);
      setManut(m ?? []);
      setUsers(u ?? []);
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    try {
      await createTarefa(form);
      setModal(false);
      load();
    } catch {
      alert("Erro ao criar tarefa");
    }
  };

  const handleEstado = async (id, estado) => {
    try {
      await updateEstadoTarefa(id, estado);
      load();
    } catch {
      alert("Erro ao actualizar estado");
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const estadoColor = (estado) => {
    switch (estado) {
      case "ABERTA":
        return "warning";
      case "EM_PROGRESSO":
        return "info";
      case "CONCLUIDA":
        return "success";
      default:
        return "default";
    }
  };

  const filtered =
    filter === "TODOS" ? data : data.filter((d) => d.status === filter);

  const columns = [
    {
      field: "idTarefa",
      headerName: "ID",
      flex: 0.4,
    },
    {
      field: "descricao",
      headerName: "Descrição",
      flex: 1,
    },
    {
      field: "utilizadorNome",
      headerName: "Técnico",
      flex: 1,
    },
    {
      field: "manutencaoId",
      headerName: "Manutenção",
      flex: 0.7,
      renderCell: (p) => (p.value ? `#${p.value}` : "—"),
    },
    {
      field: "status",
      headerName: "Estado",
      flex: 1,
      renderCell: (p) => (
        <Chip label={p.value} color={estadoColor(p.value)} />
      ),
    },
    {
      field: "acoes",
      headerName: "Ações",
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" gap="8px">
          {row.status === "ABERTA" && (
            <Button
              size="small"
              sx={{ backgroundColor: cores.blueAccent[600] }}
              onClick={() =>
                handleEstado(row.idTarefa, "EM_PROGRESSO")
              }
            >
              <PlayArrowIcon />
            </Button>
          )}

          {row.status === "EM_PROGRESSO" && (
            <Button
              size="small"
              sx={{ backgroundColor: cores.greenAccent[600] }}
              onClick={() =>
                handleEstado(row.idTarefa, "CONCLUIDA")
              }
            >
              <CheckCircleIcon />
            </Button>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="TAREFAS" subtitle="Gestão de Tarefas" />

      {/* BOTÃO */}
      <Box display="flex" justifyContent="space-between" mb="10px">
        <Box display="flex" gap="10px">
          {estados.map((e) => (
            <Button
              key={e}
              size="small"
              variant={filter === e ? "contained" : "outlined"}
              onClick={() => setFilter(e)}
            >
              {e.replace("_", " ")}
            </Button>
          ))}
        </Box>

        <Button
          variant="contained"
          sx={{ backgroundColor: cores.blueAccent[600] }}
          onClick={() => {
            setForm(empty);
            setModal(true);
          }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Nova Tarefa
        </Button>
      </Box>

      {/* TABELA */}
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
          rows={filtered}
          columns={columns}
          getRowId={(row) => row.idTarefa}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      {/* MODAL */}
      <Dialog open={modal} onClose={() => setModal(false)} fullWidth>
        <DialogTitle>Nova Tarefa</DialogTitle>

        <DialogContent>
          <TextField
            select
            fullWidth
            label="Manutenção"
            margin="dense"
            value={form.manutencaoId}
            onChange={handleChange("manutencaoId")}
          >
            {manut.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                #{m.id} - {m.descricao ?? m.idTipo}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Técnico"
            margin="dense"
            value={form.utilizadorId}
            onChange={handleChange("utilizadorId")}
          >
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.nome}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Descrição"
            margin="dense"
            value={form.descricao}
            onChange={handleChange("descricao")}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Criar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tarefas;