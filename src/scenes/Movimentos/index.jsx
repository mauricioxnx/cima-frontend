import { Box, useTheme } from "@mui/material";
import MovimentosComponent from "../../components/movimentos";
import Header from "../../components/Header";
import { tokens } from "../../theme";

const Movimentos = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  return (
    <Box m="20px">
      <Header title="Movimentos" subtitle="Gestão de Movimentos de Stock" />
      <Box
        height="75vh"
        border={`1px solid ${cores.grey[100]}`}
        borderRadius="4px"
        p="10px"
        overflow="auto"
      >
        <MovimentosComponent />  {/* ✅ nome correcto */}
      </Box>
    </Box>
  );
};

export default Movimentos;