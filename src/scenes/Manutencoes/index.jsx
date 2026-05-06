import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { formatDate } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";

import Header from "../../components/Header";
import { tokens } from "../../theme";

// 🔥 API
import {
  getManutencoes,
  createManutencao,
  updateManutencao,
  updateEstadoManutencao,
  deleteManutencao,
} from "../../services/api";

const Manutencoes = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  const [eventosAtuais, setEventosAtuais] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 LOAD API
  const carregarManutencoes = async () => {
    try {
      setLoading(true);
      const data = await getManutencoes();

      // converter para formato do FullCalendar
      const eventos = (data ?? []).map((m) => ({
        id: m.id,
        title: `${m.idTipo} - ${m.descricao ?? "Manutenção"}`,
        start: m.dataAgendada,
        allDay: true,
        extendedProps: m, // guarda dados completos
      }));

      setEventosAtuais(eventos);
    } catch (e) {
      console.error("Erro ao carregar manutenções", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarManutencoes();
  }, []);

  // ➕ Criar manutenção ao clicar no calendário
  const aoClicarData = async (selecionado) => {
    const descricao = prompt("Descrição da manutenção:");
    if (!descricao) return;

    try {
      await createManutencao({
        idTipo: "PREVENTIVA",
        dataAgendada: selecionado.startStr,
        descricao,
      });

      await carregarManutencoes();
    } catch (e) {
      alert("Erro ao criar manutenção");
    }
  };

  // ❌ Remover manutenção
  const aoClicarEvento = async (selecionado) => {
    const id = selecionado.event.id;

    if (window.confirm("Remover esta manutenção?")) {
      try {
        await deleteManutencao(id);
        await carregarManutencoes();
      } catch (e) {
        alert("Erro ao eliminar");
      }
    }
  };

  // 🔄 Atualizar estado rápido
  const mudarEstado = async (evento, estado) => {
    try {
      await updateEstadoManutencao(evento.id, estado);
      await carregarManutencoes();
    } catch (e) {
      alert("Erro ao atualizar estado");
    }
  };

  return (
    <Box m="20px">
      <Header
        title="Calendário de Manutenções"
        subtitle="Gestão visual de manutenções"
      />

      <Box display="flex" justifyContent="space-between">
        {/* 📋 LISTA LATERAL */}
        <Box
          flex="1 1 25%"
          backgroundColor={cores.primary[400]}
          p="15px"
          borderRadius="4px"
        >
          <Typography variant="h5">Manutenções</Typography>

          <List>
            {eventosAtuais.map((evento) => {
              const m = evento.extendedProps;

              return (
                <ListItem
                  key={evento.id}
                  sx={{
                    backgroundColor: cores.greenAccent[500],
                    margin: "10px 0",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  <ListItemText
                    primary={evento.title}
                    secondary={
                      <>
                        <Typography>
                          {formatDate(evento.start, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </Typography>

                        {/* 🔥 ações rápidas */}
                        <Box mt="5px" display="flex" gap="5px">
                          <button onClick={() => mudarEstado(evento, "EM_CURSO")}>
                            Iniciar
                          </button>
                          <button onClick={() => mudarEstado(evento, "CONCLUIDA")}>
                            Concluir
                          </button>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>

        {/* 📅 CALENDÁRIO */}
        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="dayGridMonth"
            selectable={true}
            editable={true}
            select={aoClicarData}
            eventClick={aoClicarEvento}
            events={eventosAtuais}
            loading={loading}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Manutencoes;