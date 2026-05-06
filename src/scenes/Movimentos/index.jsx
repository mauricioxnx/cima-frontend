// Importação do componente Box e do hook useTheme
import { Box, useTheme } from "@mui/material";

// 👉 IMPORTA A TUA PÁGINA DE MOVIMENTOS (ajusta o caminho)
import MovimentosComponent from "../../components/movimentos"; 

// Importação do cabeçalho
import Header from "../../components/Header";

// Importação das cores do tema
import { tokens } from "../../theme";

// Componente (antes era Geografia)
const Movimentos = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  return (
    <Box m="20px">
      {/* Cabeçalho */}
      <Header
        title="Movimentos"
        subtitle="Gestão de Movimentos de Stock"
      />

      {/* Container */}
      <Box
        height="75vh"
        border={`1px solid ${cores.grey[100]}`}
        borderRadius="4px"
        p="10px"
        overflow="auto"
      >
        {/* 👉 AQUI CHAMAS O COMPONENTE */}
        <MovimentosPage />
      </Box>
    </Box>
  );
};

export default Movimentos;