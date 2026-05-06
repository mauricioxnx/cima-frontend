import { useEffect, useState } from "react";
import {
  Box, Typography, useTheme, Button, IconButton, CircularProgress
} from "@mui/material";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";

import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

import { getDashboard, getMovimentos } from "../../services/api";

const Painel = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [dash, setDash]       = useState(null);
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashData, movData] = await Promise.all([
          getDashboard(),
          getMovimentos(),
        ]);
        setDash(dashData);
        setRecentes((movData ?? []).slice(0, 6));
      } catch(e) {
        console.error("Erro ao carregar dashboard:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress />
    </Box>
  );

  // ── Dados para gráficos ──────────────────────────────────────────
  const dadosManutencoesEstado = dash?.manutencoesPorEstado
    ? Object.entries(dash.manutencoesPorEstado).map(([name, value]) => ({ name, value }))
    : [];

  const dadosMovimentosTipo = dash?.movimentosPorTipo
    ? Object.entries(dash.movimentosPorTipo).map(([name, value]) => ({ name, value }))
    : [];

  const eficiencia = dash?.totalManutencoesAtivas > 0
    ? Math.min(((dash.manutencoesConcluidas / dash.totalManutencoesAtivas) * 100), 100).toFixed(0)
    : 0;

  const CORES_PIE = [
    cores.greenAccent[500],
    cores.blueAccent[400],
    "#f0a500",
    cores.redAccent[400],
  ];

  return (
    <Box m="20px">
      {/* CABEÇALHO */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Bem-vindo ao sistema C.I.M.A" />
        <Button sx={{
          backgroundColor: cores.blueAccent[700], color: cores.grey[100],
          fontWeight: "bold", padding: "10px 20px",
        }}>
          <DownloadOutlinedIcon sx={{ mr: "10px" }} />
          Descarregar Relatórios
        </Button>
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="140px" gap="20px">

        {/* ── STAT BOXES ── */}
        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dash?.totalUtilizadores ?? 0}
            subtitle="Utilizadores"
            progress="0.70"
            increase=""
            icon={<PeopleOutlinedIcon sx={{ color: cores.greenAccent[600], fontSize: "26px" }} />}
          />
        </Box>

        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dash?.totalInventario ?? 0}
            subtitle="Itens em Stock"
            progress="0.55"
            increase=""
            icon={<InventoryOutlinedIcon sx={{ color: cores.greenAccent[600], fontSize: "26px" }} />}
          />
        </Box>

        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dash?.totalFornecedores ?? 0}
            subtitle="Fornecedores"
            progress="0.40"
            increase=""
            icon={<LocalShippingOutlinedIcon sx={{ color: cores.greenAccent[600], fontSize: "26px" }} />}
          />
        </Box>

        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dash?.totalManutencoesAtivas ?? 0}
            subtitle="Manutenções Activas"
            progress="0.75"
            increase=""
            icon={<BuildOutlinedIcon sx={{ color: cores.greenAccent[600], fontSize: "26px" }} />}
          />
        </Box>

        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dash?.totalTarefasAbertas ?? 0}
            subtitle="Tarefas Abertas"
            progress="0.45"
            increase=""
            icon={<AssignmentOutlinedIcon sx={{ color: cores.greenAccent[600], fontSize: "26px" }} />}
          />
        </Box>

        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox
            title={dash?.itensEstoqueBaixo ?? 0}
            subtitle="Stock Baixo"
            progress="0.20"
            increase=""
            icon={<WarningAmberOutlinedIcon sx={{ color: "#f0a500", fontSize: "26px" }} />}
          />
        </Box>

        {/* ── GRÁFICO BARRAS — MANUTENÇÕES POR ESTADO ── */}
        <Box gridColumn="span 6" gridRow="span 2" backgroundColor={cores.primary[400]} p="20px">
          <Typography variant="h5" color={cores.grey[100]} mb="15px" fontWeight="600">
            Manutenções por Estado
          </Typography>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={dadosManutencoesEstado} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={cores.primary[300]} />
              <XAxis dataKey="name" tick={{ fill: cores.grey[300], fontSize: 11 }} />
              <YAxis tick={{ fill: cores.grey[300], fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: cores.primary[400], border: "none", borderRadius: "8px" }}
                labelStyle={{ color: cores.grey[100] }}
              />
              <Bar dataKey="value" fill={cores.blueAccent[500]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* ── GRÁFICO PIE — MOVIMENTOS POR TIPO ── */}
        <Box gridColumn="span 3" gridRow="span 2" backgroundColor={cores.primary[400]} p="20px">
          <Typography variant="h5" color={cores.grey[100]} mb="15px" fontWeight="600">
            Movimentos por Tipo
          </Typography>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={dadosMovimentosTipo}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {dadosMovimentosTipo.map((_, index) => (
                  <Cell key={index} fill={CORES_PIE[index % CORES_PIE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: cores.primary[400], border: "none", borderRadius: "8px" }}
                labelStyle={{ color: cores.grey[100] }}
              />
              <Legend wrapperStyle={{ color: cores.grey[300], fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        {/* ── PROGRESSO + ALERTAS ── */}
        <Box gridColumn="span 3" gridRow="span 2" backgroundColor={cores.primary[400]} p="25px">
          <Typography variant="h5" color={cores.grey[100]} mb="15px" fontWeight="600">
            Taxa de Conclusão
          </Typography>
          <Box display="flex" flexDirection="column" alignItems="center" mt="10px">
            <ProgressCircle size="120" progress={eficiencia / 100} />
            <Typography color={cores.greenAccent[500]} mt="15px" variant="h4" fontWeight="bold">
              {eficiencia}%
            </Typography>
            <Typography color={cores.grey[300]} fontSize="12px">
              manutenções concluídas
            </Typography>
          </Box>

          <Box mt="20px" display="flex" flexDirection="column" gap="10px">
            <Box display="flex" justifyContent="space-between">
              <Typography color={cores.grey[300]} fontSize="13px">Pendentes</Typography>
              <Typography color="#f0a500" fontWeight="bold">{dash?.manutencoesPendentes ?? 0}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography color={cores.grey[300]} fontSize="13px">Em curso</Typography>
              <Typography color={cores.blueAccent[400]} fontWeight="bold">{dash?.manutencoesEmCurso ?? 0}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography color={cores.grey[300]} fontSize="13px">Concluídas</Typography>
              <Typography color={cores.greenAccent[500]} fontWeight="bold">{dash?.manutencoesConcluidas ?? 0}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography color={cores.grey[300]} fontSize="13px">Stock zero</Typography>
              <Typography color={cores.redAccent[400]} fontWeight="bold">{dash?.itensStockZero ?? 0}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography color={cores.grey[300]} fontSize="13px">Movimentos hoje</Typography>
              <Typography color={cores.grey[100]} fontWeight="bold">{dash?.totalMovimentosHoje ?? 0}</Typography>
            </Box>
          </Box>
        </Box>

        {/* ── MOVIMENTOS RECENTES ── */}
        <Box gridColumn="span 12" gridRow="span 2" backgroundColor={cores.primary[400]} overflow="auto">
          <Box p="15px 20px" borderBottom={`1px solid ${cores.primary[500]}`}>
            <Typography variant="h5" color={cores.grey[100]} fontWeight="600">
              Movimentos Recentes
            </Typography>
          </Box>
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="0">
            {recentes.length === 0 ? (
              <Typography p="20px" color={cores.grey[300]}>Sem movimentos recentes.</Typography>
            ) : recentes.map((item, i) => (
              <Box key={i} p="15px 20px" borderBottom={`1px solid ${cores.primary[500]}`}
                borderRight={i % 3 !== 2 ? `1px solid ${cores.primary[500]}` : "none"}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography color={cores.greenAccent[500]} fontWeight="bold" fontSize="13px">
                    #{item.idMovimento ?? item.id}
                  </Typography>
                  <Box px="8px" py="2px" borderRadius="4px"
                    sx={{ background: item.tipoMovimento === 'ENTRADA' ? cores.greenAccent[700] : cores.redAccent[700] }}>
                    <Typography fontSize="11px" color={cores.grey[100]}>
                      {item.tipoMovimento}
                    </Typography>
                  </Box>
                </Box>
                <Typography color={cores.grey[100]} mt="4px" fontSize="13px">
                  {item.inventarioDescricao ?? item.descricao ?? "Movimento"}
                </Typography>
                <Typography color={cores.grey[400]} fontSize="12px" mt="2px">
                  {item.dataMovimento
                    ? new Date(item.dataMovimento).toLocaleDateString('pt-PT')
                    : "-"}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

      </Box>
    </Box>
  );
};

export default Painel;