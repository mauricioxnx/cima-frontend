import { useState } from "react";
import {
  Box, Button, Typography, useTheme,
  Paper, Grid, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  getInventario, getManutencoes, getMovimentos,
  getUtilizadores, getFornecedores, getMaquinas,
} from "../../services/api";

const Relatorio = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [activeRel, setActiveRel] = useState(null);
  const [registos, setRegistos]   = useState([]);
  const [resumo, setResumo]       = useState(null);
  const [loading, setLoading]     = useState(false);

  const runRelatorio = async (type) => {
    setLoading(true);
    setActiveRel(type);
    setRegistos([]);
    setResumo(null);

    try {
      let data = [];

      if (type === "inventario") {
        data = await getInventario();
        setResumo({
          total:      data.length,
          semStock:   data.filter(d => d.quantidade === 0).length,
          stockBaixo: data.filter(d => d.quantidade > 0 && d.quantidade < 5).length,
          totalUnidades: data.reduce((s, d) => s + (d.quantidade ?? 0), 0),
        });
      }

      if (type === "utilizadores") {
        data = await getUtilizadores();
        setResumo({
          total:    data.length,
          ativos:   data.filter(d => d.ativo).length,
          inativos: data.filter(d => !d.ativo).length,
        });
      }

      if (type === "manutencoes") {
        data = await getManutencoes();
        setResumo({
          total:     data.length,
          pendentes: data.filter(d => d.estado === "PENDENTE").length,
          emCurso:   data.filter(d => d.estado === "EM_CURSO").length,
          concluidas: data.filter(d => d.estado === "CONCLUIDA").length,
          canceladas: data.filter(d => d.estado === "CANCELADA").length,
        });
      }

      if (type === "movimentos") {
        data = await getMovimentos();
        setResumo({
          total:    data.length,
          entradas: data.filter(d => d.tipoMovimento === "ENTRADA").reduce((s, d) => s + (d.quantidade ?? 0), 0),
          saidas:   data.filter(d => d.tipoMovimento === "SAIDA").reduce((s, d) => s + (d.quantidade ?? 0), 0),
        });
      }

      if (type === "fornecedores") {
        data = await getFornecedores();
        const categorias = [...new Set(data.map(d => d.categoria).filter(Boolean))];
        setResumo({
          total:      data.length,
          categorias: categorias.length,
        });
      }

      if (type === "maquinas") {
        data = await getMaquinas();
        setResumo({
          total:        data.length,
          activas:      data.filter(d => d.estado === "ACTIVO").length,
          manutencao:   data.filter(d => d.estado === "EM_MANUTENCAO").length,
          inactivas:    data.filter(d => d.estado === "INACTIVO").length,
        });
      }

      setRegistos(data ?? []);
    } catch(e) {
      console.error("Erro ao carregar relatório", e);
    } finally {
      setLoading(false);
    }
  };

  const relatorios = [
    { key: "inventario",   label: "Inventário",    cor: "#4d9fff" },
    { key: "utilizadores", label: "Utilizadores",  cor: "#4dffa3" },
    { key: "manutencoes",  label: "Manutenções",   cor: "#ffc84d" },
    { key: "movimentos",   label: "Movimentos",    cor: "#ff7043" },
    { key: "fornecedores", label: "Fornecedores",  cor: "#ce93d8" },
    { key: "maquinas",     label: "Máquinas",      cor: "#80cbc4" },
  ];

  // ── Colunas por tipo ──────────────────────────────────
  const colunasMap = {
    inventario: [
      { key: "codigo",      label: "Código"    },
      { key: "descricao",   label: "Descrição" },
      { key: "unidadeBase", label: "Unidade"   },
      { key: "preco",       label: "Preço (Kz)", render: v => v ? `${Number(v).toLocaleString()} Kz` : "—" },
      { key: "quantidade",  label: "Stock",
        render: v => v === 0
          ? <Chip label="Sem stock" size="small" color="error" />
          : v < 5
            ? <Chip label={`Baixo (${v})`} size="small" color="warning" />
            : v
      },
    ],
    utilizadores: [
      { key: "id",         label: "ID"       },
      { key: "nome",       label: "Nome"     },
      { key: "email",      label: "Email"    },
      { key: "telefone",   label: "Telefone" },
      { key: "perfilNome", label: "Perfil"   },
      { key: "ativo",      label: "Activo",
        render: v => <Chip label={v ? "Sim" : "Não"} size="small" color={v ? "success" : "default"} />
      },
    ],
    manutencoes: [
      { key: "id",                   label: "ID"        },
      { key: "tipoManutencaoNome",   label: "Tipo",     render: (v, r) => v ?? r.idTipo ?? "—" },
      { key: "descricao",            label: "Descrição" },
      { key: "maquinaVeiculoModelo", label: "Máquina"   },
      { key: "utilizadorNome",       label: "Técnico"   },
      { key: "dataAgendada",         label: "Data"      },
      { key: "estado",               label: "Estado",
        render: v => {
          const cor = { PENDENTE: "warning", EM_CURSO: "info", CONCLUIDA: "success", CANCELADA: "default" }
          return <Chip label={v} size="small" color={cor[v] ?? "default"} />
        }
      },
    ],
    movimentos: [
      { key: "idMovimento",         label: "ID"       },
      { key: "tipoMovimento",       label: "Tipo",
        render: v => {
          const cor = { ENTRADA: "#4dffa3", SAIDA: "#ff5f5f" }
          return <Chip label={v} size="small" sx={{ background: cor[v] ?? "#9e9e9e", color: "#000" }} />
        }
      },
      { key: "inventarioDescricao", label: "Produto"  },
      { key: "quantidade",          label: "Qtd"      },
      { key: "documentoRef",        label: "Ref. Doc.", render: v => v ?? "—" },
      { key: "dataMovimento",       label: "Data",
        render: v => v ? new Date(v).toLocaleDateString("pt-AO") : "—"
      },
    ],
    fornecedores: [
      { key: "id",        label: "ID"        },
      { key: "nome",      label: "Nome"      },
      { key: "nif",       label: "NIF"       },
      { key: "telefone",  label: "Telefone"  },
      { key: "email",     label: "Email"     },
      { key: "categoria", label: "Categoria" },
      { key: "endereco",  label: "Endereço"  },
    ],
    maquinas: [
      { key: "id",              label: "ID"               },
      { key: "modelo",          label: "Modelo"           },
      { key: "tipo",            label: "Tipo"             },
      { key: "matriculaNSerie", label: "Matrícula/Série"  },
      { key: "dataAquisicao",   label: "Data Aquisição"   },
      { key: "estado",          label: "Estado",
        render: v => {
          const cor = { ACTIVO: "success", EM_MANUTENCAO: "warning", INACTIVO: "default" }
          return <Chip label={v} size="small" color={cor[v] ?? "default"} />
        }
      },
    ],
  };

  const ResumoCards = () => {
    if (!resumo) return null;
    const cards = {
      inventario: [
        { label: "Total Produtos",   value: resumo.total,         cor: "#4d9fff" },
        { label: "Sem Stock",        value: resumo.semStock,      cor: "#ff5f5f" },
        { label: "Stock Baixo",      value: resumo.stockBaixo,    cor: "#ffc84d" },
        { label: "Total Unidades",   value: resumo.totalUnidades, cor: "#4dffa3" },
      ],
      utilizadores: [
        { label: "Total",    value: resumo.total,    cor: "#4dffa3" },
        { label: "Activos",  value: resumo.ativos,   cor: "#4d9fff" },
        { label: "Inactivos",value: resumo.inativos, cor: "#9e9e9e" },
      ],
      manutencoes: [
        { label: "Total",      value: resumo.total,      cor: "#4d9fff" },
        { label: "Pendentes",  value: resumo.pendentes,  cor: "#ffc84d" },
        { label: "Em Curso",   value: resumo.emCurso,    cor: "#4d9fff" },
        { label: "Concluídas", value: resumo.concluidas, cor: "#4dffa3" },
        { label: "Canceladas", value: resumo.canceladas, cor: "#9e9e9e" },
      ],
      movimentos: [
        { label: "Total Registos", value: resumo.total,    cor: "#4d9fff" },
        { label: "Qtd Entradas",   value: resumo.entradas, cor: "#4dffa3" },
        { label: "Qtd Saídas",     value: resumo.saidas,   cor: "#ff5f5f" },
      ],
      fornecedores: [
        { label: "Total Fornecedores", value: resumo.total,      cor: "#ce93d8" },
        { label: "Categorias",         value: resumo.categorias, cor: "#4d9fff" },
      ],
      maquinas: [
        { label: "Total",        value: resumo.total,      cor: "#80cbc4" },
        { label: "Activas",      value: resumo.activas,    cor: "#4dffa3" },
        { label: "Manutenção",   value: resumo.manutencao, cor: "#ffc84d" },
        { label: "Inactivas",    value: resumo.inactivas,  cor: "#9e9e9e" },
      ],
    };

    return (
      <Grid container spacing={2} mb="20px">
        {(cards[activeRel] ?? []).map((c, i) => (
          <Grid item xs key={i}>
            <Paper sx={{ p: 2, backgroundColor: cores.primary[400], borderLeft: `4px solid ${c.cor}` }}>
              <Typography color={cores.grey[300]} fontSize="12px">{c.label}</Typography>
              <Typography variant="h4" color={c.cor} fontWeight="bold">{c.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="RELATÓRIOS" subtitle="Análise completa de todos os dados do sistema" />
        {activeRel && registos.length > 0 && (
          <Button variant="contained" startIcon={<PrintOutlinedIcon />}
            onClick={() => window.print()}
            sx={{ backgroundColor: cores.blueAccent[700], height: "40px" }}>
            Imprimir / PDF
          </Button>
        )}
      </Box>

      {/* BOTÕES DE SELECÇÃO */}
      <Box display="flex" gap="12px" mb="25px" flexWrap="wrap">
        {relatorios.map(rel => (
          <Button key={rel.key}
            variant={activeRel === rel.key ? "contained" : "outlined"}
            startIcon={loading && activeRel === rel.key ? <RefreshOutlinedIcon /> : <BarChartOutlinedIcon />}
            onClick={() => runRelatorio(rel.key)}
            sx={{
              backgroundColor: activeRel === rel.key ? rel.cor : "transparent",
              borderColor: rel.cor,
              color: activeRel === rel.key ? "#000" : rel.cor,
              fontWeight: activeRel === rel.key ? "bold" : "normal",
              minWidth: "140px",
            }}>
            {loading && activeRel === rel.key ? "A carregar..." : rel.label}
          </Button>
        ))}
      </Box>

      {/* SEM SELECÇÃO */}
      {!activeRel && (
        <Box display="flex" alignItems="center" justifyContent="center" height="300px"
          backgroundColor={cores.primary[400]} borderRadius="8px">
          <Typography color={cores.grey[400]} fontSize="16px">
            Selecciona um relatório acima para ver todos os dados
          </Typography>
        </Box>
      )}

      {/* RESULTADO */}
      {activeRel && !loading && resumo && (
        <Box>
          {/* CARDS DE RESUMO */}
          <ResumoCards />

          {/* TABELA COMPLETA */}
          {registos.length > 0 && (
            <Paper sx={{ backgroundColor: cores.primary[400] }}>
              <Box p="15px 20px" display="flex" justifyContent="space-between" alignItems="center"
                borderBottom={`1px solid ${cores.primary[300]}`}>
                <Typography variant="h6" color={cores.grey[100]} fontWeight="bold">
                  Todos os registos — {registos.length} total
                </Typography>
                <Typography color={cores.grey[400]} fontSize="12px">
                  {new Date().toLocaleDateString('pt-AO', {
                    day: '2-digit', month: 'long', year: 'numeric'
                  })}
                </Typography>
              </Box>

              <TableContainer sx={{ maxHeight: "500px" }} id="tabela-relatorio">
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {(colunasMap[activeRel] ?? []).map(col => (
                        <TableCell key={col.key} sx={{
                          backgroundColor: cores.blueAccent[700],
                          color: cores.grey[100],
                          fontWeight: "bold",
                          fontSize: "13px",
                        }}>
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
                            {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
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

      {/* ESTILOS IMPRESSÃO */}
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