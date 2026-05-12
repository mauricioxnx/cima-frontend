import { useState, useEffect } from "react";
import {
  Box, Button, TextField, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography,
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
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import {
  getInventario, createInventario,
  updateInventario, deleteInventario,
} from "../services/api";

const schema = yup.object().shape({
  codigo:      yup.string().required("Obrigatório"),
  descricao:   yup.string().required("Obrigatório"),
  unidadeBase: yup.string(),
  preco:       yup.number().min(0).required("Obrigatório"),
  precoVenda1: yup.number().min(0).required("Obrigatório"),
  quantidade:  yup.number().min(0).required("Obrigatório"),
});

const schemaEdicao = yup.object().shape({
  descricao:   yup.string().required("Obrigatório"),
  unidadeBase: yup.string(),
  preco:       yup.number().min(0).required("Obrigatório"),
  precoVenda1: yup.number().min(0).required("Obrigatório"),
  quantidade:  yup.number().min(0).required("Obrigatório"),
});

const inicial = {
  codigo: "", descricao: "", descricao3: "",
  unidadeBase: "", preco: "", precoVenda1: "",
  precoVenda2: "", precoVenda3: "", quantidade: 0,
};

const preparar = values => ({
  codigo:      values.codigo,
  descricao:   values.descricao,
  descricao3:  values.descricao3 ?? "",
  unidadeBase: values.unidadeBase,
  preco:       Number(values.preco),
  precoVenda1: Number(values.precoVenda1),
  precoVenda2: Number(values.precoVenda2 ?? 0),
  precoVenda3: Number(values.precoVenda3 ?? 0),
  quantidade:  Number(values.quantidade),
});

const Inventario = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);
  const isNaoMobile = useMediaQuery("(min-width:600px)");

  const [dados, setDados]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null);
  const [search, setSearch]       = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await getInventario();
      setDados(data ?? []);
    } catch(e) {
      console.error("Erro ao carregar inventário", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdicionar = async (values, { resetForm }) => {
    try {
      await createInventario(preparar(values));
      await load();
      resetForm();
      setModal(false);
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao criar produto");
    }
  };

  const handleEditar = async (values) => {
    try {
      await updateInventario(editing.id, preparar(values));
      await load();
      setModal(false);
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao atualizar produto");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("Remover produto?")) return;
    try {
      await deleteInventario(id);
      await load();
    } catch(e) {
      alert("Erro ao eliminar");
    }
  };

  const openCreate = () => { setEditing(null); setModal(true); };
  const openEdit   = row  => { setEditing(row); setModal(true); };

  const filtrado = dados.filter(d =>
    d.descricao?.toLowerCase().includes(search.toLowerCase()) ||
    d.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  const colunas = [
    { field: "id",          headerName: "ID",          flex: 0.3 },
    { field: "codigo",      headerName: "Código",      flex: 1, cellClassName: "name-column--cell" },
    { field: "descricao",   headerName: "Descrição",   flex: 2 },
    { field: "unidadeBase", headerName: "Unidade",     flex: 0.8 },
    {
      field: "preco", headerName: "Preço (Kz)", flex: 1,
      renderCell: ({ row }) => row.preco ? `${Number(row.preco).toLocaleString()} Kz` : "—",
    },
    {
      field: "precoVenda1", headerName: "P. Venda (Kz)", flex: 1,
      renderCell: ({ row }) => row.precoVenda1 ? `${Number(row.precoVenda1).toLocaleString()} Kz` : "—",
    },
    {
      field: "quantidade", headerName: "Stock", flex: 0.8,
      renderCell: ({ row }) => {
        if (row.quantidade === 0) return <span style={{ color: cores.redAccent[400] }}>Sem stock</span>
        if (row.quantidade < 5)  return <span style={{ color: "#f0a500" }}>Baixo ({row.quantidade})</span>
        return row.quantidade
      },
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
            onClick={() => handleEliminar(row.id)}>
            <DeleteOutlinedIcon fontSize="small" />
          </Button>
        </Box>
      ),
    },
  ];

  const CamposFormulario = ({ values, errors, touched, handleBlur, handleChange, isEdit }) => (
    <Box display="grid" gap="20px"
      gridTemplateColumns="repeat(4, minmax(0, 1fr))"
      sx={{ "& > div": { gridColumn: isNaoMobile ? undefined : "span 4" } }}>

      <TextField fullWidth variant="filled" label="Código"
        name="codigo" value={values.codigo ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        disabled={isEdit}
        error={!!touched.codigo && !!errors.codigo}
        helperText={touched.codigo && errors.codigo}
        sx={{ gridColumn: "span 2" }} />

      <TextField fullWidth variant="filled" label="Unidade"
        name="unidadeBase" value={values.unidadeBase ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        sx={{ gridColumn: "span 2" }} />

      <TextField fullWidth variant="filled" label="Descrição"
        name="descricao" value={values.descricao ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.descricao && !!errors.descricao}
        helperText={touched.descricao && errors.descricao}
        sx={{ gridColumn: "span 4" }} />

      <TextField fullWidth variant="filled" label="Descrição adicional (opcional)"
        name="descricao3" value={values.descricao3 ?? ''}
        onChange={handleChange}
        sx={{ gridColumn: "span 4" }} />

      <TextField fullWidth variant="filled" label="Preço de Custo (Kz)" type="number"
        name="preco" value={values.preco ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.preco && !!errors.preco}
        helperText={touched.preco && errors.preco}
        sx={{ gridColumn: "span 2" }} />

      <TextField fullWidth variant="filled" label="Preço Venda 1 (Kz)" type="number"
        name="precoVenda1" value={values.precoVenda1 ?? ''}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.precoVenda1 && !!errors.precoVenda1}
        helperText={touched.precoVenda1 && errors.precoVenda1}
        sx={{ gridColumn: "span 2" }} />

      <TextField fullWidth variant="filled" label="Preço Venda 2 (Kz)" type="number"
        name="precoVenda2" value={values.precoVenda2 ?? ''}
        onChange={handleChange}
        sx={{ gridColumn: "span 2" }} />

      <TextField fullWidth variant="filled" label="Preço Venda 3 (Kz)" type="number"
        name="precoVenda3" value={values.precoVenda3 ?? ''}
        onChange={handleChange}
        sx={{ gridColumn: "span 2" }} />

      <TextField fullWidth variant="filled" label="Quantidade em Stock" type="number"
        name="quantidade" value={values.quantidade ?? 0}
        onBlur={handleBlur} onChange={handleChange}
        error={!!touched.quantidade && !!errors.quantidade}
        helperText={touched.quantidade && errors.quantidade}
        sx={{ gridColumn: "span 4" }} />
    </Box>
  );

  return (
    <Box>
      {/* FORMULÁRIO ADICIONAR */}
      <Box backgroundColor={cores.primary[400]} p="30px" borderRadius="8px" mb="30px">
        <Typography variant="h5" fontWeight="600" mb="20px" color={cores.grey[100]}>
          <InventoryOutlinedIcon sx={{ mr: "8px", verticalAlign: "middle" }} />
          Adicionar Novo Produto
        </Typography>

        <Formik onSubmit={handleAdicionar} initialValues={inicial} validationSchema={schema}>
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <CamposFormulario values={values} errors={errors} touched={touched}
                handleBlur={handleBlur} handleChange={handleChange} isEdit={false} />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt="20px">
                <TextField
                  placeholder="Pesquisar por código ou descrição..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  size="small"
                  sx={{ width: "300px" }}
                />
                <Button type="submit" variant="contained"
                  sx={{ backgroundColor: cores.blueAccent[600], color: cores.grey[100], fontWeight: "bold", padding: "10px 20px" }}>
                  <AddOutlinedIcon sx={{ mr: "8px" }} />
                  Adicionar Produto
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
          localeText={{ noRowsLabel: "Nenhum produto registado ainda." }} />
      </Box>

      {/* MODAL EDIÇÃO */}
      <Dialog open={modal} onClose={() => setModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: cores.primary[400], color: cores.grey[100] }}>
          <EditOutlinedIcon sx={{ mr: "8px", verticalAlign: "middle" }} />
          Editar Produto
        </DialogTitle>

        {editing && (
          <Formik
            onSubmit={handleEditar}
            initialValues={{
              codigo:      editing.codigo      ?? '',
              descricao:   editing.descricao   ?? '',
              descricao3:  editing.descricao3  ?? '',
              unidadeBase: editing.unidadeBase ?? '',
              preco:       editing.preco       ?? '',
              precoVenda1: editing.precoVenda1 ?? '',
              precoVenda2: editing.precoVenda2 ?? '',
              precoVenda3: editing.precoVenda3 ?? '',
              quantidade:  editing.quantidade  ?? 0,
            }}
            validationSchema={schemaEdicao}
          >
            {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <DialogContent sx={{ backgroundColor: cores.primary[400] }}>
                  <CamposFormulario values={values} errors={errors} touched={touched}
                    handleBlur={handleBlur} handleChange={handleChange} isEdit={true} />
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

export default Inventario;