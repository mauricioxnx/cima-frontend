import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Tarefas from "../../components/tarefas"; // <-- teu componente real
import { tokens } from "../../theme";

const Pie = () => {
  const tema = useTheme();
  const cores = tokens(tema.palette.mode);

  return (
    <Box m="20px">
      <Header title="Tarefas" subtitle="Gestão de tarefas do sistema" />

      <Box
        height="75vh"
        backgroundColor={cores.primary[400]}
        borderRadius="8px"
        p="20px"
      >
        <Tarefas />
      </Box>
    </Box>
  );
};

export default Pie;
