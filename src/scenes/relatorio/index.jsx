import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  useTheme,
  Paper,
  Grid,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";

import {
  getRelatorioManutencao,
  getRelatorioMovimentos,
  getRelatorioInventario,
  getRelatorioUtilizadores,
} from "../../services/api";

const Relatorio = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [activeRel, setActiveRel] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dates, setDates] = useState({ inicio: "", fim: "" });

  const runRelatorio = async (type) => {
    setLoading(true);
    setResult(null);
    setActiveRel(type);

    try {
      let data;

      if (type === "inventario") data = await getRelatorioInventario();
      if (type === "utilizadores") data = await getRelatorioUtilizadores();
      if (type === "manutencao")
        data = await getRelatorioManutencao(dates.inicio, dates.fim);
      if (type === "movimentos")
        data = await getRelatorioMovimentos(dates.inicio, dates.fim);

      setResult({ type, data });
    } catch {
      setResult({ type, data: null, error: "Erro ao carregar relatório" });
    } finally {
      setLoading(false);
    }
  };

  const relatorios = [
    { key: "inventario", label: "Relatório de Inventário", needsDates: false },
    { key: "utilizadores", label: "Relatório de Utilizadores", needsDates: false },
    { key: "manutencao", label: "Relatório de Manutenções", needsDates: true },
    { key: "movimentos", label: "Relatório de Movimentos", needsDates: true },
  ];

  return (
    <Box m="20px">
      <Header title="RELATÓRIOS" subtitle="Análise e exportação de dados" />

      <Box display="flex" gap="20px">
        {/* SIDEBAR */}
        <Box flex="1" display="flex" flexDirection="column" gap="15px">
          {/* Datas */}
          <Paper sx={{ p: 2, backgroundColor: cores.primary[400] }}>
            <Typography variant="h6" mb="10px">
              Período
            </Typography>

            <TextField
              fullWidth
              type="date"
              label="Data Início"
              InputLabelProps={{ shrink: true }}
              value={dates.inicio}
              onChange={(e) =>
                setDates((d) => ({ ...d, inicio: e.target.value }))
              }
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              type="date"
              label="Data Fim"
              InputLabelProps={{ shrink: true }}
              value={dates.fim}
              onChange={(e) =>
                setDates((d) => ({ ...d, fim: e.target.value }))
              }
            />
          </Paper>

          {/* Botões de relatórios */}
          {relatorios.map((rel) => (
            <Button
              key={rel.key}
              variant={activeRel === rel.key ? "contained" : "outlined"}
              onClick={() => runRelatorio(rel.key)}
              sx={{
                justifyContent: "flex-start",
                backgroundColor:
                  activeRel === rel.key ? cores.blueAccent[600] : "transparent",
              }}
            >
              {rel.label}
            </Button>
          ))}
        </Box>

        {/* RESULTADO */}
        <Box flex="3">
          {loading && (
            <Typography color={cores.grey[100]}>
              A carregar relatório...
            </Typography>
          )}

          {!loading && !result && (
            <Typography color={cores.grey[300]}>
              Selecciona um relatório
            </Typography>
          )}

          {result?.error && (
            <Typography color="error">{result.error}</Typography>
          )}

          {result?.data && (
            <Box display="flex" flexDirection="column" gap="20px">
              {/* INVENTÁRIO */}
              {result.type === "inventario" && (
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.primary[400] }}>
                      <Typography>Total Produtos</Typography>
                      <Typography variant="h4">
                        {result.data.totalProdutos}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.redAccent[500] }}>
                      <Typography>Sem Stock</Typography>
                      <Typography variant="h4">
                        {result.data.semEstoque}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, backgroundColor: cores.orangeAccent[500] }}>
                      <Typography>Stock Baixo</Typography>
                      <Typography variant="h4">
                        {result.data.estoqueBaixo}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* UTILIZADORES */}
              {result.type === "utilizadores" && (
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Total</Typography>
                      <Typography variant="h4">{result.data.total}</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Activos</Typography>
                      <Typography variant="h4">
                        {result.data.ativos}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Inactivos</Typography>
                      <Typography variant="h4">
                        {(result.data.total ?? 0) -
                          (result.data.ativos ?? 0)}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* MANUTENÇÃO */}
              {result.type === "manutencao" && (
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Total</Typography>
                      <Typography variant="h4">{result.data.total}</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Pendentes</Typography>
                      <Typography variant="h4">
                        {result.data.pendentes}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Concluídas</Typography>
                      <Typography variant="h4">
                        {result.data.concluidas}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={3}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Atrasadas</Typography>
                      <Typography variant="h4">
                        {result.data.atrasadas}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* MOVIMENTOS */}
              {result.type === "movimentos" && (
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Total</Typography>
                      <Typography variant="h4">{result.data.total}</Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Entradas</Typography>
                      <Typography variant="h4">
                        {result.data.entradas}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography>Saídas</Typography>
                      <Typography variant="h4">
                        {result.data.saidas}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* JSON */}
              <Paper sx={{ p: 2, backgroundColor: cores.primary[400] }}>
                <Typography variant="h6">Dados Brutos</Typography>
                <pre style={{ fontSize: "12px", overflow: "auto" }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Relatorio;