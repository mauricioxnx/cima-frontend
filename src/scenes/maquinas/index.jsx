import { Box, useTheme } from "@mui/material";

// 👉 importa a página de máquinas
import Maquinas from "../../components/maquinas";

import Header from "../../components/Header";
import { tokens } from "../../theme";

const maquinas = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  return (
    <Box m="20px">
      <Header
        title="Máquinas"
        subtitle="Gestão de Máquinas e Veículos"
      />

      <Box
        height="75vh"
        border={`1px solid ${cores.grey[100]}`}
        borderRadius="4px"
        p="10px"
        overflow="auto"
      >
        {/* 👉 Aqui entra a tua página */}
        <Maquinas />
      </Box>
    </Box>
  );
};

export default maquinas;