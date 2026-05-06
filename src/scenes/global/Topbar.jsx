// Importação de componentes do Material UI
import { Box, IconButton, useTheme } from "@mui/material";

// Importação do hook useContext
import { useContext } from "react";

// Importação do contexto de tema e cores
import { ColorModeContext, tokens } from "../../theme";

// Importação do campo de texto base
import InputBase from "@mui/material/InputBase";

// Importação dos ícones
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";

// Componente da barra superior
const BarraSuperior = () => {
  // Obtém o tema atual
  const tema = useTheme();

  // Define as cores com base no modo do tema
  const cores = tokens(tema.palette.mode);

  // Acesso ao contexto de mudança de modo (claro/escuro)
  const modoCor = useContext(ColorModeContext);

  return (
    // Container principal da barra superior
    <Box display="flex" justifyContent="space-between" p={2}>
      
      {/* BARRA DE PESQUISA */}
      <Box
        display="flex"
        backgroundColor={cores.primary[400]}
        borderRadius="3px"
      >
        <InputBase
          sx={{ ml: 2, flex: 1 }}
          placeholder="Pesquisar"
        />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* ÍCONES DA BARRA SUPERIOR */}
      <Box display="flex">
        {/* Botão para alternar modo claro/escuro */}
        <IconButton onClick={modoCor.toggleColorMode}>
          {tema.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        {/* Notificações */}
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>

        {/* Definições */}
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>

        {/* Perfil do utilizador */}
        <IconButton>
          <PersonOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

// Exportação do componente
export default BarraSuperior;
