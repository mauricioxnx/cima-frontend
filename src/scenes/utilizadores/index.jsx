import { useState, useEffect } from "react";
import {
  Box, Button, TextField, useTheme, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {
  getUtilizadores, createUtilizador,
  updateUtilizador, desativarUtilizador, getPerfis
} from "../../services/api";

const telefoneRegExp = /^[+]?[\d\s\-().]{7,20}$/;

const validacaoFormulario = yup.object().shape({
  nome:     yup.string().min(3, "Mínimo 3 caracteres").required("Obrigatório"),
  email:    yup.string().email("Email inválido").required("Obrigatório"),
  senha:    yup.string().min(6, "Mínimo 6 caracteres").required("Obrigatório"),
  telefone: yup.string().matches(telefoneRegExp, "Número inválido"),
  endereco: yup.string(),
  perfilId: yup.number().required("Obrigatório"),
});

const validacaoEdicao = yup.object().shape({
  nome:     yup.string().min(3).required("Obrigatório"),
  email:    yup.string().email("Email inválido").required("Obrigatório"),
  senha:    yup.string().min(6, "Mínimo 6 caracteres"),
  telefone: yup.string().matches(telefoneRegExp, "Número inválido"),
  endereco: yup.string(),
  perfilId: yup.number().required("Obrigatório"),
});

const valoresIniciais = {
  nome: "", email: "", senha: "",
  telefone: "", endereco: "", perfilId: "",
};

const Equipa = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);
  const isNaoMobile = useMediaQuery("(min-width:600px)");

  const [utilizadores, setUtilizadores] = useState([]);
  const [perfis, setPerfis]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modalAberto, setModalAberto]   = useState(false);
  const [utilizadorEditar, setUtilizadorEditar] = useState(null);

  const carregarUtilizadores = async () => {
    try {
      setLoading(true);
      const [data, listaPerfis] = await Promise.all([
        getUtilizadores(),
        getPerfis()
      ]);
      const formatado = (data ?? []).map(u => ({
        id:         u.id         ?? 0,
        nome:       u.nome       ?? '',
        email:      u.email      ?? '',
        telefone:   u.telefone   ?? '',
        endereco:   u.endereco   ?? '',
        perfilId:   u.perfilId   ?? '',
        perfilNome: u.perfilNome ?? '',
        ativo:      u.ativo      ?? true,
      }));
      setUtilizadores(formatado);
      setPerfis(listaPerfis ?? []);
    } catch(e) {
      console.error("Erro ao buscar utilizadores", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarUtilizadores(); }, []);

  const handleAdicionar = async (valores, { resetForm }) => {
    try {
      await createUtilizador({
        nome:     valores.nome,
        email:    valores.email,
        senha:    valores.senha,
        telefone: valores.telefone,
        endereco: valores.endereco,
        perfilId: Number(valores.perfilId),
      });
      await carregarUtilizadores();
      resetForm();
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao criar utilizador");
    }
  };

  const handleAbrirEditar = (utilizador) => {
    setUtilizadorEditar(utilizador);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setUtilizadorEditar(null);
  };

  const handleGuardarEdicao = async (valores) => {
    try {
      await updateUtilizador(utilizadorEditar.id, {
        nome:     valores.nome,
        email:    valores.email,
        telefone: valores.telefone,
        endereco: valores.endereco,
        perfilId: Number(valores.perfilId),
        ...(valores.senha ? { senha: valores.senha } : {}),
      });
      await carregarUtilizadores();
      handleFecharModal();
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao atualizar utilizador");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('Desativar utilizador?')) return;
    try {
      await desativarUtilizador(id);
      await carregarUtilizadores();
    } catch(e) {
      alert("Erro ao desativar utilizador");
    }
  };

  const colunas = [
    { field: "id",         headerName: "ID",       flex: 0.3 },
    { field: "nome",       headerName: "Nome",     flex: 1, cellClassName: "name-column--cell" },
    { field: "email",      headerName: "Email",    flex: 1 },
    { field: "telefone",   headerName: "Telefone", flex: 1 },
    { field: "endereco",   headerName: "Morada",   flex: 1 },
    { field: "perfilNome", headerName: "Perfil",   flex: 1 },
    {
      field: "acoes", headerName: "Ações", flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" gap="10px" alignItems="center" height="100%">
          <Button variant="contained" size="small"
            sx={{ backgroundColor: cores.blueAccent[600], minWidth: "36px", padding: "4px 8px" }}
            onClick={() => handleAbrirEditar(row)}>
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

  const SelectPerfil = ({ values, touched, errors, handleBlur, handleChange, gridColumn }) => (
    <TextField
      select
      fullWidth
      variant="filled"
      label="Perfil"
      name="perfilId"
      value={values.perfilId ?? ''}
      onBlur={handleBlur}
      onChange={handleChange}
      error={!!touched.perfilId && !!errors.perfilId}
      helperText={touched.perfilId && errors.perfilId}
      sx={{ gridColumn }}
    >
      {perfis.map(p => (
        <MenuItem key={p.id} value={p.id}>
          {p.nome}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Box m="20px">
      <Header title="EQUIPA" subtitle="Gestão de Utilizadores do Sistema C.I.M.A" />

      {/* FORMULÁRIO ADICIONAR */}
      <Box backgroundColor={cores.primary[400]} p="30px" borderRadius="8px" mb="30px">
        <Typography variant="h5" fontWeight="600" mb="20px" color={cores.grey[100]}>
          <PersonAddOutlinedIcon sx={{ mr: "8px", verticalAlign: "middle" }} />
          Adicionar Novo Utilizador
        </Typography>

        <Formik onSubmit={handleAdicionar} initialValues={valoresIniciais} validationSchema={validacaoFormulario}>
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <Box display="grid" gap="20px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{ "& > div": { gridColumn: isNaoMobile ? undefined : "span 4" } }}>

                <TextField fullWidth variant="filled" label="Nome completo"
                  name="nome" value={values.nome ?? ''}
                  onBlur={handleBlur} onChange={handleChange}
                  error={!!touched.nome && !!errors.nome}
                  helperText={touched.nome && errors.nome}
                  sx={{ gridColumn: "span 4" }} />

                <TextField fullWidth variant="filled" label="Email"
                  name="email" value={values.email ?? ''}
                  onBlur={handleBlur} onChange={handleChange}
                  error={!!touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                  sx={{ gridColumn: "span 2" }} />

                <TextField fullWidth variant="filled" label="Senha" type="password"
                  name="senha" value={values.senha ?? ''}
                  onBlur={handleBlur} onChange={handleChange}
                  error={!!touched.senha && !!errors.senha}
                  helperText={touched.senha && errors.senha}
                  sx={{ gridColumn: "span 2" }} />

                <TextField fullWidth variant="filled" label="Número de Telefone"
                  name="telefone" value={values.telefone ?? ''}
                  onBlur={handleBlur} onChange={handleChange}
                  error={!!touched.telefone && !!errors.telefone}
                  helperText={touched.telefone && errors.telefone}
                  sx={{ gridColumn: "span 2" }} />

                <TextField fullWidth variant="filled" label="Morada"
                  name="endereco" value={values.endereco ?? ''}
                  onBlur={handleBlur} onChange={handleChange}
                  error={!!touched.endereco && !!errors.endereco}
                  helperText={touched.endereco && errors.endereco}
                  sx={{ gridColumn: "span 2" }} />

                <SelectPerfil
                  values={values} touched={touched} errors={errors}
                  handleBlur={handleBlur} handleChange={handleChange}
                  gridColumn="span 4" />
              </Box>

              <Box display="flex" justifyContent="end" mt="20px">
                <Button type="submit" variant="contained"
                  sx={{ backgroundColor: cores.blueAccent[600], color: cores.grey[100], fontWeight: "bold", padding: "10px 20px" }}>
                  <PersonAddOutlinedIcon sx={{ mr: "8px" }} />
                  Adicionar Utilizador
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
        <DataGrid rows={utilizadores} columns={colunas} loading={loading}
          components={{ Toolbar: GridToolbar }}
          localeText={{ noRowsLabel: "Nenhum utilizador adicionado ainda." }} />
      </Box>

      {/* MODAL EDIÇÃO */}
      <Dialog open={modalAberto} onClose={handleFecharModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ backgroundColor: cores.primary[400], color: cores.grey[100] }}>
          <EditOutlinedIcon sx={{ mr: "8px", verticalAlign: "middle" }} />
          Editar Utilizador
        </DialogTitle>

        {utilizadorEditar && (
          <Formik
            onSubmit={handleGuardarEdicao}
            initialValues={{
              nome:     utilizadorEditar.nome     ?? '',
              email:    utilizadorEditar.email    ?? '',
              senha:    '',
              telefone: utilizadorEditar.telefone ?? '',
              endereco: utilizadorEditar.endereco ?? '',
              perfilId: utilizadorEditar.perfilId ?? '',
            }}
            validationSchema={validacaoEdicao}
          >
            {({ values, errors, touched, handleBlur, handleChange, handleSubmit }) => (
              <form onSubmit={handleSubmit}>
                <DialogContent sx={{ backgroundColor: cores.primary[400] }}>
                  <Box display="grid" gap="20px"
                    gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                    sx={{ "& > div": { gridColumn: isNaoMobile ? undefined : "span 4" } }}>

                    <TextField fullWidth variant="filled" label="Nome completo"
                      name="nome" value={values.nome ?? ''}
                      onBlur={handleBlur} onChange={handleChange}
                      error={!!touched.nome && !!errors.nome}
                      helperText={touched.nome && errors.nome}
                      sx={{ gridColumn: "span 4" }} />

                    <TextField fullWidth variant="filled" label="Email"
                      name="email" value={values.email ?? ''}
                      onBlur={handleBlur} onChange={handleChange}
                      error={!!touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                      sx={{ gridColumn: "span 2" }} />

                    <TextField fullWidth variant="filled" label="Nova Senha (opcional)" type="password"
                      name="senha" value={values.senha ?? ''}
                      onBlur={handleBlur} onChange={handleChange}
                      error={!!touched.senha && !!errors.senha}
                      helperText={touched.senha && errors.senha}
                      sx={{ gridColumn: "span 2" }} />

                    <TextField fullWidth variant="filled" label="Número de Telefone"
                      name="telefone" value={values.telefone ?? ''}
                      onBlur={handleBlur} onChange={handleChange}
                      error={!!touched.telefone && !!errors.telefone}
                      helperText={touched.telefone && errors.telefone}
                      sx={{ gridColumn: "span 2" }} />

                    <TextField fullWidth variant="filled" label="Morada"
                      name="endereco" value={values.endereco ?? ''}
                      onBlur={handleBlur} onChange={handleChange}
                      error={!!touched.endereco && !!errors.endereco}
                      helperText={touched.endereco && errors.endereco}
                      sx={{ gridColumn: "span 2" }} />

                    <SelectPerfil
                      values={values} touched={touched} errors={errors}
                      handleBlur={handleBlur} handleChange={handleChange}
                      gridColumn="span 4" />
                  </Box>
                </DialogContent>

                <DialogActions sx={{ backgroundColor: cores.primary[400], p: "15px 20px" }}>
                  <Button onClick={handleFecharModal} variant="outlined"
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

export default Equipa;