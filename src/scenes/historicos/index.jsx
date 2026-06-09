import { useEffect, useState } from "react";
import {
  Box, TextField, Typography, useTheme, Chip,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { getHistorico } from "../../services/api";

const Historico = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [dados, setDados]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getHistorico();
        setDados((data ?? []).map(d => ({ id: d.id, ...d })));
      } catch(e) {
        console.error("Erro ao carregar histórico", e);
        setDados([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtrado = dados.filter(d =>
    d.descricao?.toLowerCase().includes(search.toLowerCase()) ||
    d.utilizadorNome?.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ detecta tipo de acção pela descrição
  const getTipoChip = (descricao) => {
    const d = descricao?.toLowerCase() ?? '';
    if (d.includes('criad') || d.includes('adicionad') || d.includes('registad'))
      return <Chip label="CRIAÇÃO" size="small" sx={{ background: "#4dffa3", color: "#000", fontSize: "10px" }} />
    if (d.includes('atualizad') || d.includes('editad') || d.includes('alterado') || d.includes('estado'))
      return <Chip label="EDIÇÃO" size="small" sx={{ background: "#4d9fff", color: "#000", fontSize: "10px" }} />
    if (d.includes('eliminad') || d.includes('removid') || d.includes('desativad'))
      return <Chip label="REMOÇÃO" size="small" sx={{ background: "#ff5f5f", color: "#fff", fontSize: "10px" }} />
    if (d.includes('login') || d.includes('autenticad') || d.includes('sessão'))
      return <Chip label="ACESSO" size="small" sx={{ background: "#ffc84d", color: "#000", fontSize: "10px" }} />
    return <Chip label="SISTEMA" size="small" sx={{ background: "#9e9e9e", color: "#fff", fontSize: "10px" }} />
  }

  const colunas = [
    { field: "id", headerName: "#", width: 60 },
    {
      field: "tipo", headerName: "Tipo", width: 110,
      renderCell: ({ row }) => getTipoChip(row.descricao),
    },
    {
      field: "descricao", headerName: "Actividade", flex: 2,
      renderCell: ({ row }) => (
        <Typography fontSize="13px" color={cores.grey[100]}>
          {row.descricao}
        </Typography>
      ),
    },
    {
      field: "utilizadorNome", headerName: "Utilizador", flex: 1,
      renderCell: ({ row }) => (
        <Typography fontSize="13px" color={cores.greenAccent[400]}>
          {row.utilizadorNome ?? "—"}
        </Typography>
      ),
    },
    {
      field: "inventarioId", headerName: "Inventário", flex: 0.8,
      renderCell: ({ row }) =>
        row.inventarioId
          ? <Chip label={`#${row.inventarioId}`} size="small" sx={{ background: cores.blueAccent[700], color: cores.grey[100] }} />
          : <Typography color={cores.grey[500]}>—</Typography>,
    },
    {
      field: "manutencaoId", headerName: "Manutenção", flex: 0.8,
      renderCell: ({ row }) =>
        row.manutencaoId
          ? <Chip label={`#${row.manutencaoId}`} size="small" sx={{ background: cores.blueAccent[700], color: cores.grey[100] }} />
          : <Typography color={cores.grey[500]}>—</Typography>,
    },
    {
      field: "dataExecucao", headerName: "Data / Hora", flex: 1.3,
      renderCell: ({ row }) =>
        row.dataExecucao
          ? new Date(row.dataExecucao).toLocaleString("pt-PT", {
              day: "2-digit", month: "2-digit", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })
          : "—",
    },
  ];

  return (
    <Box m="20px">
      <Header title="HISTÓRICO" subtitle={`${dados.length} actividades registadas`} />

      {/* RESUMO */}
      <Box display="flex" gap="15px" mb="20px">
        {[
          { label: "Total",    value: dados.length,                                          cor: cores.blueAccent[400]  },
          { label: "Hoje",     value: dados.filter(d => d.dataExecucao?.startsWith(new Date().toISOString().split('T')[0])).length, cor: cores.greenAccent[400] },
          { label: "Criações", value: dados.filter(d => d.descricao?.toLowerCase().includes('criado') || d.descricao?.toLowerCase().includes('registad')).length, cor: "#4dffa3" },
          { label: "Edições",  value: dados.filter(d => d.descricao?.toLowerCase().includes('atualizad') || d.descricao?.toLowerCase().includes('estado')).length, cor: "#4d9fff" },
          { label: "Remoções", value: dados.filter(d => d.descricao?.toLowerCase().includes('eliminad') || d.descricao?.toLowerCase().includes('desativad')).length, cor: "#ff5f5f" },
        ].map(item => (
          <Box key={item.label} backgroundColor={cores.primary[400]} p="15px"
            borderRadius="8px" flex={1} borderLeft={`4px solid ${item.cor}`}>
            <Typography color={cores.grey[300]} fontSize="12px">{item.label}</Typography>
            <Typography color={item.cor} fontSize="22px" fontWeight="bold">{item.value}</Typography>
          </Box>
        ))}
      </Box>

      {/* PESQUISA */}
      <Box mb="15px">
        <TextField
          placeholder="Pesquisar por actividade ou utilizador..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ width: "350px" }}
        />
      </Box>

      {/* TABELA */}
      <Box height="60vh" sx={{
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
          columns={colunas}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          localeText={{ noRowsLabel: "Nenhuma actividade registada." }}
          initialState={{ sorting: { sortModel: [{ field: "id", sort: "desc" }] } }}
        />
      </Box>
    </Box>
  );
};

export default Historico;