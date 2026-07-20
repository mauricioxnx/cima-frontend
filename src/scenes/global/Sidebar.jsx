import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme, Tooltip } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import { useAuth } from "../../hooks/useAuth";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

const PERMISSOES = {
  ADMINISTRADOR:      ['dashboard','utilizadores','perfis','inventario','fornecedores','movimentos','manutencoes','tarefas','maquinas','historico','relatorios'],
  GERENTE_STOCK:      ['dashboard','inventario','fornecedores','movimentos'],
  GERENTE_MANUTENCAO: ['dashboard','manutencoes','tarefas','maquinas'],
  TECNICO:            ['dashboard','tarefas'],
}

const ItemMenu = ({ titulo, para, icone, selecionado, setSelecionado, bloqueado }) => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);
  const navigate = useNavigate();

  const handleClick = () => {
    if (bloqueado) return;
    setSelecionado(titulo);
    navigate(para);
  };

  return (
    <Tooltip
      title={bloqueado ? "Sem permissão para aceder a esta secção" : ""}
      placement="right"
    >
      <MenuItem
        active={!bloqueado && selecionado === titulo}
        style={{
          color: bloqueado ? cores.grey[500] : cores.grey[100],
          opacity: bloqueado ? 0.5 : 1,
          cursor: bloqueado ? "not-allowed" : "pointer",
        }}
        onClick={handleClick}
        icon={
          <Box display="flex" alignItems="center" position="relative">
            <Box sx={{ opacity: bloqueado ? 0.5 : 1 }}>{icone}</Box>
            {bloqueado && (
              <LockOutlinedIcon
                sx={{
                  fontSize: "12px",
                  position: "absolute",
                  bottom: -4,
                  right: -6,
                  color: cores.redAccent[400],
                }}
              />
            )}
          </Box>
        }
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
          <Typography sx={{ color: bloqueado ? cores.grey[500] : cores.grey[100] }}>
            {titulo}
          </Typography>
          {bloqueado && (
            <LockOutlinedIcon sx={{ fontSize: "14px", color: cores.redAccent[400], mr: "10px" }} />
          )}
        </Box>
      </MenuItem>
    </Tooltip>
  );
};

const BarraLateral = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);
  const { user } = useAuth();
  const [estaColapsada, setEstaColapsada] = useState(false);
  const [selecionado, setSelecionado] = useState("Dashboard");

  const iniciais = user?.nome
    ?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? 'AD'

  const perfil = user?.perfil ?? user?.perfilNome ?? ''
  const permissoes = PERMISSOES[perfil] ?? []
  const pode = (chave) => permissoes.includes(chave)

  return (
    <Box sx={{
      "& .pro-sidebar-inner": { background: `${cores.primary[400]} !important` },
      "& .pro-icon-wrapper": { backgroundColor: "transparent !important" },
      "& .pro-inner-item": { padding: "5px 35px 5px 20px !important" },
      "& .pro-inner-item:hover": { color: "#868dfb !important" },
      "& .pro-menu-item.active": { color: "#6870fa !important" },
    }}>
      <ProSidebar collapsed={estaColapsada}>
        <Menu iconShape="square">

          {/* LOGOTIPO */}
          <MenuItem
            onClick={() => setEstaColapsada(!estaColapsada)}
            icon={estaColapsada ? <MenuOutlinedIcon /> : undefined}
            style={{ margin: "10px 0 20px 0", color: cores.grey[100] }}
          >
            {!estaColapsada && (
              <Box display="flex" justifyContent="space-between" alignItems="center" ml="15px">
                <Typography variant="h3" color={cores.grey[100]} fontWeight="bold">C.I.M.A</Typography>
                <IconButton onClick={() => setEstaColapsada(!estaColapsada)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* PERFIL */}
          {!estaColapsada && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <Box width="100px" height="100px" borderRadius="50%"
                  display="flex" alignItems="center" justifyContent="center"
                  sx={{ background: cores.blueAccent[700], cursor: "pointer" }}>
                  <Typography variant="h3" color={cores.grey[100]} fontWeight="bold">
                    {iniciais}
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="center">
                <Typography variant="h2" color={cores.grey[100]} fontWeight="bold" sx={{ m: "10px 0 0 0" }}>
                  {user?.nome ?? 'Utilizador'}
                </Typography>
                <Typography variant="h5" color={cores.greenAccent[500]}>
                  {perfil}
                </Typography>
              </Box>
            </Box>
          )}

          {/* MENU */}
          <Box paddingLeft={estaColapsada ? undefined : "10%"}>

            <ItemMenu titulo="Dashboard" para="/dashboard"
              icone={<HomeOutlinedIcon />}
              selecionado={selecionado} setSelecionado={setSelecionado}
              bloqueado={!pode('dashboard')} />

            {/* RECURSOS HUMANOS */}
            <Typography variant="h6" color={cores.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
              Recursos Humanos
            </Typography>
            <ItemMenu titulo="Utilizadores" para="/utilizadores"
              icone={<PeopleOutlinedIcon />}
              selecionado={selecionado} setSelecionado={setSelecionado}
              bloqueado={!pode('utilizadores')} />
            <ItemMenu titulo="Perfis" para="/perfis"
              icone={<SecurityOutlinedIcon />}
              selecionado={selecionado} setSelecionado={setSelecionado}
              bloqueado={!pode('perfis')} />

            {/* STOCK & COMPRAS */}
            <Typography variant="h6" color={cores.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
              Stock & Compras
            </Typography>
            <ItemMenu titulo="Inventário" para="/inventario"
              icone={<InventoryOutlinedIcon />}
              selecionado={selecionado} setSelecionado={setSelecionado}
              bloqueado={!pode('inventario')} />
            <ItemMenu titulo="Fornecedores" para="/fornecedores"
              icone={<LocalShippingOutlinedIcon />}
              selecionado={selecionado} setSelecionado={setSelecionado}
              bloqueado={!pode('fornecedores')} />
            <ItemMenu titulo="Mov. de Stock" para="/movimentos"
              icone={<SwapHorizOutlinedIcon />}
              selecionado={selecionado} setSelecionado={setSelecionado}
              bloqueado={!pode('movimentos')} />

            {/* MANUTENÇÃO */}
            <Typography variant="h6" color={cores.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
              Manutenção
            </Typography>
            <ItemMenu titulo="Manutenções" para="/manutencoes"
              icone={<BuildOutlinedIcon />}
              selecionado={selecionado} setSelecionado={setSelecionado}
              bloqueado={!pode('manutencoes')} />
            <ItemMenu titulo="Tarefas" para="/tarefas"
              icone={<AssignmentOutlinedIcon />}
              selecionado={selecionado} setSelecionado={setSelecionado}
              bloqueado={!pode('tarefas')} />
            <ItemMenu titulo="Máq. / Veículos" para="/maquinas"
              icone={<PrecisionManufacturingOutlinedIcon />}
              selecionado={selecionado} setSelecionado={setSelecionado}
              bloqueado={!pode('maquinas')} />

            {/* ANÁLISE */}
            <Typography variant="h6" color={cores.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
              Análise
            </Typography>
            <ItemMenu titulo="Histórico" para="/historico"
              icone={<HistoryOutlinedIcon />}
              selecionado={selecionado} setSelecionado={setSelecionado}
              bloqueado={!pode('historico')} />
            <ItemMenu titulo="Relatórios" para="/relatorios"
              icone={<BarChartOutlinedIcon />}
              selecionado={selecionado} setSelecionado={setSelecionado}
              bloqueado={!pode('relatorios')} />

          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default BarraLateral;