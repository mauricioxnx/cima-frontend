import { useEffect, useState } from "react";
import {
  Box, Button, TextField, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, MenuItem,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../theme";
import Header from "./Header";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import {
  getMaquinas, createMaquina, updateMaquina, deleteMaquina,
} from "../services/api";

const tipos = [
  "Escavadora", "Carregadeira", "Grua", "Caminhão",
  "Dumper", "Compactador", "Betoneira", "Gerador", "Outro",
];

const estadosMaq = ["ACTIVO", "INACTIVO", "EM_MANUTENCAO"];

const COR_ESTADO = {
  ACTIVO:        "#4dffa3",
  INACTIVO:      "#9e9e9e",
  EM_MANUTENCAO: "#ffc84d",
}

const schema = yup.object().shape({
  modelo:          yup.string().required("Obrigatório"),
  tipo:            yup.string().required("Obrigatório"),
  matriculaNSerie: yup.string(),
  dataAquisicao:   yup.string(),
  estado:          yup.string().required("Obrigatório"),
});

const inicial = {
  modelo: "", tipo: "", matriculaNSerie: "",
  dataAquisicao: "", estado: "ACTIVO",
};

const Maquinas = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);
  const isNaoMobile = useMediaQuery("(min-width:600px)");

  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch]   = useState("");

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

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setModal(true); };
  const openEdit   = row  => { setEditing(row); setModal(true); };

  const handleAdicionar = async (values, { resetForm }) => {
    try {
      await createMaquina(values);
      await load();
      resetForm();
      setModal(false);
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao criar equipamento");
    }
  };

  const handleEditar = async (values) => {
    try {
      await updateMaquina(editing.id, values);
      await load();
      setModal(false);
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao atualizar equipamento");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remover equipamento?")) return;
    try {
      await deleteMaquina(id);
      await load();
    } catch {
      alert("Erro ao eliminar");
    }
  };

  const filtrado = data.filter(d =>
    d.modelo?.toLowerCase().includes(search.toLowerCase()) ||
    d.tipo?.toLowerCase().includes(search.toLowerCase()) ||
    d.matriculaNSerie?.toLowerCase().includes(search.toLowerCase())
  );

  const CamposFormulario = ({ values, errors, touched, handleBlur, handleChange }) => (
    <Box display="grid" gap="20px"
      gridTemplateColumns="repeat(4, minmax(0, 1fr))"
      sx={{ "& > div": { gridColumn: isNaoMobile ? undefined : "span 4" } }}>

      <TextField fullWidth variant="filled" label="Modelo"
        name="modelo" value={values.modelo ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.modelo && !!errors.modelo}
        helperText={touched.modelo && errors.modelo}
        sx={{ gridColumn: "span 2" }} />

      <TextField select fullWidth variant="filled" label="Tipo"
        name="tipo" value={values.tipo ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.tipo && !!errors.tipo}
        helperText={touched.tipo && errors.tipo}
        sx={{ gridColumn: "span 2" }}>
        {tipos.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
      </TextField>

      <TextField fullWidth variant="filled" label="Matrícula / Série"
        name="matriculaNSerie" value={values.matriculaNSerie ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        sx={{ gridColumn: "span 2" }} />

      <TextField select fullWidth variant="filled" label="Estado"
        name="estado" value={values.estado ?? 'ACTIVO'}
        onBlur={handleBlur} onChange={handleChange}
        sx={{ gridColumn: "span 2" }}>
        {estadosMaq.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
      </TextField>

      <TextField fullWidth variant="filled" label="Data Aquisição" type="date"
        name="dataAquisicao" value={values.dataAquisicao ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        InputLabelProps={{ shrink: true }}
        sx={{ gridColumn: "span 4" }} />
    </Box>
  );

  const columns = [
    { field: "id", headerName: "ID", flex: 0.3 },
    {
      field: "modelo", headerName: "Modelo", flex: 1,
      cellClassName: "name-column--cell",
      renderCell: ({ row }) => <strong>{row?.modelo}</strong>,
    },
    { field: "tipo",            headerName: "Tipo",              flex: 1 },
    { field: "matriculaNSerie", headerName: "Matrícula / Série", flex: 1 },
    { field: "dataAquisicao",   headerName: "Data Aquisição",    flex: 1 },
    {
      field: "estado", headerName: "Estado", flex: 1,
      renderCell: ({ row }) => (
        <Box px="8px" py="2px" borderRadius="4px"
          sx={{ background: COR_ESTADO[row?.estado] ?? cores.grey[600] }}>
          <Typography fontSize="11px" color="#000" fontWeight="bold">
            {row?.estado}
          </Typography>
        </Box>
      )
    },
    {
      field: "acoes", headerName: "Ações", flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" gap="10px" alignItems="center" height="100%">
          <Button variant="contained" size="small"
            sx={{ backgroundColor: cores.blueAccent[600], minWidth: "36px", padding: "4px 8px" }}
            onClick={() => openEdit(row)}>
            <EditOutlinedIcon fontSize="small" />
          </Button>
          <Button variant="contained" size="small"
            sx={{ backgroundColor: cores.redAccent[600], minWidth: "36px", padding: "4px 8px" }}
            onClick={() => handleDelete(row.id)}>
            <DeleteOutlinedIcon fontSize="small" />
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* FORMULÁRIO ADICIONAR */}
      <Box backgroundColor={cores.primary[400]} p="30px" borderRadius="8px" mb="30px">
        <Typography variant="h5" fontWeight="600" mb="20px" color={cores.grey[100]}>
          <PrecisionManufacturingOutlinedIcon sx={{ mr: "8px", verticalAlign: "middle" }} />
          Adicionar Novo Equipamento
        </Typography>

        <Formik onSubmit={handleAdicionar} initialValues={inicial} validationSchema={schema}>
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <CamposFormulario values={values} errors={errors} touched={touched}
                handleBlur={handleBlur} handleChange={handleChange} />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt="20px">
                <TextField
                  placeholder="Pesquisar por modelo, tipo ou matrícula..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  size="small"
                  sx={{ width: "300px" }}
                />
                <Button type="submit" variant="contained"
                  sx={{ backgroundColor: cores.blueAccent[600], color: cores.grey[100], fontWeight: "bold", padding: "10px 20px" }}>
                  <AddOutlinedIcon sx={{ mr: "8px" }} />
                  Adicionar Equipamento
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>

      {/* RESUMO */}
      <Box display="flex" gap="15px" mb="15px">
        {estadosMaq.map(estado => (
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
        <DataGrid rows={filtrado} columns={columns} loading={loading}
          components={{ Toolbar: GridToolbar }}
          localeText={{ noRowsLabel: "Nenhum equipamento registado ainda." }} />
      </Box>

      {/* MODAL EDIÇÃO */}
      <Dialog open={modal} onClose={() => setModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: cores.primary[400], color: cores.grey[100] }}>
          <EditOutlinedIcon sx={{ mr: "8px", verticalAlign: "middle" }} />
          Editar Equipamento
        </DialogTitle>

        {editing && (
          <Formik
            onSubmit={handleEditar}
            initialValues={{
              modelo:          editing.modelo          ?? '',
              tipo:            editing.tipo            ?? '',
              matriculaNSerie: editing.matriculaNSerie ?? '',
              dataAquisicao:   editing.dataAquisicao   ?? '',
              estado:          editing.estado          ?? 'ACTIVO',
            }}
            validationSchema={schema}
          >
            {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <DialogContent sx={{ backgroundColor: cores.primary[400] }}>
                  <CamposFormulario values={values} errors={errors} touched={touched}
                    handleBlur={handleBlur} handleChange={handleChange} />
                </DialogContent>
                <DialogActions sx={{ backgroundColor: cores.primary[400], p: "15px 20px" }}>
                  <Button onClick={() => setModal(false)} variant="outlined"
                    sx={{ color: cores.grey[100], borderColor: cores.grey[400] }}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="contained"
                    sx={{ backgroundColor: cores.blueAccent[600], color: cores.grey[100], fontWeight: "bold" }}>
                    Guardar Alterações
                  </Button>
                </DialogActions>
              </form>
            )}
          </Formik>
        )}
      </Dialog>
    </Box>
  );
};

export default Maquinas;