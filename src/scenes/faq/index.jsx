// Importação de componentes do Material UI
import { Box, useTheme, Typography } from "@mui/material";

// Importação do cabeçalho
import Header from "../../components/Header";

// Importação do Accordion do Material UI
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

// Ícone para expandir o Accordion
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Importação das cores do tema
import { tokens } from "../../theme";

// Componente FAQ
const PerguntasFrequentes = () => {
  // Obtém o tema atual
  const tema = useTheme();

  // Define as cores com base no modo do tema
  const cores = tokens(tema.palette.mode);

  return (
    <Box m="20px">
      {/* Cabeçalho da página */}
      <Header
        title="FAQ"
        subtitle="Página de Perguntas Frequentes"
      />

      {/* Accordion 1 */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={cores.greenAccent[500]} variant="h5">
            Uma Pergunta Importante
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 2 */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={cores.greenAccent[500]} variant="h5">
            Outra Pergunta Importante
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 3 */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={cores.greenAccent[500]} variant="h5">
            A Tua Pergunta Favorita
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 4 */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={cores.greenAccent[500]} variant="h5">
            Uma Pergunta Aleatória
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>

      {/* Accordion 5 */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={cores.greenAccent[500]} variant="h5">
            A Pergunta Final
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

// Exportação do componente
export default PerguntasFrequentes;
