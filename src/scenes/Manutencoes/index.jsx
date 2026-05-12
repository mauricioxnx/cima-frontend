import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { formatDate } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box, List, ListItem, ListItemText,
  Typography, useTheme, Button, Chip
} from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import {
  getManutencoes, createManutencao,
  updateEstadoManutencao, deleteManutencao,
} from "../../services/api";

const COR_ESTADO = {
  PENDENTE:  "#ffc84d",
  EM_CURSO:  "#4d9fff",
  CONCLUIDA: "#4dffa3",
  CANCELADA: "#4e535d",
}

const Manutencoes = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [eventos, setEventos]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const carregar = async () => {
    try {
      setLoading(true);
      const data = await getManutencoes();
      const formatado = (data ?? []).map(m => ({
        id:    String(m.id),
        title: m.tipoManutencaoNome
          ? `${m.tipoManutencaoNome} — ${m.descricao ?? ''}`
          : m.idTipo ?? 'Manutenção',
        start:           m.dataAgendada,
        end:             m.dataExecucao ?? m.dataAgendada,
        allDay:          true,
        backgroundColor: COR_ESTADO[m.estado] ?? "#4d9fff",
        borderColor:     COR_ESTADO[m.estado] ?? "#4d9fff",
        extendedProps:   m,
      }));
      setEventos(formatado);
    } catch(e) {
      console.error("Erro ao carregar manutenções", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const aoClicarData = async (selecionado) => {
    const descricao = prompt("Descrição da manutenção:");
    if (!descricao) return;
    try {
      await createManutencao({
        idTipo:       "PREVENTIVA",
        dataAgendada: selecionado.startStr,
        descricao,
        estado:       "PENDENTE",
      });
      await carregar();
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao criar manutenção");
    }
  };

  const aoClicarEvento = async (selecionado) => {
    const m = selecionado.event.extendedProps;
    const acao = window.confirm(
      `Manutenção: ${selecionado.event.title}\nEstado: ${m.estado}\n\nClicar OK para ELIMINAR ou Cancelar para fechar.`
    );
    if (acao) {
      try {
        await deleteManutencao(selecionado.event.id);
        await carregar();
      } catch(e) {
        alert("Erro ao eliminar manutenção");
      }
    }
  };

  const mudarEstado = async (id, estado) => {
    try {
      await updateEstadoManutencao(id, estado);
      await carregar();
    } catch(e) {
      alert("Erro ao atualizar estado");
    }
  };

  return (
    <Box m="20px">
      <Header title="Calendário de Manutenções" subtitle="Gestão visual de manutenções" />

      <Box display="flex" justifyContent="space-between" gap="15px">

        {/* LISTA LATERAL */}
        <Box
          flex="1 1 25%"
          backgroundColor={cores.primary[400]}
          p="15px"
          borderRadius="4px"
          overflow="auto"
          maxHeight="75vh"
        >
          <Typography variant="h5" mb="10px" color={cores.grey[100]}>
            Manutenções ({eventos.length})
          </Typography>

          <List>
            {eventos.length === 0 ? (
              <Typography color={cores.grey[400]} fontSize="13px">
                Sem manutenções registadas.
              </Typography>
            ) : eventos.map(evento => {
              const m = evento.extendedProps;
              return (
                <ListItem key={evento.id} sx={{
                  backgroundColor: cores.primary[300],
                  margin: "8px 0",
                  borderRadius: "4px",
                  borderLeft: `4px solid ${COR_ESTADO[m.estado] ?? "#4d9fff"}`,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "6px",
                }}>
                  <ListItemText
                    primary={
                      <Typography color={cores.grey[100]} fontSize="13px" fontWeight="bold">
                        {m.tipoManutencaoNome ?? m.idTipo ?? "Manutenção"}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography color={cores.grey[300]} fontSize="12px">
                          {m.descricao ?? "—"}
                        </Typography>
                        {m.maquinaVeiculoModelo && (
                          <Typography color={cores.grey[400]} fontSize="11px">
                            🔧 {m.maquinaVeiculoModelo}
                          </Typography>
                        )}
                        {m.utilizadorNome && (
                          <Typography color={cores.grey[400]} fontSize="11px">
                            👤 {m.utilizadorNome}
                          </Typography>
                        )}
                        <Typography color={cores.grey[400]} fontSize="11px">
                          📅 {m.dataAgendada ?? "—"}
                        </Typography>
                        <Chip
                          label={m.estado}
                          size="small"
                          sx={{
                            mt: "4px",
                            background: COR_ESTADO[m.estado] ?? "#4e535d",
                            color: "#000",
                            fontSize: "10px",
                            height: "20px",
                          }}
                        />
                      </Box>
                    }
                  />

                  {/* Acções rápidas */}
                  <Box display="flex" gap="5px" flexWrap="wrap">
                    {m.estado === "PENDENTE" && (
                      <Button size="small" variant="contained"
                        sx={{ fontSize: "10px", py: "2px", px: "8px", backgroundColor: "#4d9fff" }}
                        onClick={() => mudarEstado(m.id, "EM_CURSO")}>
                        Iniciar
                      </Button>
                    )}
                    {m.estado === "EM_CURSO" && (
                      <Button size="small" variant="contained"
                        sx={{ fontSize: "10px", py: "2px", px: "8px", backgroundColor: "#4dffa3", color: "#000" }}
                        onClick={() => mudarEstado(m.id, "CONCLUIDA")}>
                        Concluir
                      </Button>
                    )}
                    {m.estado !== "CANCELADA" && m.estado !== "CONCLUIDA" && (
                      <Button size="small" variant="outlined"
                        sx={{ fontSize: "10px", py: "2px", px: "8px", color: cores.redAccent[400], borderColor: cores.redAccent[400] }}
                        onClick={() => mudarEstado(m.id, "CANCELADA")}>
                        Cancelar
                      </Button>
                    )}
                  </Box>
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* CALENDÁRIO */}
        <Box flex="1 1 100%" ml="15px"
          sx={{
            "& .fc": { fontFamily: "inherit" },
            "& .fc-toolbar-title": { color: cores.grey[100] },
            "& .fc-button": {
              backgroundColor: `${cores.blueAccent[700]} !important`,
              borderColor: `${cores.blueAccent[700]} !important`,
            },
            "& .fc-day-today": {
              backgroundColor: `${cores.blueAccent[900]} !important`,
            },
            "& .fc-col-header-cell": { color: cores.grey[100] },
            "& .fc-daygrid-day-number": { color: cores.grey[300] },
          }}
        >
          <FullCalendar
            height="75vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left:   "prev,next today",
              center: "title",
              right:  "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            locale="pt"
            selectable={true}
            editable={true}
            select={aoClicarData}
            eventClick={aoClicarEvento}
            events={eventos}
            loading={() => loading}
            eventContent={({ event }) => (
              <Box px="4px" py="1px" borderRadius="3px" overflow="hidden">
                <Typography fontSize="11px" color="#000" fontWeight="bold" noWrap>
                  {event.title}
                </Typography>
              </Box>
            )}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Manutencoes;