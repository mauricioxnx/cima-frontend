import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";

// 🔥 API
import { getHistorico } from "../../services/api";

const Historico = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 🔥 carregar dados
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getHistorico();

        // garantir id
        const formatado = (data ?? []).map((d) => ({
          id: d.id,
          ...d,
        }));

        setDados(formatado);
      } catch (e) {
        console.error("Erro ao carregar histórico", e);
        setDados([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 🔎 filtro
  const filtrado = dados.filter(
    (d) =>
      d.descricao?.toLowerCase().includes(search.toLowerCase()) ||
      d.utilizadorNome?.toLowerCase().includes(search.toLowerCase())
  );

  // 📊 colunas
  const colunas = [
    {
      field: "id",
      headerName: "#",
      width: 70,
    },
    {
      field: "descricao",
      headerName: "Actividade",
      flex: 2,
    },
    {
      field: "utilizadorNome",
      headerName: "Utilizador",
      flex: 1,
      renderCell: ({ row }) => row.utilizadorNome ?? "—",
    },
    {
      field: "inventarioId",
      headerName: "Inventário",
      flex: 1,
      renderCell: ({ row }) =>
        row.inventarioId ? `#${row.inventarioId}` : "—",
    },
    {
      field: "manutencaoId",
      headerName: "Manutenção",
      flex: 1,
      renderCell: ({ row }) =>
        row.manutencaoId ? `#${row.manutencaoId}` : "—",
    },
    {
      field: "dataExecucao",
      headerName: "Data / Hora",
      flex: 1.5,
      renderCell: ({ row }) =>
        row.dataExecucao
          ? new Date(row.dataExecucao).toLocaleString("pt-PT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
    },
  ];

  return (
    <Box m="20px">
      <Header
        title="Histórico"
        subtitle={`${dados.length} registos`}
      />

      {/* 🔎 pesquisa */}
      <Box mb="15px">
        <TextField
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* 📊 tabela */}
      <Box
        height="70vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: cores.blueAccent[700],
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: cores.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: cores.blueAccent[700],
          },
        }}
      >
        <DataGrid
          rows={filtrado}
          columns={colunas}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
          localeText={{
            noRowsLabel: "Nenhuma actividade registada",
          }}
        />
      </Box>
    </Box>
  );
};

export default Historico;