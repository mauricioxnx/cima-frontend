import { useEffect, useState } from "react";
import {
  Box, Button, TextField, useTheme,
  Typography, MenuItem,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../theme";
import Header from "./Header";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import { getMovimentos, createMovimento, getInventario } from "../services/api";

const tipos = ["ENTRADA", "SAIDA", "TRANSFERENCIA", "AJUSTE"];

const empty = {
  tipoMovimento: "ENTRADA",
  inventarioId:  "",
  quantidade:    1,
  documentoRef:  "",
  preco:         "",
};

const Movimentos = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);
  const isNaoMobile = useMediaQuery("(min-width:600px)");

  const [data, setData]       = useState([]);
  const [inv, setInv]         = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState(empty);
  const [saving, setSaving]   = useState(false);
  const [filter, setFilter]   = useState("TODOS");
  const [search, setSearch]   = useState("");

  const load = async () => {
    setLoading(true);
    const [m, i] = await Promise.allSettled([
      getMovimentos(),
      getInventario(),
    ]);
    setData(m.status === "fulfilled" ? m.value ?? [] : []);
    setInv(i.status  === "fulfilled" ? i.value  ?? [] : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.inventarioId) return alert("Selecciona um produto.");
    if (!form.quantidade || form.quantidade < 1) return alert("Quantidade inválida.");
    setSaving(true);
    try {
      await createMovimento({
        tipoMovimento: form.tipoMovimento,
        inventarioId:  Number(form.inventarioId),
        quantidade:    Number(form.quantidade),
        documentoRef:  form.documentoRef || null,
        preco:         form.preco ? Number(form.preco) : null,
      });
      setForm(empty);
      await load();
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao registar movimento");
    } finally {
      setSaving(false);
    }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const totalEntradas = data.filter(d => d.tipoMovimento === "ENTRADA").reduce((s, d) => s + (d.quantidade ?? 0), 0);
  const totalSaidas   = data.filter(d => d.tipoMovimento === "SAIDA").reduce((s, d) => s + (d.quantidade ?? 0), 0);

  const COR_TIPO = {
    ENTRADA:       cores.greenAccent[600],
    SAIDA:         cores.redAccent[600],
    TRANSFERENCIA: cores.blueAccent[500],
    AJUSTE:        "#f0a500",
  }

  const filtrado = data
    .filter(d => filter === "TODOS" || d.tipoMovimento === filter)
    .filter(d =>
      d.inventarioDescricao?.toLowerCase().includes(search.toLowerCase()) ||
      d.inventarioCodigo?.toLowerCase().includes(search.toLowerCase()) ||
      d.documentoRef?.toLowerCase().includes(search.toLowerCase())
    );

  const colunas = [
    { field: "idMovimento", headerName: "ID", flex: 0.4 },
    {
      field: "tipoMovimento", headerName: "Tipo", flex: 1,
      renderCell: ({ row }) => (
        <Box px="8px" py="2px" borderRadius="4px"
          sx={{ background: COR_TIPO[row?.tipoMovimento] ?? cores.grey[600] }}>
          <Typography fontSize="11px" color="#fff" fontWeight="bold">
            {row?.tipoMovimento}
          </Typography>
        </Box>
      )
    },
    {
      field: "inventarioDescricao", headerName: "Produto", flex: 1.5,
      renderCell: ({ row }) =>
        row?.inventarioDescricao ?? row?.inventarioCodigo ?? "—",
    },
    { field: "quantidade", headerName: "Qtd", flex: 0.5 },
    {
      field: "preco", headerName: "Preço", flex: 1,
      renderCell: ({ row }) =>
        row?.preco
          ? `${Number(row.preco).toLocaleString("pt-AO")} Kz`
          : "—",
    },
    {
      field: "documentoRef", headerName: "Ref. Doc.", flex: 1,
      renderCell: ({ row }) => row?.documentoRef ?? "—",
    },
    {
      field: "dataMovimento", headerName: "Data", flex: 1,
      renderCell: ({ row }) =>
        row?.dataMovimento
          ? new Date(row.dataMovimento).toLocaleDateString("pt-AO")
          : "—",
    },
  ];

  return (
    <Box>
      {/* FORMULÁRIO REGISTAR */}
      <Box backgroundColor={cores.primary[400]} p="30px" borderRadius="8px" mb="20px">
        <Typography variant="h5" fontWeight="600" mb="20px" color={cores.grey[100]}>
          <SwapHorizOutlinedIcon sx={{ mr: "8px", verticalAlign: "middle" }} />
          Registar Novo Movimento
        </Typography>

        <Box display="grid" gap="20px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{ "& > div": { gridColumn: isNaoMobile ? undefined : "span 4" } }}>

          <TextField select fullWidth variant="outlined" label="Tipo de Movimento"
            value={form.tipoMovimento} onChange={set("tipoMovimento")}
            sx={{ gridColumn: "span 2" }}>
            {tipos.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>

          <TextField select fullWidth variant="outlined" label="Produto"
            value={form.inventarioId} onChange={set("inventarioId")}
            sx={{ gridColumn: "span 2" }}>
            <MenuItem value="">— Seleccionar produto —</MenuItem>
            {inv.map(i => (
              <MenuItem key={i.id} value={i.id}>
                [{i.codigo}] {i.descricao} · Stock: {i.quantidade}
              </MenuItem>
            ))}
          </TextField>

          <TextField fullWidth variant="outlined" label="Quantidade" type="number"
            value={form.quantidade} onChange={set("quantidade")}
            inputProps={{ min: 1 }}
            sx={{ gridColumn: "span 2" }} />

          <TextField fullWidth variant="outlined" label="Preço unitário (Kz)" type="number"
            value={form.preco} onChange={set("preco")}
            sx={{ gridColumn: "span 2" }} />

          <TextField fullWidth variant="outlined" label="Referência do documento"
            value={form.documentoRef} onChange={set("documentoRef")}
            sx={{ gridColumn: "span 4" }} />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt="20px">
          <TextField
            placeholder="Pesquisar por produto ou referência..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            variant="outlined"
            sx={{ width: "300px" }}
          />
          <Box display="flex" gap="10px" alignItems="center">
            {["TODOS", ...tipos].map(f => (
              <Button key={f} size="small"
                variant={filter === f ? "contained" : "outlined"}
                onClick={() => setFilter(f)}
                sx={{
                  backgroundColor: filter === f ? (COR_TIPO[f] ?? cores.blueAccent[600]) : "transparent",
                  borderColor: COR_TIPO[f] ?? cores.blueAccent[600],
                  color: filter === f ? "#fff" : (COR_TIPO[f] ?? cores.blueAccent[400]),
                  fontSize: "11px",
                }}>
                {f}
              </Button>
            ))}
            <Button variant="contained" onClick={handleSave} disabled={saving}
              sx={{ backgroundColor: cores.blueAccent[600], color: cores.grey[100], fontWeight: "bold", padding: "10px 20px" }}>
              <AddOutlinedIcon sx={{ mr: "8px" }} />
              {saving ? "A guardar..." : "Registar"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* RESUMO */}
      <Box display="flex" gap="15px" mb="15px">
        <Box backgroundColor={cores.primary[400]} p="15px" borderRadius="8px" flex={1}
          borderLeft={`4px solid ${cores.greenAccent[500]}`}>
          <Typography color={cores.grey[300]} fontSize="12px">Total Entradas</Typography>
          <Typography color={cores.greenAccent[500]} fontSize="22px" fontWeight="bold">
            {totalEntradas}
          </Typography>
        </Box>
        <Box backgroundColor={cores.primary[400]} p="15px" borderRadius="8px" flex={1}
          borderLeft={`4px solid ${cores.redAccent[500]}`}>
          <Typography color={cores.grey[300]} fontSize="12px">Total Saídas</Typography>
          <Typography color={cores.redAccent[500]} fontSize="22px" fontWeight="bold">
            {totalSaidas}
          </Typography>
        </Box>
        <Box backgroundColor={cores.primary[400]} p="15px" borderRadius="8px" flex={1}
          borderLeft={`4px solid ${cores.blueAccent[400]}`}>
          <Typography color={cores.grey[300]} fontSize="12px">Total Registos</Typography>
          <Typography color={cores.blueAccent[400]} fontSize="22px" fontWeight="bold">
            {data.length}
          </Typography>
        </Box>
      </Box>

      {/* TABELA */}
      <Box height="50vh" sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-cell": { borderBottom: "none" },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: cores.blueAccent[700], borderBottom: "none" },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: cores.primary[400] },
        "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: cores.blueAccent[700] },
        "& .MuiCheckbox-root": { color: `${cores.greenAccent[200]} !important` },
        "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${cores.grey[100]} !important` },
      }}>
        <DataGrid
          rows={filtrado}
          getRowId={row => row.idMovimento}
          columns={colunas}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          localeText={{ noRowsLabel: "Sem movimentos registados." }}
        />
      </Box>
    </Box>
  );
};

export default Movimentos;