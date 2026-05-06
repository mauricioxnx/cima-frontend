# React + Vite

Este projeto utiliza React com Vite para criar uma aplicação web moderna, rápida e eficiente.

O Vite oferece um ambiente de desenvolvimento otimizado com atualização automática (HMR - Hot Module Replacement), permitindo visualizar alterações em tempo real sem recarregar toda a aplicação.

## Tecnologias Utilizadas

- React
- Vite
- JavaScript
- ESLint

## Plugins Oficiais Disponíveis

Atualmente, existem dois plugins oficiais principais para integração do React com Vite:

- `@vitejs/plugin-react`
  - Utiliza Babel (ou OXC em algumas configurações)
  - Suporte a Fast Refresh

- `@vitejs/plugin-react-swc`
  - Utiliza SWC
  - Compilação mais rápida e Fast Refresh

## React Compiler

O React Compiler não está ativado neste projeto devido ao impacto no desempenho durante desenvolvimento e build.

Para ativar e configurar:
https://react.dev/learn/react-compiler/installation

## Configuração do ESLint

O ESLint é utilizado para ajudar na padronização e qualidade do código.

Para aplicações maiores ou em produção, recomenda-se utilizar TypeScript juntamente com regras avançadas de lint.

Mais informações:
https://typescript-eslint.io

## Como Executar o Projeto

### Instalar dependências

```bash
npm install
