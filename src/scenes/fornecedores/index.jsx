import { useState, useEffect } from "react";
import {
  Box, Button, TextField, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import {
  getFornecedores, createFornecedor,
  updateFornecedor, deleteFornecedor,
} from "../../services/api";

const telefoneRegExp = /^[+]?[\d\s\-().]{7,20}$/;

const schema = yup.object().shape({
  nome:      yup.string().required("Obrigatório"),
  nif:       yup.string(),
  telefone:  yup.string().matches(telefoneRegExp, "Número inválido"),
  email:     yup.string().email("Email inválido"),
  categoria: yup.string(),
  endereco:  yup.string(),
});

const inicial = {
  nome: "", nif: "", telefone: "",
  email: "", categoria: "", endereco: "",
};

const Fornecedores = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);
  const isNaoMobile = useMediaQuery("(min-width:600px)");

  const [dados, setDados]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch]   = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await getFornecedores();
      setDados(data ?? []);
    } catch(e) {
      console.error("Erro ao carregar fornecedores", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdicionar = async (values, { resetForm }) => {
    try {
      await createFornecedor(values);
      await load();
      resetForm();
      setModal(false);
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao criar fornecedor");
    }
  };

  const handleEditar = async (values) => {
    try {
      await updateFornecedor(editing.id, values);
      await load();
      setModal(false);
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao atualizar fornecedor");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("Remover fornecedor?")) return;
    try {
      await deleteFornecedor(id);
      await load();
    } catch(e) {
      alert("Erro ao eliminar fornecedor");
    }
  };

  const openCreate = () => { setEditing(null); setModal(true); };
  const openEdit   = row  => { setEditing(row); setModal(true); };

  const filtrado = dados.filter(d =>
    d.nome?.toLowerCase().includes(search.toLowerCase()) ||
    d.categoria?.toLowerCase().includes(search.toLowerCase()) ||
    d.nif?.toLowerCase().includes(search.toLowerCase())
  );

  const colunas = [
    { field: "id",        headerName: "ID",        flex: 0.3 },
    { field: "nome",      headerName: "Nome",      flex: 1.5, cellClassName: "name-column--cell" },
    { field: "nif",       headerName: "NIF",       flex: 1 },
    { field: "telefone",  headerName: "Telefone",  flex: 1 },
    { field: "email",     headerName: "Email",     flex: 1.5 },
    { field: "categoria", headerName: "Categoria", flex: 1 },
    { field: "endereco",  headerName: "Endereço",  flex: 1.5 },
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
            onClick={() => handleEliminar(row.id)}>
            <DeleteOutlinedIcon fontSize="small" />
          </Button>
        </Box>
      ),
    },
  ];

  const CamposFormulario = ({ values, errors, touched, handleBlur, handleChange }) => (
    <Box display="grid" gap="20px"
      gridTemplateColumns="repeat(4, minmax(0, 1fr))"
      sx={{ "& > div": { gridColumn: isNaoMobile ? undefined : "span 4" } }}>

      <TextField fullWidth variant="filled" label="Nome do Fornecedor"
        name="nome" value={values.nome ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.nome && !!errors.nome}
        helperText={touched.nome && errors.nome}
        sx={{ gridColumn: "span 4" }} />

      <TextField fullWidth variant="filled" label="NIF"
        name="nif" value={values.nif ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.nif && !!errors.nif}
        helperText={touched.nif && errors.nif}
        sx={{ gridColumn: "span 2" }} />

      <TextField fullWidth variant="filled" label="Categoria"
        name="categoria" value={values.categoria ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        sx={{ gridColumn: "span 2" }} />

      <TextField fullWidth variant="filled" label="Email"
        name="email" value={values.email ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.email && !!errors.email}
        helperText={touched.email && errors.email}
        sx={{ gridColumn: "span 2" }} />

      <TextField fullWidth variant="filled" label="Telefone"
        name="telefone" value={values.telefone ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.telefone && !!errors.telefone}
        helperText={touched.telefone && errors.telefone}
        sx={{ gridColumn: "span 2" }} />

      <TextField fullWidth variant="filled" label="Endereço"
        name="endereco" value={values.endereco ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        sx={{ gridColumn: "span 4" }} />
    </Box>
  );

  return (
    <Box m="20px">
      <Header title="FORNECEDORES" subtitle={`${dados.length} fornecedores registados`} />

      {/* FORMULÁRIO ADICIONAR */}
      <Box backgroundColor={cores.primary[400]} p="30px" borderRadius="8px" mb="30px">
        <Typography variant="h5" fontWeight="600" mb="20px" color={cores.grey[100]}>
          <LocalShippingOutlinedIcon sx={{ mr: "8px", verticalAlign: "middle" }} />
          Adicionar Novo Fornecedor
        </Typography>

        <Formik onSubmit={handleAdicionar} initialValues={inicial} validationSchema={schema}>
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <CamposFormulario values={values} errors={errors} touched={touched}
                handleBlur={handleBlur} handleChange={handleChange} />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt="20px">
                <TextField
                  placeholder="Pesquisar por nome, NIF ou categoria..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  size="small"
                  sx={{ width: "300px" }}
                />
                <Button type="submit" variant="contained"
                  sx={{ backgroundColor: cores.blueAccent[600], color: cores.grey[100], fontWeight: "bold", padding: "10px 20px" }}>
                  <AddOutlinedIcon sx={{ mr: "8px" }} />
                  Adicionar Fornecedor
                </Button>
              </Box>
            </form>
          )}
        </Formik>
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
        <DataGrid rows={filtrado} columns={colunas} loading={loading}
          components={{ Toolbar: GridToolbar }}
          localeText={{ noRowsLabel: "Nenhum fornecedor registado ainda." }} />
      </Box>

      {/* MODAL EDIÇÃO */}
      <Dialog open={modal} onClose={() => setModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: cores.primary[400], color: cores.grey[100] }}>
          <EditOutlinedIcon sx={{ mr: "8px", verticalAlign: "middle" }} />
          Editar Fornecedor
        </DialogTitle>

        {editing && (
          <Formik
            onSubmit={handleEditar}
            initialValues={{
              nome:      editing.nome      ?? '',
              nif:       editing.nif       ?? '',
              telefone:  editing.telefone  ?? '',
              email:     editing.email     ?? '',
              categoria: editing.categoria ?? '',
              endereco:  editing.endereco  ?? '',
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

export default Fornecedores;