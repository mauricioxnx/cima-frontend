import { Box } from "@mui/material";
import Header from "../../components/Header";
import Inventario from "../../components/inventario";

const InventarioPage = () => {
  return (
    <Box m="20px">
      <Header title="INVENTÁRIO" subtitle="Gestão de Stock e Peças" />
      <Inventario />
    </Box>
  );
};

export default InventarioPage;