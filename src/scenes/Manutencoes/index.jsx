import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import {
  Box, List, ListItem, ListItemText, Typography,
  Button, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Tooltip,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Header from "../../components/Header";
import {
  getManutencoes, createManutencao, updateManutencao,
  updateEstadoManutencao, deleteManutencao,
  getUtilizadores, getMaquinas, getInventario,
} from "../../services/api";

const COR_ESTADO = {
  PENDENTE:  "#ffc84d",
  EM_CURSO:  "#4d9fff",
  CONCLUIDA: "#4dffa3",
  CANCELADA: "#9e9e9e",
};

const TIPOS_MANUTENCAO = [
  { id: 1, nome: "PREVENTIVA" },
  { id: 2, nome: "CORRETIVA"  },
  { id: 3, nome: "PREDITIVA"  },
];

const emptyForm = {
  idTipo: "PREVENTIVA", tipoManutencaoId: "",
  dataAgendada: "", dataExecucao: "", descricao: "",
  estado: "PENDENTE", utilizadorId: "",
  maquinaVeiculoId: "", inventarioId: "", quantidade: 1,
};

const Manutencoes = () => {
  const [eventos, setEventos]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modal, setModal]             = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [editando, setEditando]       = useState(null);
  const [formEditar, setFormEditar]   = useState({});
  const [form, setForm]               = useState(emptyForm);
  const [tecnicos, setTecnicos]       = useState([]);
  const [maquinas, setMaquinas]       = useState([]);
  const [inventario, setInventario]   = useState([]);
  const [saving, setSaving]           = useState(false);

  const carregar = async () => {
    try {
      setLoading(true);
      const [manut, utils, maqs, inv] = await Promise.all([
        getManutencoes(), getUtilizadores(), getMaquinas(), getInventario(),
      ]);
      setEventos((manut ?? []).map(m => ({
        id: String(m.id),
        title: `${m.tipoManutencaoNome ?? m.idTipo} — ${m.maquinaVeiculoModelo ?? ""}`,
        start: m.dataAgendada, end: m.dataExecucao ?? m.dataAgendada,
        allDay: true,
        backgroundColor: COR_ESTADO[m.estado] ?? "#4d9fff",
        borderColor: COR_ESTADO[m.estado] ?? "#4d9fff",
        textColor: "#000", extendedProps: m,
      })));
      setTecnicos((utils ?? []).filter(u => u.perfilNome?.toUpperCase() === "TECNICO"));
      setMaquinas(maqs ?? []);
      setInventario(inv ?? []);
    } catch (e) {
      console.error("Erro ao carregar manutenções", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const aoClicarData = (sel) => { setForm({ ...emptyForm, dataAgendada: sel.startStr }); setModal(true); };

  const handleSave = async () => {
    try {
      await createManutencao({
        idTipo: form.idTipo,
        tipoManutencaoId: form.tipoManutencaoId ? Number(form.tipoManutencaoId) : null,
        dataAgendada: form.dataAgendada, dataExecucao: form.dataExecucao || null,
        descricao: form.descricao, estado: "PENDENTE",
        utilizadorId:     form.utilizadorId     ? Number(form.utilizadorId)     : null,
        maquinaVeiculoId: form.maquinaVeiculoId ? Number(form.maquinaVeiculoId) : null,
        inventarioId:     form.inventarioId     ? Number(form.inventarioId)     : null,
        quantidade:       form.inventarioId     ? Number(form.quantidade)       : null,
      });
      setModal(false); setForm(emptyForm); await carregar();
    } catch (e) { alert(e?.response?.data?.mensagem ?? "Erro ao criar manutenção"); }
  };

  const handleAbrirEditar = (m) => {
    setEditando(m);
    const tipoObj = TIPOS_MANUTENCAO.find(t => t.nome === (m.tipoManutencaoNome ?? m.idTipo));
    setFormEditar({
      idTipo:           m.idTipo           ?? "PREVENTIVA",
      tipoManutencaoId: tipoObj?.id        ?? "",
      dataAgendada:     m.dataAgendada     ?? "",
      dataExecucao:     m.dataExecucao     ?? "",
      descricao:        m.descricao        ?? "",
      utilizadorId:     m.utilizadorId     ?? "",
      maquinaVeiculoId: m.maquinaVeiculoId ?? "",
      inventarioId:     m.inventarioId     ?? "",
    });
    setModalEditar(true);
  };

  const handleGuardarEditar = async () => {
    if (!editando) return;
    setSaving(true);
    try {
      await updateManutencao(editando.id, {
        idTipo:           formEditar.idTipo,
        tipoManutencaoId: formEditar.tipoManutencaoId ? Number(formEditar.tipoManutencaoId) : null,
        dataAgendada:     formEditar.dataAgendada,
        dataExecucao:     formEditar.dataExecucao || null,
        descricao:        formEditar.descricao,
        estado:           editando.estado,
        utilizadorId:     formEditar.utilizadorId     ? Number(formEditar.utilizadorId)     : null,
        maquinaVeiculoId: formEditar.maquinaVeiculoId ? Number(formEditar.maquinaVeiculoId) : null,
        inventarioId:     formEditar.inventarioId     ? Number(formEditar.inventarioId)     : null,
      });
      setModalEditar(false); setEditando(null); await carregar();
    } catch (e) {
      alert(e?.response?.data?.mensagem ?? "Erro ao atualizar manutenção");
    } finally { setSaving(false); }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("Eliminar esta manutenção?")) return;
    try { await deleteManutencao(id); await carregar(); }
    catch (e) { alert("Erro ao eliminar manutenção"); }
  };

  const aoClicarEvento = (sel) => {
    const m = sel.event.extendedProps;
    alert(`${sel.event.title}\nEstado: ${m.estado}\nData: ${m.dataAgendada}\n${m.descricao ?? ""}`);
  };

  const mudarEstado = async (id, estado) => {
    try { await updateEstadoManutencao(id, estado); await carregar(); }
    catch (e) { alert("Erro ao atualizar estado"); }
  };

  const set     = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setEdit = k => e => setFormEditar(f => ({ ...f, [k]: e.target.value }));

  return (
    <Box m="20px">
      <Header title="Calendário de Manutenções" subtitle="Gestão visual de manutenções" />

      <Box display="flex" justifyContent="space-between" gap="15px">

        {/* LISTA LATERAL */}
        <Box flex="1 1 25%" bgcolor="#f5f5f5" p="15px" borderRadius="4px"
          overflow="auto" maxHeight="75vh" border="1px solid #e0e0e0">

          <Box display="flex" justifyContent="space-between" alignItems="center" mb="10px">
            <Typography variant="h5" color="#333" fontWeight="600">
              Manutenções ({eventos.length})
            </Typography>
            <Tooltip title="Nova manutenção">
              <Button size="small" variant="contained"
                onClick={() => { setForm(emptyForm); setModal(true); }}
                sx={{ minWidth: "36px", padding: "4px 10px", bgcolor: "#4d9fff" }}>
                <AddOutlinedIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Box>

          <List disablePadding>
            {eventos.length === 0 ? (
              <Typography color="#999" fontSize="13px">Sem manutenções registadas.</Typography>
            ) : eventos.map(evento => {
              const m = evento.extendedProps;
              return (
                <ListItem key={evento.id} sx={{
                  bgcolor: "#fff", margin: "8px 0", borderRadius: "6px",
                  borderLeft: `4px solid ${COR_ESTADO[m.estado] ?? "#4d9fff"}`,
                  flexDirection: "column", alignItems: "flex-start",
                  gap: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", p: "10px",
                }}>
                  <ListItemText
                    primaryTypographyProps={{ component: "div" }}
                    secondaryTypographyProps={{ component: "div" }}
                    primary={
                      <Typography color="#222" fontSize="13px" fontWeight="bold">
                        {m.tipoManutencaoNome ?? m.idTipo ?? "Manutenção"}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        {m.descricao && <Typography color="#555" fontSize="12px">{m.descricao}</Typography>}
                        {m.maquinaVeiculoModelo && <Typography color="#777" fontSize="11px">🔧 {m.maquinaVeiculoModelo}</Typography>}
                        {m.utilizadorNome && <Typography color="#777" fontSize="11px">👤 {m.utilizadorNome}</Typography>}
                        <Typography color="#777" fontSize="11px">📅 {m.dataAgendada ?? "—"}</Typography>
                        <Chip label={m.estado} size="small" sx={{
                          mt: "4px", background: COR_ESTADO[m.estado] ?? "#9e9e9e",
                          color: "#000", fontSize: "10px", height: "20px",
                        }} />
                      </Box>
                    }
                  />

                  <Box display="flex" gap="5px" flexWrap="wrap" width="100%">
                    {m.estado === "PENDENTE" && (
                      <Button size="small" variant="contained"
                        sx={{ fontSize: "10px", py: "2px", px: "8px", bgcolor: "#4d9fff" }}
                        onClick={() => mudarEstado(m.id, "EM_CURSO")}>Iniciar</Button>
                    )}
                    {m.estado === "EM_CURSO" && (
                      <Button size="small" variant="contained"
                        sx={{ fontSize: "10px", py: "2px", px: "8px", bgcolor: "#4dffa3", color: "#000" }}
                        onClick={() => mudarEstado(m.id, "CONCLUIDA")}>Concluir</Button>
                    )}
                    {m.estado !== "CANCELADA" && m.estado !== "CONCLUIDA" && (
                      <Button size="small" variant="outlined"
                        sx={{ fontSize: "10px", py: "2px", px: "8px", color: "#f44336", borderColor: "#f44336" }}
                        onClick={() => mudarEstado(m.id, "CANCELADA")}>Cancelar</Button>
                    )}

                    {/* ✅ botão editar */}
                    <Tooltip title="Editar manutenção">
                      <Button size="small" variant="outlined"
                        sx={{ fontSize: "10px", py: "2px", px: "8px", color: "#1976d2", borderColor: "#1976d2" }}
                        onClick={() => handleAbrirEditar(m)}>
                        <EditOutlinedIcon sx={{ fontSize: "14px" }} />
                      </Button>
                    </Tooltip>

                    {/* botão eliminar */}
                    <Tooltip title="Eliminar manutenção">
                      <Button size="small" variant="outlined"
                        sx={{ fontSize: "10px", py: "2px", px: "8px", ml: "auto", color: "#f44336", borderColor: "#f44336" }}
                        onClick={() => handleEliminar(m.id)}>
                        <DeleteOutlinedIcon sx={{ fontSize: "14px" }} />
                      </Button>
                    </Tooltip>
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
            headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth" }}
            initialView="dayGridMonth" locale="pt"
            selectable={true} editable={true}
            select={aoClicarData} eventClick={aoClicarEvento} events={eventos}
          />
        </Box>
      </Box>

      {/* MODAL CRIAR */}
      <Dialog open={modal} onClose={() => setModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nova Manutenção</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "12px", pt: "16px !important" }}>
          <TextField select label="Tipo de Manutenção" value={form.tipoManutencaoId}
            onChange={e => { const t = TIPOS_MANUTENCAO.find(t => t.id === Number(e.target.value)); setForm(f => ({ ...f, tipoManutencaoId: e.target.value, idTipo: t?.nome ?? "PREVENTIVA" })); }} fullWidth>
            {TIPOS_MANUTENCAO.map(t => <MenuItem key={t.id} value={t.id}>{t.nome}</MenuItem>)}
          </TextField>
          <TextField label="Descrição" value={form.descricao} onChange={set("descricao")} fullWidth multiline rows={2} />
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap="12px">
            <TextField label="Data Agendada" type="date" value={form.dataAgendada} onChange={set("dataAgendada")} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Data Execução" type="date" value={form.dataExecucao} onChange={set("dataExecucao")} fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
          <TextField label="Estado" value="PENDENTE" fullWidth disabled helperText="Novas manutenções começam sempre como PENDENTE" />
          <TextField select label="Técnico Responsável" value={form.utilizadorId} onChange={set("utilizadorId")} fullWidth>
            <MenuItem value="">— Nenhum —</MenuItem>
            {tecnicos.map(u => <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>)}
          </TextField>
          <TextField select label="Máquina / Veículo" value={form.maquinaVeiculoId} onChange={set("maquinaVeiculoId")} fullWidth>
            <MenuItem value="">— Nenhuma —</MenuItem>
            {maquinas.map(m => <MenuItem key={m.id} value={m.id}>{m.modelo} — {m.matriculaNSerie ?? ""}</MenuItem>)}
          </TextField>
          <TextField select label="Peça de Inventário" value={form.inventarioId} onChange={set("inventarioId")} fullWidth>
            <MenuItem value="">— Nenhuma —</MenuItem>
            {inventario.map(i => <MenuItem key={i.id} value={i.id}>{i.descricao}</MenuItem>)}
          </TextField>
          <TextField label="Quantidade de Peças Utilizadas" type="number" value={form.quantidade} onChange={set("quantidade")}
            fullWidth inputProps={{ min: 1 }} disabled={!form.inventarioId}
            helperText={!form.inventarioId ? "Selecciona primeiro uma peça de inventário" : ""} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* ✅ MODAL EDITAR */}
      <Dialog open={modalEditar} onClose={() => setModalEditar(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <EditOutlinedIcon sx={{ mr: "8px", verticalAlign: "middle", color: "#1976d2" }} />
          Editar Manutenção #{editando?.id}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: "12px", pt: "16px !important" }}>
          <TextField select label="Tipo de Manutenção" value={formEditar.tipoManutencaoId ?? ""}
            onChange={e => { const t = TIPOS_MANUTENCAO.find(t => t.id === Number(e.target.value)); setFormEditar(f => ({ ...f, tipoManutencaoId: e.target.value, idTipo: t?.nome ?? "PREVENTIVA" })); }} fullWidth>
            {TIPOS_MANUTENCAO.map(t => <MenuItem key={t.id} value={t.id}>{t.nome}</MenuItem>)}
          </TextField>
          <TextField label="Descrição" value={formEditar.descricao ?? ""} onChange={setEdit("descricao")} fullWidth multiline rows={2} />
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap="12px">
            <TextField label="Data Agendada" type="date" value={formEditar.dataAgendada ?? ""} onChange={setEdit("dataAgendada")} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label="Data Execução" type="date" value={formEditar.dataExecucao ?? ""} onChange={setEdit("dataExecucao")} fullWidth InputLabelProps={{ shrink: true }} />
          </Box>
          <TextField select label="Técnico Responsável" value={formEditar.utilizadorId ?? ""} onChange={setEdit("utilizadorId")} fullWidth>
            <MenuItem value="">— Nenhum —</MenuItem>
            {tecnicos.map(u => <MenuItem key={u.id} value={u.id}>{u.nome}</MenuItem>)}
          </TextField>
          <TextField select label="Máquina / Veículo" value={formEditar.maquinaVeiculoId ?? ""} onChange={setEdit("maquinaVeiculoId")} fullWidth>
            <MenuItem value="">— Nenhuma —</MenuItem>
            {maquinas.map(m => <MenuItem key={m.id} value={m.id}>{m.modelo} — {m.matriculaNSerie ?? ""}</MenuItem>)}
          </TextField>
          <TextField select label="Peça de Inventário" value={formEditar.inventarioId ?? ""} onChange={setEdit("inventarioId")} fullWidth>
            <MenuItem value="">— Nenhuma —</MenuItem>
            {inventario.map(i => <MenuItem key={i.id} value={i.id}>{i.descricao}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalEditar(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardarEditar} disabled={saving}
            sx={{ backgroundColor: "#1976d2" }}>
            {saving ? "A guardar..." : "Guardar Alterações"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Manutencoes;
