import { useEffect, useState } from "react";
import {
  Box, Typography, useTheme, Button, CircularProgress
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";

import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import AlertTriangleIcon from "@mui/icons-material/WarningAmberOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

import {
  getDashboard, getMovimentos,
  getAtrasadas, getProximas
} from "../../services/api";

const ESTADO_CORES = {
  PENDENTE:  '#ffc84d',
  EM_CURSO:  '#4d9fff',
  CONCLUIDA: '#4dffa3',
  CANCELADA: '#4e535d',
}

const Painel = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [dash, setDash]           = useState(null);
  const [recentes, setRecentes]   = useState([]);
  const [atrasadas, setAtrasadas] = useState([]);
  const [proximas, setProximas]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getDashboard(),
      getMovimentos(),
      getAtrasadas(),
      getProximas(7),
    ]).then(([d, mov, atr, prox]) => {
      if (d.status    === 'fulfilled') setDash(d.value)
      if (mov.status  === 'fulfilled') setRecentes((mov.value ?? []).slice(0, 6))
      if (atr.status  === 'fulfilled') setAtrasadas(atr.value ?? [])
      if (prox.status === 'fulfilled') setProximas(prox.value ?? [])
    }).finally(() => setLoading(false))
  }, []);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
      <CircularProgress />
    </Box>
  );

  const eficiencia = dash?.totalManutencoesAtivas > 0
    ? Math.min(((dash.manutencoesConcluidas / dash.totalManutencoesAtivas) * 100), 100).toFixed(0)
    : 0;

  const pieData = dash?.manutencoesPorEstado
    ? Object.entries(dash.manutencoesPorEstado).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <Box m="20px">

      {/* CABEÇALHO */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle={`actualizado · ${new Date().toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}`} />
        <Button sx={{
          backgroundColor: cores.blueAccent[700], color: cores.grey[100],
          fontWeight: "bold", padding: "10px 20px",
        }}>
          <DownloadOutlinedIcon sx={{ mr: "10px" }} />
          Descarregar Relatórios
        </Button>
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gridAutoRows="140px" gap="20px">

        {/* ── KPI BOXES ── */}
        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox title={dash?.totalUtilizadores ?? 0} subtitle="Utilizadores"
            progress="0.70" increase="" icon={<PeopleOutlinedIcon sx={{ color: cores.greenAccent[600], fontSize: "26px" }} />} />
        </Box>

        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox title={dash?.totalInventario ?? 0} subtitle="Itens em Stock"
            progress="0.55" increase="" icon={<InventoryOutlinedIcon sx={{ color: cores.greenAccent[600], fontSize: "26px" }} />} />
        </Box>

        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox title={dash?.totalFornecedores ?? 0} subtitle="Fornecedores"
            progress="0.40" increase="" icon={<LocalShippingOutlinedIcon sx={{ color: cores.greenAccent[600], fontSize: "26px" }} />} />
        </Box>

        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox title={dash?.totalManutencoesAtivas ?? 0} subtitle="Manutenções Activas"
            progress="0.75" increase="" icon={<BuildOutlinedIcon sx={{ color: cores.greenAccent[600], fontSize: "26px" }} />} />
        </Box>

        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox title={dash?.totalTarefasAbertas ?? 0} subtitle="Tarefas Abertas"
            progress="0.45" increase="" icon={<AssignmentOutlinedIcon sx={{ color: cores.greenAccent[600], fontSize: "26px" }} />} />
        </Box>

        <Box gridColumn="span 2" backgroundColor={cores.primary[400]} display="flex" alignItems="center" justifyContent="center">
          <StatBox title={dash?.itensEstoqueBaixo ?? 0} subtitle="Stock Baixo"
            progress="0.20" increase="" icon={<WarningAmberOutlinedIcon sx={{ color: "#f0a500", fontSize: "26px" }} />} />
        </Box>

        {/* ── PROGRESSO + RESUMO ESTADOS ── */}
        <Box gridColumn="span 4" gridRow="span 2" backgroundColor={cores.primary[400]} p="25px">
          <Typography variant="h5" color={cores.grey[100]} mb="15px" fontWeight="600">
            Taxa de Conclusão
          </Typography>
          <Box display="flex" flexDirection="column" alignItems="center" mt="10px">
            <ProgressCircle size="120" progress={eficiencia / 100} />
            <Typography color={cores.greenAccent[500]} mt="15px" variant="h4" fontWeight="bold">
              {eficiencia}%
            </Typography>
            <Typography color={cores.grey[300]} fontSize="12px">manutenções concluídas</Typography>
          </Box>
          <Box mt="20px" display="flex" flexDirection="column" gap="10px">
            {[
              { label: 'Pendentes',       value: dash?.manutencoesPendentes ?? 0,  cor: '#ffc84d' },
              { label: 'Em curso',        value: dash?.manutencoesEmCurso   ?? 0,  cor: '#4d9fff' },
              { label: 'Concluídas',      value: dash?.manutencoesConcluidas ?? 0, cor: cores.greenAccent[500] },
              { label: 'Stock zero',      value: dash?.itensStockZero        ?? 0, cor: cores.redAccent[400] },
              { label: 'Movimentos hoje', value: dash?.totalMovimentosHoje   ?? 0, cor: cores.grey[100] },
            ].map((item, i) => (
              <Box key={i} display="flex" justifyContent="space-between">
                <Typography color={cores.grey[300]} fontSize="13px">{item.label}</Typography>
                <Typography color={item.cor} fontWeight="bold">{item.value}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── ESTADOS MANUTENÇÕES ── */}
        <Box gridColumn="span 4" gridRow="span 2" backgroundColor={cores.primary[400]} p="25px">
          <Typography variant="h5" color={cores.grey[100]} mb="20px" fontWeight="600">
            Manutenções por Estado
          </Typography>
          <Box display="flex" flexDirection="column" gap="12px">
            {pieData.length === 0 ? (
              <Typography color={cores.grey[400]} fontSize="13px">Sem dados disponíveis.</Typography>
            ) : pieData.map((item, i) => (
              <Box key={i}>
                <Box display="flex" justifyContent="space-between" mb="4px">
                  <Box display="flex" alignItems="center" gap="8px">
                    <Box width="10px" height="10px" borderRadius="50%"
                      sx={{ background: ESTADO_CORES[item.name] ?? cores.grey[400] }} />
                    <Typography color={cores.grey[200]} fontSize="13px">
                      {item.name.replace('_', ' ')}
                    </Typography>
                  </Box>
                  <Typography color={cores.grey[100]} fontWeight="bold" fontSize="13px">
                    {item.value}
                  </Typography>
                </Box>
                <Box height="6px" borderRadius="3px" sx={{ background: cores.primary[300] }}>
                  <Box height="100%" borderRadius="3px" sx={{
                    background: ESTADO_CORES[item.name] ?? cores.grey[400],
                    width: `${Math.min((item.value / (dash?.totalManutencoesAtivas || 1)) * 100, 100)}%`,
                    transition: 'width 0.5s ease'
                  }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── MOVIMENTOS RECENTES ── */}
        <Box gridColumn="span 4" gridRow="span 2" backgroundColor={cores.primary[400]} overflow="auto">
          <Box p="15px 20px" borderBottom={`1px solid ${cores.primary[500]}`}>
            <Typography variant="h5" color={cores.grey[100]} fontWeight="600">
              Movimentos Recentes
            </Typography>
          </Box>
          {recentes.length === 0 ? (
            <Typography p="20px" color={cores.grey[300]}>Sem movimentos recentes.</Typography>
          ) : recentes.map((item, i) => (
            <Box key={i} p="12px 20px" borderBottom={`1px solid ${cores.primary[500]}`}
              display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography color={cores.grey[100]} fontSize="13px">
                  {item.inventarioDescricao ?? item.descricao ?? "Movimento"}
                </Typography>
                <Typography color={cores.grey[400]} fontSize="11px">
                  {item.dataMovimento ? new Date(item.dataMovimento).toLocaleDateString('pt-PT') : "-"}
                </Typography>
              </Box>
              <Box px="8px" py="2px" borderRadius="4px"
                sx={{ background: item.tipoMovimento === 'ENTRADA' ? cores.greenAccent[700] : cores.redAccent[700] }}>
                <Typography fontSize="11px" color={cores.grey[100]}>{item.tipoMovimento}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── MANUTENÇÕES EM ATRASO ── */}
        <Box gridColumn="span 6" gridRow="span 2" backgroundColor={cores.primary[400]} overflow="auto">
          <Box p="15px 20px" borderBottom={`1px solid ${cores.primary[500]}`}
            display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" color={cores.grey[100]} fontWeight="600">Manutenções em Atraso</Typography>
              <Typography color={cores.grey[400]} fontSize="12px">{atrasadas.length} pendentes</Typography>
            </Box>
            <Box px="10px" py="3px" borderRadius="4px" sx={{ background: cores.redAccent[700] }}>
              <Typography fontSize="11px" color={cores.grey[100]} fontWeight="bold">URGENTE</Typography>
            </Box>
          </Box>
          {atrasadas.length === 0 ? (
            <Box p="20px" display="flex" alignItems="center" gap="8px">
              <AlertTriangleIcon sx={{ color: cores.grey[400], fontSize: "20px" }} />
              <Typography color={cores.grey[400]} fontSize="13px">Nenhuma manutenção em atraso</Typography>
            </Box>
          ) : atrasadas.slice(0, 5).map((m, i) => (
            <Box key={i} p="12px 20px" borderBottom={`1px solid ${cores.primary[500]}`}
              display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap="12px">
                <Box width="8px" height="8px" borderRadius="50%" sx={{ background: '#ff5f5f' }} />
                <Box>
                  <Typography color={cores.grey[100]} fontSize="13px">
                    {m.descricao ?? `Manutenção #${m.id}`}
                  </Typography>
                  <Typography color={cores.grey[400]} fontSize="11px">
                    {m.dataAgendada} · {m.utilizadorNome ?? '—'}
                  </Typography>
                </Box>
              </Box>
              <Box px="8px" py="2px" borderRadius="4px" sx={{ background: cores.redAccent[700] }}>
                <Typography fontSize="11px" color={cores.grey[100]}>{m.estado}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* ── PRÓXIMOS AGENDAMENTOS ── */}
        <Box gridColumn="span 6" gridRow="span 2" backgroundColor={cores.primary[400]} overflow="auto">
          <Box p="15px 20px" borderBottom={`1px solid ${cores.primary[500]}`}
            display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" color={cores.grey[100]} fontWeight="600">Próximos Agendamentos</Typography>
              <Typography color={cores.grey[400]} fontSize="12px">próximos 7 dias</Typography>
            </Box>
            <Box px="10px" py="3px" borderRadius="4px" sx={{ background: cores.blueAccent[700] }}>
              <Typography fontSize="11px" color={cores.grey[100]} fontWeight="bold">AGENDA</Typography>
            </Box>
          </Box>
          {proximas.length === 0 ? (
            <Box p="20px" display="flex" alignItems="center" gap="8px">
              <CalendarTodayOutlinedIcon sx={{ color: cores.grey[400], fontSize: "20px" }} />
              <Typography color={cores.grey[400]} fontSize="13px">Sem agendamentos próximos</Typography>
            </Box>
          ) : proximas.slice(0, 5).map((m, i) => (
            <Box key={i} p="12px 20px" borderBottom={`1px solid ${cores.primary[500]}`}
              display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap="12px">
                <Box width="8px" height="8px" borderRadius="50%" sx={{ background: '#4d9fff' }} />
                <Box>
                  <Typography color={cores.grey[100]} fontSize="13px">
                    {m.descricao ?? `Manutenção #${m.id}`}
                  </Typography>
                  <Typography color={cores.grey[400]} fontSize="11px">
                    {m.dataAgendada} · {m.tipoManutencaoNome ?? '—'}
                  </Typography>
                </Box>
              </Box>
              <Box px="8px" py="2px" borderRadius="4px" sx={{ background: cores.blueAccent[700] }}>
                <Typography fontSize="11px" color={cores.grey[100]}>{m.estado}</Typography>
              </Box>
            </Box>
          ))}
        </Box>

      </Box>
    </Box>
  );
};

export default Painel;