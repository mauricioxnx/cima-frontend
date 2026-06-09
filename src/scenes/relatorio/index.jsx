import { useState } from "react";
import {
  Box, Button, Typography, TextField, useTheme,
  Paper, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import {
  getRelatorioManutencao, getRelatorioMovimentos,
  getRelatorioInventario, getRelatorioUtilizadores,
  getInventario, getManutencoes, getMovimentos, getUtilizadores,
} from "../../services/api";

const COR = {
  inventario:   "#4d9fff",
  utilizadores: "#4dffa3",
  manutencao:   "#ffc84d",
  movimentos:   "#ff7043",
}

const Relatorio = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [activeRel, setActiveRel] = useState(null);
  const [resumo, setResumo]       = useState(null);
  const [registos, setRegistos]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [dates, setDates]         = useState({ inicio: "", fim: "" });

  const runRelatorio = async (type) => {
    setLoading(true);
    setResumo(null);
    setRegistos([]);
    setError(null);
    setActiveRel(type);

    try {
      let resumoData, registosData;

      if (type === "inventario") {
        [resumoData, registosData] = await Promise.all([
          getRelatorioInventario(),
          getInventario(),
        ]);
      }
      if (type === "utilizadores") {
        [resumoData, registosData] = await Promise.all([
          getRelatorioUtilizadores(),
          getUtilizadores(),
        ]);
      }
      if (type === "manutencao") {
        [resumoData, registosData] = await Promise.all([
          getRelatorioManutencao(dates.inicio, dates.fim),
          getManutencoes(),
        ]);
      }
      if (type === "movimentos") {
        [resumoData, registosData] = await Promise.all([
          getRelatorioMovimentos(dates.inicio, dates.fim),
          getMovimentos(),
        ]);
      }

      setResumo(resumoData);
      setRegistos(registosData ?? []);
    } catch(e) {
      setError("Erro ao carregar relatório");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const relatorios = [
    { key: "inventario",   label: "Inventário",   needsDates: false },
    { key: "utilizadores", label: "Utilizadores", needsDates: false },
    { key: "manutencao",   label: "Manutenções",  needsDates: true  },
    { key: "movimentos",   label: "Movimentos",   needsDates: true  },
  ];

  // ── Colunas por tipo ──────────────────────────────────
  const colunasInventario = [
    { key: "codigo",      label: "Código"    },
    { key: "descricao",   label: "Descrição" },
    { key: "unidadeBase", label: "Unidade"   },
    { key: "preco",       label: "Preço (Kz)", render: v => v ? `${Number(v).toLocaleString()} Kz` : "—" },
    { key: "quantidade",  label: "Stock",
      render: (v) => v === 0
        ? <Chip label="Sem stock" size="small" color="error" />
        : v < 5
          ? <Chip label={`Baixo (${v})`} size="small" color="warning" />
          : v
    },
  ];

  const colunasUtilizadores = [
    { key: "id",         label: "ID"      },
    { key: "nome",       label: "Nome"    },
    { key: "email",      label: "Email"   },
    { key: "telefone",   label: "Telefone" },
    { key: "perfilNome", label: "Perfil"  },
    { key: "ativo",      label: "Activo",
      render: v => <Chip label={v ? "Sim" : "Não"} size="small" color={v ? "success" : "default"} />
    },
  ];

  const colunasManutencao = [
    { key: "id",                  label: "ID"        },
    { key: "tipoManutencaoNome",  label: "Tipo",     render: (v, r) => v ?? r.idTipo ?? "—" },
    { key: "descricao",           label: "Descrição" },
    { key: "maquinaVeiculoModelo",label: "Máquina"   },
    { key: "utilizadorNome",      label: "Técnico"   },
    { key: "dataAgendada",        label: "Data"      },
    { key: "estado",              label: "Estado",
      render: v => {
        const cor = { PENDENTE: "warning", EM_CURSO: "info", CONCLUIDA: "success", CANCELADA: "default" }
        return <Chip label={v} size="small" color={cor[v] ?? "default"} />
      }
    },
  ];

  const colunasMovimentos = [
    { key: "idMovimento",          label: "ID"       },
    { key: "tipoMovimento",        label: "Tipo",
      render: v => {
        const cor = { ENTRADA: "#4dffa3", SAIDA: "#ff5f5f", TRANSFERENCIA: "#4d9fff", AJUSTE: "#ffc84d" }
        return <Chip label={v} size="small" sx={{ background: cor[v], color: "#000" }} />
      }
    },
    { key: "inventarioDescricao",  label: "Produto"  },
    { key: "quantidade",           label: "Qtd"      },
    { key: "documentoRef",         label: "Ref. Doc.", render: v => v ?? "—" },
    { key: "dataMovimento",        label: "Data",
      render: v => v ? new Date(v).toLocaleDateString("pt-AO") : "—"
    },
  ];

  const colunasMap = {
    inventario:   colunasInventario,
    utilizadores: colunasUtilizadores,
    manutencao:   colunasManutencao,
    movimentos:   colunasMovimentos,
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="RELATÓRIOS" subtitle="Análise e exportação de dados" />
        {activeRel && registos.length > 0 && (
          <Button variant="contained" startIcon={<PrintOutlinedIcon />}
            onClick={handlePrint}
            sx={{ backgroundColor: cores.blueAccent[700], height: "40px" }}>
            Imprimir / PDF
          </Button>
        )}
      </Box>

      <Box display="flex" gap="20px">

        {/* SIDEBAR */}
        <Box flex="1" display="flex" flexDirection="column" gap="15px" minWidth="220px">
          <Paper sx={{ p: 2, backgroundColor: cores.primary[400] }}>
            <Typography variant="h6" color={cores.grey[100]} mb="10px">Período</Typography>
            <TextField fullWidth type="date" label="Data Início"
              InputLabelProps={{ shrink: true }} value={dates.inicio}
              onChange={e => setDates(d => ({ ...d, inicio: e.target.value }))}
              sx={{ mb: 2 }} />
            <TextField fullWidth type="date" label="Data Fim"
              InputLabelProps={{ shrink: true }} value={dates.fim}
              onChange={e => setDates(d => ({ ...d, fim: e.target.value }))} />
          </Paper>

          {relatorios.map(rel => (
            <Button key={rel.key}
              variant={activeRel === rel.key ? "contained" : "outlined"}
              startIcon={<BarChartOutlinedIcon />}
              onClick={() => runRelatorio(rel.key)}
              sx={{
                justifyContent: "flex-start",
                backgroundColor: activeRel === rel.key ? COR[rel.key] : "transparent",
                borderColor: COR[rel.key],
                color: activeRel === rel.key ? "#000" : COR[rel.key],
                fontWeight: activeRel === rel.key ? "bold" : "normal",
              }}>
              {rel.label}
            </Button>
          ))}
        </Box>

        {/* RESULTADO */}
        <Box flex="3">
          {loading && (
            <Typography color={cores.grey[100]}>A carregar relatório...</Typography>
          )}
          {error && (
            <Typography color="error">{error}</Typography>
          )}
          {!loading && !activeRel && (
            <Box display="flex" alignItems="center" justifyContent="center" height="300px">
              <Typography color={cores.grey[400]} fontSize="16px">
                Selecciona um relatório para visualizar os dados
              </Typography>
            </Box>
          )}

          {!loading && resumo && (
            <Box display="flex" flexDirection="column" gap="20px">

              {/* RESUMO */}
              <Grid container spacing={2}>
                {activeRel === "inventario" && <>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #4d9fff` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Total Produtos</Typography>
                      <Typography variant="h4" color="#4d9fff">{resumo.totalProdutos ?? 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #ff5f5f` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Sem Stock</Typography>
                      <Typography variant="h4" color="#ff5f5f">{resumo.semEstoque ?? 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #ffc84d` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Stock Baixo</Typography>
                      <Typography variant="h4" color="#ffc84d">{resumo.estoqueBaixo ?? 0}</Typography>
                    </Paper>
                  </Grid>
                </>}

                {activeRel === "utilizadores" && <>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #4dffa3` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Total</Typography>
                      <Typography variant="h4" color="#4dffa3">{resumo.total ?? 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #4d9fff` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Activos</Typography>
                      <Typography variant="h4" color="#4d9fff">{resumo.ativos ?? 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #9e9e9e` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Inactivos</Typography>
                      <Typography variant="h4" color="#9e9e9e">{(resumo.total ?? 0) - (resumo.ativos ?? 0)}</Typography>
                    </Paper>
                  </Grid>
                </>}

                {activeRel === "manutencao" && <>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #4d9fff` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Total</Typography>
                      <Typography variant="h4" color="#4d9fff">{resumo.total ?? 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #ffc84d` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Pendentes</Typography>
                      <Typography variant="h4" color="#ffc84d">{resumo.pendentes ?? 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #4dffa3` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Concluídas</Typography>
                      <Typography variant="h4" color="#4dffa3">{resumo.concluidas ?? 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #ff5f5f` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Atrasadas</Typography>
                      <Typography variant="h4" color="#ff5f5f">{resumo.atrasadas ?? 0}</Typography>
                    </Paper>
                  </Grid>
                </>}

                {activeRel === "movimentos" && <>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #4d9fff` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Total</Typography>
                      <Typography variant="h4" color="#4d9fff">{resumo.total ?? 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #4dffa3` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Entradas</Typography>
                      <Typography variant="h4" color="#4dffa3">{resumo.entradas ?? 0}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid #ff5f5f` }}>
                      <Typography color={cores.grey[300]} fontSize="12px">Saídas</Typography>
                      <Typography variant="h4" color="#ff5f5f">{resumo.saidas ?? 0}</Typography>
                    </Paper>
                  </Grid>
                </>}
              </Grid>

              {/* TABELA DE REGISTOS */}
              {registos.length > 0 && (
                <Paper sx={{ backgroundColor: cores.primary[400] }}>
                  <Box p="15px 20px" display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" color={cores.grey[100]}>
                      Todos os registos ({registos.length})
                    </Typography>
                    <Button size="small" variant="outlined" startIcon={<PrintOutlinedIcon />}
                      onClick={handlePrint}
                      sx={{ borderColor: cores.grey[400], color: cores.grey[200] }}>
                      PDF
                    </Button>
                  </Box>
                  <TableContainer sx={{ maxHeight: "500px" }}>
                    <Table size="small" stickyHeader id="tabela-relatorio">
                      <TableHead>
                        <TableRow>
                          {(colunasMap[activeRel] ?? []).map(col => (
                            <TableCell key={col.key}
                              sx={{ backgroundColor: cores.blueAccent[700], color: cores.grey[100], fontWeight: "bold" }}>
                              {col.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {registos.map((row, i) => (
                          <TableRow key={i} sx={{
                            backgroundColor: i % 2 === 0 ? cores.primary[400] : cores.primary[500],
                            "&:hover": { backgroundColor: cores.primary[300] }
                          }}>
                            {(colunasMap[activeRel] ?? []).map(col => (
                              <TableCell key={col.key} sx={{ color: cores.grey[200], fontSize: "13px" }}>
                                {col.render
                                  ? col.render(row[col.key], row)
                                  : row[col.key] ?? "—"}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* ESTILOS DE IMPRESSÃO */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #tabela-relatorio, #tabela-relatorio * { visibility: visible; }
          #tabela-relatorio { position: absolute; left: 0; top: 0; width: 100%; }
          .MuiChip-root { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </Box>
  );
};

export default Relatorio;