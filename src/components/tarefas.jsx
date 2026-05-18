import { useEffect, useState } from "react";
import {
  Box, Button, useTheme, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField,
  MenuItem, Chip, Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../theme";
import Header from "./Header";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PlayArrowOutlinedIcon from "@mui/icons-material/PlayArrowOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import {
  getTarefas, createTarefa,
  updateEstadoTarefa, getManutencoes, getUtilizadores,
} from "../services/api";

const schema = yup.object().shape({
  descricao:    yup.string().required("Obrigatório"),
  utilizadorId: yup.number().required("Obrigatório"),
  manutencaoId: yup.number(),
});

const inicial = {
  manutencaoId: "",
  utilizadorId: "",
  descricao:    "",
};

const estados = ["TODOS", "ABERTA", "EM_PROGRESSO", "CONCLUIDA"];

const COR_ESTADO = {
  ABERTA:       "#ffc84d",
  EM_PROGRESSO: "#4d9fff",
  CONCLUIDA:    "#4dffa3",
  CANCELADA:    "#9e9e9e",
}

const estadoColor = estado => {
  switch(estado) {
    case "ABERTA":       return "warning";
    case "EM_PROGRESSO": return "info";
    case "CONCLUIDA":    return "success";
    default:             return "default";
  }
}

const Tarefas = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);
  const isNaoMobile = useMediaQuery("(min-width:600px)");

  const [data, setData]       = useState([]);
  const [manut, setManut]     = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [filter, setFilter]   = useState("TODOS");
  const [search, setSearch]   = useState("");

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
      // ✅ filtra apenas TECNICO
      setTecnicos((u ?? []).filter(
        u => u.perfilNome?.toUpperCase() === "TECNICO"
      ));
    } catch(e) {
      console.error("Erro ao carregar tarefas", e);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdicionar = async (values, { resetForm }) => {
    try {
      await createTarefa({
        descricao:    values.descricao,
        utilizadorId: Number(values.utilizadorId),
        manutencaoId: values.manutencaoId ? Number(values.manutencaoId) : null,
      });
      await load();
      resetForm();
      setModal(false);
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao criar tarefa");
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

  const filtered = data
    .filter(d => filter === "TODOS" || d.status === filter)
    .filter(d =>
      d.descricao?.toLowerCase().includes(search.toLowerCase()) ||
      d.utilizadorNome?.toLowerCase().includes(search.toLowerCase())
    );

  const CamposFormulario = ({ values, errors, touched, handleBlur, handleChange }) => (
    <Box display="grid" gap="20px"
      gridTemplateColumns="repeat(4, minmax(0, 1fr))"
      sx={{ "& > div": { gridColumn: isNaoMobile ? undefined : "span 4" } }}>

      <TextField fullWidth variant="filled" label="Descrição da Tarefa"
        name="descricao" value={values.descricao ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.descricao && !!errors.descricao}
        helperText={touched.descricao && errors.descricao}
        sx={{ gridColumn: "span 4" }} />

      <TextField select fullWidth variant="filled" label="Técnico Responsável"
        name="utilizadorId" value={values.utilizadorId ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.utilizadorId && !!errors.utilizadorId}
        helperText={touched.utilizadorId && errors.utilizadorId}
        sx={{ gridColumn: "span 2" }}>
        <MenuItem value="">— Seleccionar técnico —</MenuItem>
        {tecnicos.map(u => (
          <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>
        ))}
      </TextField>

      <TextField select fullWidth variant="filled" label="Manutenção (opcional)"
        name="manutencaoId" value={values.manutencaoId ?? ''}
        onChange={handleChange}
        sx={{ gridColumn: "span 2" }}>
        <MenuItem value="">— Nenhuma —</MenuItem>
        {manut.map(m => (
          <MenuItem key={m.id} value={m.id}>
            #{m.id} — {m.descricao ?? m.idTipo}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );

  const columns = [
    { field: "idTarefa",      headerName: "ID",        flex: 0.4 },
    { field: "descricao",     headerName: "Descrição", flex: 1.5, cellClassName: "name-column--cell" },
    { field: "utilizadorNome",headerName: "Técnico",   flex: 1 },
    {
      field: "manutencaoId", headerName: "Manutenção", flex: 0.7,
      renderCell: ({ row }) => row?.manutencaoId ? `#${row.manutencaoId}` : "—",
    },
    {
      field: "status", headerName: "Estado", flex: 1,
      renderCell: ({ row }) => (
        <Chip label={row?.status} color={estadoColor(row?.status)} size="small" />
      ),
    },
    {
      field: "acoes", headerName: "Ações", flex: 1.5,
      renderCell: ({ row }) => (
        <Box display="flex" gap="6px" alignItems="center" height="100%">
          {row.status === "ABERTA" && (
            <Button size="small" variant="contained"
              sx={{ fontSize: "10px", py: "2px", px: "8px", backgroundColor: "#4d9fff" }}
              onClick={() => handleEstado(row.idTarefa, "EM_PROGRESSO")}>
              <PlayArrowOutlinedIcon fontSize="small" sx={{ mr: "4px" }} />
              Iniciar
            </Button>
          )}
          {row.status === "EM_PROGRESSO" && (
            <Button size="small" variant="contained"
              sx={{ fontSize: "10px", py: "2px", px: "8px", backgroundColor: cores.greenAccent[600] }}
              onClick={() => handleEstado(row.idTarefa, "CONCLUIDA")}>
              <CheckCircleOutlinedIcon fontSize="small" sx={{ mr: "4px" }} />
              Concluir
            </Button>
          )}
          {row.status !== "CONCLUIDA" && row.status !== "CANCELADA" && (
            <Button size="small" variant="outlined"
              sx={{ fontSize: "10px", py: "2px", px: "8px", color: cores.redAccent[400], borderColor: cores.redAccent[400] }}
              onClick={() => handleEstado(row.idTarefa, "CANCELADA")}>
              Cancelar
            </Button>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* FORMULÁRIO ADICIONAR */}
      <Box backgroundColor={cores.primary[400]} p="30px" borderRadius="8px" mb="30px">
        <Typography variant="h5" fontWeight="600" mb="20px" color={cores.grey[100]}>
          <AssignmentOutlinedIcon sx={{ mr: "8px", verticalAlign: "middle" }} />
          Adicionar Nova Tarefa
        </Typography>

        <Formik onSubmit={handleAdicionar} initialValues={inicial} validationSchema={schema}>
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <CamposFormulario values={values} errors={errors} touched={touched}
                handleBlur={handleBlur} handleChange={handleChange} />

              <Box display="flex" justifyContent="space-between" alignItems="center" mt="20px">
                <Box display="flex" gap="8px" alignItems="center">
                  <TextField
                    placeholder="Pesquisar por descrição ou técnico..."
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

                <Button type="submit" variant="contained"
                  sx={{ backgroundColor: cores.blueAccent[600], color: cores.grey[100], fontWeight: "bold", padding: "10px 20px" }}>
                  <AddOutlinedIcon sx={{ mr: "8px" }} />
                  Adicionar Tarefa
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>

      {/* RESUMO */}
      <Box display="flex" gap="15px" mb="15px">
        {["ABERTA", "EM_PROGRESSO", "CONCLUIDA", "CANCELADA"].map(estado => (
          <Box key={estado} backgroundColor={cores.primary[400]} p="15px"
            borderRadius="8px" flex={1}
            borderLeft={`4px solid ${COR_ESTADO[estado]}`}>
            <Typography color={cores.grey[300]} fontSize="12px">{estado.replace("_", " ")}</Typography>
            <Typography color={COR_ESTADO[estado]} fontSize="22px" fontWeight="bold">
              {data.filter(d => d.status === estado).length}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* TABELA */}
      <Box height="50vh" sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-cell": { borderBottom: "none" },
        "& .name-column--cell": { color: cores.greenAccent[300] },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: cores.blueAccent[700], borderBottom: "none" },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: cores.primary[400] },
        "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: cores.blueAccent[700] },
        "& .MuiCheckbox-root": { color: `${cores.greenAccent[200]} !important` },
        "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${cores.grey[100]} !important` },
      }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          getRowId={row => row.idTarefa}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          localeText={{ noRowsLabel: "Nenhuma tarefa registada ainda." }}
        />
      </Box>
    </Box>
  );
};

export default Tarefas;