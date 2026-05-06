// Importação de componentes do Material UI
import { Box, Button, TextField } from "@mui/material";

// Importação do Formik e do Yup para validação de formulários
import { Formik } from "formik";
import * as yup from "yup";

// Hook para media queries (responsividade)
import useMediaQuery from "@mui/material/useMediaQuery";

// Importação do cabeçalho
import { tokens } from "../../theme"
import Header from "../../components/Header"
// Componente do formulário de criação de utilizador
const Formulario = () => {
  // Verifica se o ecrã é maior que 600px
  const isNaoMobile = useMediaQuery("(min-width:600px)");

  // Função executada quando o formulário é submetido
  const handleFormSubmit = (valores) => {
    console.log(valores);
  };

  return (
    <Box m="20px">
      {/* Cabeçalho do formulário */}
      <Header
        title="CRIAR UTILIZADOR"
        subtitle="Criação de um Novo Perfil de Utilizador"
      />

      {/* Formulário com Formik */}
      <Formik
        onSubmit={handleFormSubmit}
        initialValues={valoresIniciais}
        validationSchema={validacaoFormulario}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            {/* Grid para os campos do formulário */}
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNaoMobile ? undefined : "span 4" },
              }}
            >
              {/* Primeiro Nome */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Primeiro Nome"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.firstName}
                name="firstName"
                error={!!touched.firstName && !!errors.firstName}
                helperText={touched.firstName && errors.firstName}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Último Nome */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Último Nome"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.lastName}
                name="lastName"
                error={!!touched.lastName && !!errors.lastName}
                helperText={touched.lastName && errors.lastName}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Email */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />

              {/* Contacto */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Número de Telefone"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.contact}
                name="contact"
                error={!!touched.contact && !!errors.contact}
                helperText={touched.contact && errors.contact}
                sx={{ gridColumn: "span 4" }}
              />

              {/* Morada 1 */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Morada 1"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address1}
                name="address1"
                error={!!touched.address1 && !!errors.address1}
                helperText={touched.address1 && errors.address1}
                sx={{ gridColumn: "span 4" }}
              />

              {/* Morada 2 */}
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Morada 2"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address2}
                name="address2"
                error={!!touched.address2 && !!errors.address2}
                helperText={touched.address2 && errors.address2}
                sx={{ gridColumn: "span 4" }}
              />
            </Box>

            {/* Botão de submissão */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Criar Novo Utilizador
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

// Expressão regular para validar números de telefone
const telefoneRegExp =
  /^((\+[1-9]{1,4}[ -]?)|(\([0-9]{2,3}\)[ -]?)|([0-9]{2,4})[ -]?)*?[0-9]{3,4}[ -]?[0-9]{3,4}$/;

// Validação do formulário com Yup
const validacaoFormulario = yup.object().shape({
  firstName: yup.string().required("Obrigatório"),
  lastName: yup.string().required("Obrigatório"),
  email: yup.string().email("Email inválido").required("Obrigatório"),
  contact: yup
    .string()
    .matches(telefoneRegExp, "Número de telefone inválido")
    .required("Obrigatório"),
  address1: yup.string().required("Obrigatório"),
  address2: yup.string().required("Obrigatório"),
});

// Valores iniciais do formulário
const valoresIniciais = {
  firstName: "",
  lastName: "",
  email: "",
  contact: "",
  address1: "",
  address2: "",
};

// Exportação do componente
export default Formulario;
