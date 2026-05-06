import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Formik } from "formik";
import * as yup from "yup";
import { tokens }   from "../theme"         
import Header        from "./Header"

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// 🔥 API
import {
  getInventario,
  createInventario,
  updateInventario,
  deleteInventario,
} from "../services/api";

// 🔥 validação
const schema = yup.object().shape({
  codigo: yup.string().required("Obrigatório"),
  descricao: yup.string().required("Obrigatório"),
  unidadeBase: yup.string().required("Obrigatório"),
  preco: yup.number().required("Obrigatório"),
  precoVenda1: yup.number().required("Obrigatório"),
  quantidade: yup.number().required("Obrigatório"),
});

const inicial = {
  codigo: "",
  descricao: "",
  unidadeBase: "",
  preco: "",
  precoVenda1: "",
  quantidade: 0,
};

const Inventario = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const [search, setSearch] = useState("");

  // 🔥 carregar dados
  const load = async () => {
    try {
      setLoading(true);
      const data = await getInventario();

      const formatado = (data ?? []).map((d) => ({
        id: d.id,
        ...d,
      }));

      setDados(formatado);
    } catch (e) {
      console.error("Erro ao carregar inventário", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ➕ criar
  const handleAdicionar = async (values, { resetForm }) => {
    try {
      await createInventario(values);
      await load();
      resetForm();
      setModal(false);
    } catch (e) {
      alert("Erro ao criar produto");
    }
  };

  // ✏️ editar
  const handleEditar = async (values) => {
    try {
      await updateInventario(editing.id, values);
      await load();
      setModal(false);
    } catch (e) {
      alert("Erro ao atualizar");
    }
  };

  // ❌ eliminar
  const handleEliminar = async (id) => {
    if (!window.confirm("Remover produto?")) return;

    try {
      await deleteInventario(id);
      await load();
    } catch (e) {
      alert("Erro ao eliminar");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModal(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModal(true);
  };

  // 🔎 filtro
  const filtrado = dados.filter(
    (d) =>
      d.descricao?.toLowerCase().includes(search.toLowerCase()) ||
      d.codigo?.toLowerCase().includes(search.toLowerCase())
  );

  // 📊 colunas
  const colunas = [
    { field: "codigo", headerName: "Código", flex: 1 },
    { field: "descricao", headerName: "Descrição", flex: 2 },
    { field: "unidadeBase", headerName: "Unidade", flex: 1 },
    {
      field: "preco",
      headerName: "Preço",
      flex: 1,
      renderCell: ({ row }) =>
        row.preco ? `${Number(row.preco).toLocaleString()} Kz` : "—",
    },
    {
      field: "quantidade",
      headerName: "Stock",
      flex: 1,
      renderCell: ({ row }) => {
        if (row.quantidade === 0) return "Sem stock";
        if (row.quantidade < 5) return "Baixo";
        return row.quantidade;
      },
    },
    {
      field: "acoes",
      headerName: "Ações",
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" gap="8px">
          <Button
            size="small"
            variant="contained"
            onClick={() => openEdit(row)}
            sx={{ backgroundColor: cores.blueAccent[600] }}
          >
            <EditIcon />
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={() => handleEliminar(row.id)}
            sx={{ backgroundColor: cores.redAccent[600] }}
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
        title="Inventário"
        subtitle={`${dados.length} produtos`}
      />

      {/* 🔎 pesquisa + botão */}
      <Box display="flex" justifyContent="space-between" mb="15px">
        <TextField
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Button
          variant="contained"
          onClick={openCreate}
          sx={{ backgroundColor: cores.blueAccent[600] }}
        >
          <AddIcon sx={{ mr: 1 }} />
          Novo Produto
        </Button>
      </Box>

      {/* 📊 tabela */}
      <Box height="60vh">
        <DataGrid
          rows={filtrado}
          columns={colunas}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      {/* 🧾 modal */}
      <Dialog open={modal} onClose={() => setModal(false)} fullWidth>
        <DialogTitle>
          {editing ? "Editar Produto" : "Novo Produto"}
        </DialogTitle>

        <Formik
          initialValues={editing || inicial}
          validationSchema={schema}
          onSubmit={editing ? handleEditar : handleAdicionar}
        >
          {({ values, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <DialogContent>
                <TextField
                  fullWidth
                  label="Código"
                  name="codigo"
                  value={values.codigo}
                  onChange={handleChange}
                  margin="dense"
                  disabled={!!editing}
                />

                <TextField
                  fullWidth
                  label="Descrição"
                  name="descricao"
                  value={values.descricao}
                  onChange={handleChange}
                  margin="dense"
                />

                <TextField
                  fullWidth
                  label="Unidade"
                  name="unidadeBase"
                  value={values.unidadeBase}
                  onChange={handleChange}
                  margin="dense"
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Preço"
                  name="preco"
                  value={values.preco}
                  onChange={handleChange}
                  margin="dense"
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Preço Venda"
                  name="precoVenda1"
                  value={values.precoVenda1}
                  onChange={handleChange}
                  margin="dense"
                />

                <TextField
                  fullWidth
                  type="number"
                  label="Quantidade"
                  name="quantidade"
                  value={values.quantidade}
                  onChange={handleChange}
                  margin="dense"
                />
              </DialogContent>

              <DialogActions>
                <Button onClick={() => setModal(false)}>Cancelar</Button>
                <Button type="submit" variant="contained">
                  Guardar
                </Button>
              </DialogActions>
            </form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default Inventario;