import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";

// Ícones
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

const ItemMenu = ({ titulo, para, icone, selecionado, setSelecionado }) => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  return (
    <MenuItem
      active={selecionado === titulo}
      style={{ color: cores.grey[100] }}
      onClick={() => setSelecionado(titulo)}
      icon={icone}
    >
      <Typography>{titulo}</Typography>
      <Link to={para} />
    </MenuItem>
  );
};

const BarraLateral = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);
  const [estaColapsada, setEstaColapsada] = useState(false);
  const [selecionado, setSelecionado] = useState("Dashboard");

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${cores.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={estaColapsada}>
        <Menu iconShape="square">

          {/* LOGOTIPO E BOTÃO DO MENU */}
          <MenuItem
            onClick={() => setEstaColapsada(!estaColapsada)}
            icon={estaColapsada ? <MenuOutlinedIcon /> : undefined}
            style={{ margin: "10px 0 20px 0", color: cores.grey[100] }}
          >
            {!estaColapsada && (
              <Box display="flex" justifyContent="space-between" alignItems="center" ml="15px">
                <Typography variant="h3" color={cores.grey[100]} fontWeight="bold">
                  C.I.M.A
                </Typography>
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
                <img
                  alt="perfil-utilizador"
                  width="100px"
                  height="100px"
                  src={`../../assets/user.png`}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography variant="h2" color={cores.grey[100]} fontWeight="bold" sx={{ m: "10px 0 0 0" }}>
                  Mauricio
                </Typography>
                <Typography variant="h5" color={cores.greenAccent[500]}>
                  Administrador Principal
                </Typography>
              </Box>
            </Box>
          )}

          {/* ITENS DO MENU */}
          <Box paddingLeft={estaColapsada ? undefined : "10%"}>

            <ItemMenu titulo="Dashboard" para="/dashboard" icone={<HomeOutlinedIcon />} selecionado={selecionado} setSelecionado={setSelecionado} />

            {/* RECURSOS HUMANOS */}
            <Typography variant="h6" color={cores.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
              Recursos Humanos
            </Typography>
            <ItemMenu titulo="Utilizadores" para="/utilizadores" icone={<PeopleOutlinedIcon />} selecionado={selecionado} setSelecionado={setSelecionado} />
            <ItemMenu titulo="Perfis" para="/perfis" icone={<SecurityOutlinedIcon />} selecionado={selecionado} setSelecionado={setSelecionado} />

            {/* STOCK & COMPRAS */}
            <Typography variant="h6" color={cores.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
              Stock & Compras
            </Typography>
            <ItemMenu titulo="Inventário" para="/inventario" icone={<InventoryOutlinedIcon />} selecionado={selecionado} setSelecionado={setSelecionado} />
            <ItemMenu titulo="Fornecedores" para="/fornecedores" icone={<LocalShippingOutlinedIcon />} selecionado={selecionado} setSelecionado={setSelecionado} />
            <ItemMenu titulo="Mov. de Stock" para="/movimentos" icone={<SwapHorizOutlinedIcon />} selecionado={selecionado} setSelecionado={setSelecionado} />

            {/* MANUTENÇÃO */}
            <Typography variant="h6" color={cores.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
              Manutenção
            </Typography>
            <ItemMenu titulo="Manutenções" para="/manutencoes" icone={<BuildOutlinedIcon />} selecionado={selecionado} setSelecionado={setSelecionado} />
            <ItemMenu titulo="Tarefas" para="/tarefas" icone={<AssignmentOutlinedIcon />} selecionado={selecionado} setSelecionado={setSelecionado} />
            <ItemMenu titulo="Máq. / Veículos" para="/maquinas" icone={<PrecisionManufacturingOutlinedIcon />} selecionado={selecionado} setSelecionado={setSelecionado} />

            {/* ANÁLISE */}
            <Typography variant="h6" color={cores.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
              Análise
            </Typography>
            <ItemMenu titulo="Histórico" para="/historico" icone={<HistoryOutlinedIcon />} selecionado={selecionado} setSelecionado={setSelecionado} />
            <ItemMenu titulo="Relatórios" para="/relatorios" icone={<BarChartOutlinedIcon />} selecionado={selecionado} setSelecionado={setSelecionado} />

          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default BarraLateral;