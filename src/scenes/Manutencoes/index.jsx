import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { formatDate } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box, List, ListItem, ListItemText, Typography,
  Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem
} from "@mui/material";
import Header from "../../components/Header";
import {
  getManutencoes, createManutencao,
  updateEstadoManutencao, deleteManutencao,
  getUtilizadores, getMaquinas, getInventario
} from "../../services/api";

const COR_ESTADO = {
  PENDENTE:  "#ffc84d",
  EM_CURSO:  "#4d9fff",
  CONCLUIDA: "#4dffa3",
  CANCELADA: "#9e9e9e",
}

const TIPOS_MANUTENCAO = [
  { id: 1, nome: "PREVENTIVA" },
  { id: 2, nome: "CORRETIVA"  },
  { id: 3, nome: "PREDITIVA"  },
]

const emptyForm = {
  idTipo:           "PREVENTIVA",
  dataAgendada:     "",
  dataExecucao:     "",
  descricao:        "",
  estado:           "PENDENTE",
  custo:            "",
  utilizadorId:     "",
  tipoManutencaoId: "",
  maquinaVeiculoId: "",
  inventarioId:     "",
}

const Manutencoes = () => {
  const [eventos, setEventos]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [utilizadores, setUtilizadores] = useState([]);
  const [maquinas, setMaquinas]     = useState([]);
  const [inventario, setInventario] = useState([]);

  const carregar = async () => {
    try {
      setLoading(true);
      const [manut, utils, maqs, inv] = await Promise.all([
        getManutencoes(),
        getUtilizadores(),
        getMaquinas(),
        getInventario(),
      ]);

      const formatado = (manut ?? []).map(m => ({
        id:    String(m.id),
        title: `${m.tipoManutencaoNome ?? m.idTipo} — ${m.maquinaVeiculoModelo ?? ''}`,
        start:           m.dataAgendada,
        end:             m.dataExecucao ?? m.dataAgendada,
        allDay:          true,
        backgroundColor: COR_ESTADO[m.estado] ?? "#4d9fff",
        borderColor:     COR_ESTADO[m.estado] ?? "#4d9fff",
        textColor:       "#000",
        extendedProps:   m,
      }));

      setEventos(formatado);
      setUtilizadores(utils ?? []);
      setMaquinas(maqs ?? []);
      setInventario(inv ?? []);
    } catch(e) {
      console.error("Erro ao carregar manutenções", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const aoClicarData = (selecionado) => {
    setForm({ ...emptyForm, dataAgendada: selecionado.startStr });
    setModal(true);
  };

  const handleSave = async () => {
    try {
      await createManutencao({
        idTipo:           form.idTipo,
        dataAgendada:     form.dataAgendada,
        dataExecucao:     form.dataExecucao || null,
        descricao:        form.descricao,
        estado:           form.estado,
        custo:            form.custo ? Number(form.custo) : null,
        utilizadorId:     form.utilizadorId     ? Number(form.utilizadorId)     : null,
        tipoManutencaoId: form.tipoManutencaoId ? Number(form.tipoManutencaoId) : null,
        maquinaVeiculoId: form.maquinaVeiculoId ? Number(form.maquinaVeiculoId) : null,
        inventarioId:     form.inventarioId     ? Number(form.inventarioId)     : null,
      });
      setModal(false);
      setForm(emptyForm);
      await carregar();
    } catch(e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao criar manutenção");
    }
  };

  const aoClicarEvento = async (selecionado) => {
    const m = selecionado.event.extendedProps;
    const acao = window.confirm(
      `${selecionado.event.title}\nEstado: ${m.estado}\nData: ${m.dataAgendada}\n\nOK = ELIMINAR | Cancelar = fechar`
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

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Box m="20px">
      <Header title="Calendário de Manutenções" subtitle="Gestão visual de manutenções" />

      <Box display="flex" justifyContent="space-between" gap="15px">

        {/* LISTA LATERAL */}
        <Box
          flex="1 1 25%"
          bgcolor="#f5f5f5"
          p="15px"
          borderRadius="4px"
          overflow="auto"
          maxHeight="75vh"
          border="1px solid #e0e0e0"
        >
          <Typography variant="h5" mb="10px" color="#333" fontWeight="600">
            Manutenções ({eventos.length})
          </Typography>

          <List>
            {eventos.length === 0 ? (
              <Typography color="#999" fontSize="13px">
                Sem manutenções registadas.
              </Typography>
            ) : eventos.map(evento => {
              const m = evento.extendedProps;
              return (
                <ListItem key={evento.id} sx={{
                  bgcolor: "#fff",
                  margin: "8px 0",
                  borderRadius: "6px",
                  borderLeft: `4px solid ${COR_ESTADO[m.estado] ?? "#4d9fff"}`,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "6px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}>
                  <ListItemText
                    primary={
                      <Typography color="#222" fontSize="13px" fontWeight="bold">
                        {m.tipoManutencaoNome ?? m.idTipo ?? "Manutenção"}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {m.descricao && (
                          <Typography color="#555" fontSize="12px">{m.descricao}</Typography>
                        )}
                        {m.maquinaVeiculoModelo && (
                          <Typography color="#777" fontSize="11px">🔧 {m.maquinaVeiculoModelo}</Typography>
                        )}
                        {m.utilizadorNome && (
                          <Typography color="#777" fontSize="11px">👤 {m.utilizadorNome}</Typography>
                        )}
                        <Typography color="#777" fontSize="11px">📅 {m.dataAgendada ?? "—"}</Typography>
                        {m.custo && (
                          <Typography color="#777" fontSize="11px">
                            💰 {Number(m.custo).toLocaleString()} Kz
                          </Typography>
                        )}
                        <Chip label={m.estado} size="small" sx={{
                          mt: "4px",
                          background: COR_ESTADO[m.estado] ?? "#9e9e9e",
                          color: "#000", fontSize: "10px", height: "20px",
                        }} />
                      </Box>
                    }
                  />

                  <Box display="flex" gap="5px" flexWrap="wrap">
                    {m.estado === "PENDENTE" && (
                      <Button size="small" variant="contained"
                        sx={{ fontSize: "10px", py: "2px", px: "8px", bgcolor: "#4d9fff" }}
                        onClick={() => mudarEstado(m.id, "EM_CURSO")}>
                        Iniciar
                      </Button>
                    )}
                    {m.estado === "EM_CURSO" && (
                      <Button size="small" variant="contained"
                        sx={{ fontSize: "10px", py: "2px", px: "8px", bgcolor: "#4dffa3", color: "#000" }}
                        onClick={() => mudarEstado(m.id, "CONCLUIDA")}>
                        Concluir
                      </Button>
                    )}
                    {m.estado !== "CANCELADA" && m.estado !== "CONCLUIDA" && (
                      <Button size="small" variant="outlined"
                        sx={{ fontSize: "10px", py: "2px", px: "8px", color: "#f44336", borderColor: "#f44336" }}
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
        <Box flex="1 1 100%">
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
          />
        </Box>
      </Box>

      {/* MODAL CRIAR */}
      <Dialog open={modal} onClose={() => setModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova Manutenção</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "12px", pt: "16px !important" }}>

          <TextField select label="Tipo de Manutenção" value={form.idTipo} onChange={set('idTipo')} fullWidth>
            {TIPOS_MANUTENCAO.map(t => (
              <MenuItem key={t.id} value={t.nome}>{t.nome}</MenuItem>
            ))}
          </TextField>

          <TextField select label="Tipo Manutenção (ID)" value={form.tipoManutencaoId} onChange={set('tipoManutencaoId')} fullWidth>
            {TIPOS_MANUTENCAO.map(t => (
              <MenuItem key={t.id} value={t.id}>{t.nome}</MenuItem>
            ))}
          </TextField>

          <TextField label="Descrição" value={form.descricao} onChange={set('descricao')} fullWidth multiline rows={2} />

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap="12px">
            <TextField label="Data Agendada" type="date" value={form.dataAgendada}
              onChange={set('dataAgendada')} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Data Execução" type="date" value={form.dataExecucao}
              onChange={set('dataExecucao')} fullWidth InputLabelProps={{ shrink: true }} />
          </Box>

          <TextField select label="Estado" value={form.estado} onChange={set('estado')} fullWidth>
            {["PENDENTE", "EM_CURSO", "CONCLUIDA", "CANCELADA"].map(e => (
              <MenuItem key={e} value={e}>{e}</MenuItem>
            ))}
          </TextField>

          <TextField label="Custo (Kz)" type="number" value={form.custo}
            onChange={set('custo')} fullWidth />

          <TextField select label="Utilizador responsável" value={form.utilizadorId}
            onChange={set('utilizadorId')} fullWidth>
            <MenuItem value="">— Nenhum —</MenuItem>
            {utilizadores.map(u => (
              <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>
            ))}
          </TextField>

          <TextField select label="Máquina / Veículo" value={form.maquinaVeiculoId}
            onChange={set('maquinaVeiculoId')} fullWidth>
            <MenuItem value="">— Nenhuma —</MenuItem>
            {maquinas.map(m => (
              <MenuItem key={m.id} value={m.id}>{m.modelo} — {m.matriculaNSerie ?? ''}</MenuItem>
            ))}
          </TextField>

          <TextField select label="Peça de Inventário" value={form.inventarioId}
            onChange={set('inventarioId')} fullWidth>
            <MenuItem value="">— Nenhuma —</MenuItem>
            {inventario.map(i => (
              <MenuItem key={i.id} value={i.id}>{i.codigo} — {i.descricao}</MenuItem>
            ))}
          </TextField>

        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Manutencoes;