import { Box, IconButton, useTheme, Tooltip } from "@mui/material";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ColorModeContext, tokens } from "../../theme";
import { useAuth } from "../../hooks/useAuth";
import InputBase from "@mui/material/InputBase";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SearchIcon from "@mui/icons-material/Search";

const BarraSuperior = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);
  const modoCor = useContext(ColorModeContext);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>

      {/* BARRA DE PESQUISA */}
      <Box display="flex" backgroundColor={cores.primary[400]} borderRadius="3px">
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Pesquisar" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* ÍCONES */}
      <Box display="flex" alignItems="center">

        {/* Alternar tema */}
        <Tooltip title={tema.palette.mode === "dark" ? "Modo claro" : "Modo escuro"}>
          <IconButton onClick={modoCor.toggleColorMode}>
            {tema.palette.mode === "dark"
              ? <DarkModeOutlinedIcon />
              : <LightModeOutlinedIcon />
            }
          </IconButton>
        </Tooltip>

        {/* Notificações */}
        <Tooltip title="Notificações">
          <IconButton>
            <NotificationsOutlinedIcon />
          </IconButton>
        </Tooltip>

        {/* Definições */}
        <Tooltip title="Definições">
          <IconButton>
            <SettingsOutlinedIcon />
          </IconButton>
        </Tooltip>

        {/* Perfil */}
        <Tooltip title="Perfil">
          <IconButton>
            <PersonOutlinedIcon />
          </IconButton>
        </Tooltip>

        {/* Logout */}
        <Tooltip title="Terminar sessão">
          <IconButton onClick={handleLogout} sx={{ color: cores.redAccent[400] }}>
            <LogoutOutlinedIcon />
          </IconButton>
        </Tooltip>

      </Box>
    </Box>
  );
};

export default BarraSuperior;