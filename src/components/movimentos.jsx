import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
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

import { getMovimentos, createMovimento, getInventario } from "../services/api"

const empty = {
  tipoMovimento: "ENTRADA",
  inventarioId: "",
  quantidade: 1,
  documentoRef: "",
  preco: "",
};

const tipos = ["ENTRADA", "SAIDA", "TRANSFERENCIA", "AJUSTE"];

const Movimentos= () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [data, setData] = useState([]);
  const [inv, setInv] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const [filter, setFilter] = useState("TODOS");

  const load = async () => {
    setLoading(true);

    const [m, i] = await Promise.allSettled([
      getMovimentos(),
      getInventario(),
    ]);

    setData(m.status === "fulfilled" ? m.value ?? [] : []);
    setInv(i.status === "fulfilled" ? i.value ?? [] : []);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await createMovimento(form);
      setModal(false);
      await load();
    } catch (e) {
      alert(e?.response?.data?.mensagem ?? "Erro");
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const filtered =
    filter === "TODOS"
      ? data
      : data.filter((d) => d.tipoMovimento === filter);

  const totalEntradas = data
    .filter((d) => d.tipoMovimento === "ENTRADA")
    .reduce((s, d) => s + d.quantidade, 0);

  const totalSaidas = data
    .filter((d) => d.tipoMovimento === "SAIDA")
    .reduce((s, d) => s + d.quantidade, 0);

  const colunas = [
    {
      field: "idMovimento",
      headerName: "ID",
      flex: 0.4,
    },
    {
      field: "tipoMovimento",
      headerName: "Tipo",
      flex: 1,
    },
    {
      field: "inventarioDescricao",
      headerName: "Produto",
      flex: 1,
      valueGetter: (params) =>
        params.row.inventarioDescricao ??
        params.row.inventarioCodigo ??
        "—",
    },
    {
      field: "quantidade",
      headerName: "Qtd",
      flex: 0.6,
    },
    {
      field: "preco",
      headerName: "Preço",
      flex: 1,
      valueGetter: (params) =>
        params.row.preco
          ? `${Number(params.row.preco).toLocaleString("pt-AO")} Kz`
          : "—",
    },
    {
      field: "documentoRef",
      headerName: "Ref. Doc.",
      flex: 1,
    },
    {
      field: "dataMovimento",
      headerName: "Data",
      flex: 1,
      valueGetter: (params) =>
        params.row.dataMovimento
          ? new Date(params.row.dataMovimento).toLocaleDateString("pt-AO")
          : "—",
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="MOVIMENTOS"
        subtitle={`${data.length} registos · ↑ ${totalEntradas} entradas · ↓ ${totalSaidas} saídas`}
      />

      {/* FILTROS */}
      <Box display="flex" gap="10px" mb="15px">
        {["TODOS", "ENTRADA", "SAIDA", "TRANSFERENCIA"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "contained" : "outlined"}
            onClick={() => setFilter(f)}
            sx={{
              backgroundColor:
                filter === f ? cores.blueAccent[600] : "transparent",
            }}
          >
            {f}
          </Button>
        ))}
      </Box>

      {/* TABELA */}
      <Box
        height="60vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: cores.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: cores.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: cores.blueAccent[700],
            borderTop: "none",
          },
        }}
      >
        <DataGrid
          rows={filtered}
          getRowId={(row) => row.idMovimento}
          columns={colunas}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      {/* BOTÃO */}
      <Box mt="15px">
        <Button
          variant="contained"
          onClick={() => {
            setForm(empty);
            setModal(true);
          }}
          sx={{ backgroundColor: cores.greenAccent[600] }}
        >
          Registar Movimento
        </Button>
      </Box>

      {/* MODAL */}
      <Dialog open={modal} onClose={() => setModal(false)} fullWidth>
        <DialogTitle>Registar Movimento</DialogTitle>

        <DialogContent>
          <TextField
            select
            fullWidth
            label="Tipo"
            value={form.tipoMovimento}
            onChange={set("tipoMovimento")}
            margin="normal"
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
            label="Produto"
            value={form.inventarioId}
            onChange={set("inventarioId")}
            margin="normal"
          >
            <MenuItem value="">Selecionar</MenuItem>
            {inv.map((i) => (
              <MenuItem key={i.id} value={i.id}>
                [{i.codigo}] {i.descricao}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="number"
            label="Quantidade"
            value={form.quantidade}
            onChange={set("quantidade")}
            margin="normal"
          />

          <TextField
            fullWidth
            type="number"
            label="Preço"
            value={form.preco}
            onChange={set("preco")}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Referência"
            value={form.documentoRef}
            onChange={set("documentoRef")}
            margin="normal"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModal(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "A guardar..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Movimentos;