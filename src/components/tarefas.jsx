import { useEffect, useState } from "react";
import {
  Box, Button, useTheme, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
  Chip, Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../theme";
import Header from "./Header";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useAuth } from "../hooks/useAuth";
import {
  getManutencoes, updateEstadoManutencao, updateManutencao,
} from "../services/api";

const COR_ESTADO = {
  PENDENTE:  "#ffc84d",
  EM_CURSO:  "#4d9fff",
  CONCLUIDA: "#4dffa3",
  CANCELADA: "#9e9e9e",
};

const estadoColor = estado => {
  switch (estado) {
    case "PENDENTE":  return "warning";
    case "EM_CURSO":  return "info";
    case "CONCLUIDA": return "success";
    default:          return "default";
  }
};

const Tarefas = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);
  const isNaoMobile = useMediaQuery("(min-width:600px)");
  const { user } = useAuth();

  const perfil = user?.perfil ?? user?.perfilNome ?? "";
  const isTecnico = perfil.toUpperCase() === "TECNICO";

  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState("TODOS");
  const [search, setSearch]       = useState("");
  const [detalhe, setDetalhe]     = useState(null);
  const [observacao, setObservacao] = useState(""); // ✅ campo editável
  const [saving, setSaving]       = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      let manutencoes = await getManutencoes();
      manutencoes = manutencoes ?? [];

      if (isTecnico && user?.id) {
        manutencoes = manutencoes.filter(m => m.utilizadorId === user.id);
      }

      setData(manutencoes);
    } catch (e) {
      console.error("Erro ao carregar tarefas", e);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const abrirDetalhe = (row) => {
    setDetalhe(row);
    setObservacao(row.observacao ?? ""); // ✅ carrega observacao, não descricao
  };

  const handleGuardar = async () => {
    if (!detalhe) return;
    setSaving(true);
    try {
      await updateManutencao(detalhe.id, {
        idTipo:           detalhe.idTipo,
        dataAgendada:     detalhe.dataAgendada,
        descricao:        detalhe.descricao,      // ✅ descricao original — nunca alterada
        observacao:       observacao,              // ✅ apenas observacao é enviada pelo técnico
        estado:           detalhe.estado,
        utilizadorId:     detalhe.utilizadorId     ?? null,
        tipoManutencaoId: detalhe.tipoManutencaoId ?? null,
        maquinaVeiculoId: detalhe.maquinaVeiculoId ?? null,
        inventarioId:     detalhe.inventarioId     ?? null,
      });
      await load();
      setDetalhe(null);
    } catch (e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleEstado = async (id, estado) => {
    try {
      await updateEstadoManutencao(id, estado);
      await load();
      if (detalhe?.id === id) {
        setDetalhe(prev => ({ ...prev, estado }));
      }
    } catch {
      alert("Erro ao actualizar estado");
    }
  };

  const estados = ["TODOS", "PENDENTE", "EM_CURSO", "CONCLUIDA", "CANCELADA"];

  const filtered = data
    .filter(d => filter === "TODOS" || d.estado === filter)
    .filter(d =>
      d.descricao?.toLowerCase().includes(search.toLowerCase()) ||
      d.tipoManutencaoNome?.toLowerCase().includes(search.toLowerCase()) ||
      d.maquinaVeiculoModelo?.toLowerCase().includes(search.toLowerCase()) ||
      d.utilizadorNome?.toLowerCase().includes(search.toLowerCase())
    );

  const columns = [
    { field: "id", headerName: "ID", flex: 0.4 },
    {
      field: "tipoManutencaoNome", headerName: "Tipo", flex: 1,
      renderCell: ({ row }) => row?.tipoManutencaoNome ?? row?.idTipo ?? "—",
    },
    {
      field: "maquinaVeiculoModelo", headerName: "Máquina / Veículo", flex: 1.2,
      renderCell: ({ row }) => row?.maquinaVeiculoModelo ?? "—",
    },
    {
      field: "utilizadorNome", headerName: "Técnico", flex: 1,
      renderCell: ({ row }) => row?.utilizadorNome ?? "—",
    },
    {
      field: "inventarioId", headerName: "Peça", flex: 0.8,
      renderCell: ({ row }) => row?.inventarioId ? `#${row.inventarioId}` : "—",
    },
    {
      field: "descricao", headerName: "Descrição", flex: 1.5,
      renderCell: ({ row }) => row?.descricao ?? "—",
    },
    { field: "dataAgendada", headerName: "Data", flex: 0.8 },
    {
      field: "estado", headerName: "Estado", flex: 1,
      renderCell: ({ row }) => (
        <Chip label={row?.estado} color={estadoColor(row?.estado)} size="small" />
      ),
    },
    {
      field: "acoes", headerName: "Ações", flex: 1.5,
      renderCell: ({ row }) => (
        <Box display="flex" gap="6px" alignItems="center" height="100%">
          <Button size="small" variant="outlined"
            sx={{ fontSize: "10px", py: "2px", px: "8px", color: cores.blueAccent[300], borderColor: cores.blueAccent[300] }}
            onClick={() => abrirDetalhe(row)}>
            <InfoOutlinedIcon fontSize="small" sx={{ mr: "2px" }} />
            Ver
          </Button>
          {row.estado === "PENDENTE" && (
            <Button size="small" variant="contained"
              sx={{ fontSize: "10px", py: "2px", px: "8px", backgroundColor: "#4d9fff" }}
              onClick={() => handleEstado(row.id, "EM_CURSO")}>
              <PlayArrowOutlinedIcon fontSize="small" />
              Iniciar
            </Button>
          )}
          {row.estado === "EM_CURSO" && (
            <Button size="small" variant="contained"
              sx={{ fontSize: "10px", py: "2px", px: "8px", backgroundColor: cores.greenAccent[600] }}
              onClick={() => handleEstado(row.id, "CONCLUIDA")}>
              <CheckCircleOutlinedIcon fontSize="small" />
              Concluir
            </Button>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* FILTROS E PESQUISA */}
      <Box display="flex" gap="8px" alignItems="center" mb="20px" flexWrap="wrap">
        <TextField
          placeholder="Pesquisar por tipo, máquina, técnico..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ width: "280px" }}
        />
        {estados.map(e => (
          <Button key={e} size="small"
            variant={filter === e ? "contained" : "outlined"}
            onClick={() => setFilter(e)}
            sx={{
              backgroundColor: filter === e ? (COR_ESTADO[e] ?? cores.blueAccent[600]) : "transparent",
              borderColor: COR_ESTADO[e] ?? cores.blueAccent[600],
              color: filter === e ? "#000" : (COR_ESTADO[e] ?? cores.blueAccent[400]),
              fontSize: "11px",
            }}>
            {e.replace("_", " ")}
          </Button>
        ))}
      </Box>

      {/* RESUMO */}
      <Box display="flex" gap="15px" mb="15px">
        {["PENDENTE", "EM_CURSO", "CONCLUIDA", "CANCELADA"].map(estado => (
          <Box key={estado} backgroundColor={cores.primary[400]} p="15px"
            borderRadius="8px" flex={1}
            borderLeft={`4px solid ${COR_ESTADO[estado]}`}>
            <Typography color={cores.grey[300]} fontSize="12px">{estado.replace("_", " ")}</Typography>
            <Typography color={COR_ESTADO[estado]} fontSize="22px" fontWeight="bold">
              {data.filter(d => d.estado === estado).length}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* TABELA */}
      <Box height="55vh" sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-cell": { borderBottom: "none" },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: cores.blueAccent[700], borderBottom: "none" },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: cores.primary[400] },
        "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: cores.blueAccent[700] },
        "& .MuiCheckbox-root": { color: `${cores.greenAccent[200]} !important` },
        "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${cores.grey[100]} !important` },
      }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          localeText={{ noRowsLabel: "Nenhuma tarefa disponível." }}
        />
      </Box>

      {/* MODAL DETALHE */}
      <Dialog open={!!detalhe} onClose={() => setDetalhe(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          Detalhe da Manutenção #{detalhe?.id}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "14px", pt: "16px !important" }}>

          {/* INFO DA MANUTENÇÃO */}
          <Box p="14px" borderRadius="8px" bgcolor="#f5f5f5" display="flex" flexDirection="column" gap="6px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography fontWeight="bold" fontSize="14px">
                {detalhe?.tipoManutencaoNome ?? detalhe?.idTipo ?? "Manutenção"}
              </Typography>
              <Chip label={detalhe?.estado} color={estadoColor(detalhe?.estado)} size="small" />
            </Box>
            <Typography fontSize="12px" color="#555">
              🔧 Máquina: <strong>{detalhe?.maquinaVeiculoModelo ?? "—"}</strong>
            </Typography>
            <Typography fontSize="12px" color="#555">
              👤 Técnico: <strong>{detalhe?.utilizadorNome ?? "—"}</strong>
            </Typography>
            <Typography fontSize="12px" color="#555">
              📦 Peça: <strong>{detalhe?.inventarioId ? `#${detalhe.inventarioId}` : "—"}</strong>
            </Typography>
            <Typography fontSize="12px" color="#555">
              📅 Data agendada: <strong>{detalhe?.dataAgendada ?? "—"}</strong>
            </Typography>
          </Box>

          {/* ✅ DESCRIÇÃO — apenas leitura, não editável */}
          <TextField
            label="Descrição da Manutenção"
            value={detalhe?.descricao ?? ""}
            fullWidth
            multiline
            rows={2}
            disabled
            helperText="A descrição é definida na criação e não pode ser alterada."
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "#333",
                cursor: "not-allowed",
              },
              "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
                borderColor: "#ccc",
              },
            }}
          />

          {/* ✅ OBSERVAÇÃO — editável pelo técnico */}
          <TextField
            label="Observações da Intervenção"
            value={observacao}
            onChange={e => setObservacao(e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Descreve o trabalho realizado, peças utilizadas, problemas encontrados..."
            helperText="Regista aqui as observações e detalhes da intervenção efectuada."
          />

          {/* ACÇÕES DE ESTADO */}
          <Box display="flex" gap="8px" flexWrap="wrap">
            {detalhe?.estado === "PENDENTE" && (
              <Button variant="contained"
                sx={{ backgroundColor: "#4d9fff" }}
                onClick={() => handleEstado(detalhe.id, "EM_CURSO")}>
                <PlayArrowOutlinedIcon sx={{ mr: "4px" }} />
                Iniciar Manutenção
              </Button>
            )}
            {detalhe?.estado === "EM_CURSO" && (
              <Button variant="contained"
                sx={{ backgroundColor: "#4dffa3", color: "#000" }}
                onClick={() => handleEstado(detalhe.id, "CONCLUIDA")}>
                <CheckCircleOutlinedIcon sx={{ mr: "4px" }} />
                Marcar como Concluída
              </Button>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetalhe(null)} sx={{ color: "#666" }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleGuardar} disabled={saving}
            sx={{ backgroundColor: cores.blueAccent[600] }}>
            {saving ? "A guardar..." : "Guardar Observação"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tarefas;
