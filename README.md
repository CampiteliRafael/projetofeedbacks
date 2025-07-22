# Feedback App - Aplicação Full-Stack com Autenticação

## Visão Geral

O Feedback App é uma aplicação completa desenvolvida para gerenciar feedbacks de usuários, desde a submissão até a visualização e moderação. Este projeto foi concebido como um ambiente de aprendizado e aplicação prática de conceitos de desenvolvimento Full-Stack, com um foco especial em segurança, qualidade de código e testes abrangentes.

## Tecnologias Utilizadas

*   **Front-end:** React, Vite, TypeScript
*   **Back-end:** Node.js, Express, TypeScript
*   **Banco de Dados:** MongoDB
*   **Autenticação:** JWT (JSON Web Tokens)
*   **Testes:** Jest, Supertest, Vitest, React Testing Library (RTL), MSW (Mock Service Worker)

## Como Rodar o Projeto

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

*   Node.js (versão 18 ou superior)
*   npm ou Yarn
*   MongoDB (local ou acesso a uma instância remota)

### Configuração do Back-end

1.  Clone o repositório:
    ```bash
    git clone https://github.com/CampiteliRafael/projetofeedbacks.git
    cd projetofeedbacks/backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    # ou yarn install
    ```
3.  Crie um arquivo `.env` na raiz do diretório `backend` com as seguintes variáveis de ambiente:
    ```
    PORT=3001
    MONGO_URI=mongodb://localhost:27017/feedback_app
    JWT_SECRET=sua_chave_secreta_jwt
    ```
4.  Inicie o servidor:
    ```bash
    npm start
    # ou yarn start
    ```

### Configuração do Front-end

1.  Navegue até o diretório do front-end:
    ```bash
    cd ../frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    # ou yarn install
    ```
3.  Crie um arquivo `.env` na raiz do diretório `frontend` com as seguintes variáveis de ambiente:
    ```
    VITE_API_URL=http://localhost:3001/api
    ```
4.  Inicie a aplicação:
    ```bash
    npm run dev
    # ou yarn dev
    ```

## Decisões Técnicas e Arquitetura

*   **Arquitetura RESTful:** A API foi projetada seguindo os princípios REST para comunicação clara e padronizada entre front-end e back-end.
*   **Autenticação JWT e RBAC:** Implementação robusta de autenticação baseada em tokens JWT, com controle de acesso baseado em papéis (Role-Based Access Control) para gerenciar permissões de usuários.
*   **Componentização no Front-end:** O React foi utilizado para criar componentes reutilizáveis e uma estrutura de UI modular, facilitando a manutenção e escalabilidade.
*   **Gerenciamento de Estado:** Utilização de Context API ou Redux (dependendo da complexidade) para um gerenciamento de estado eficiente no front-end.
*   **TypeScript em Todo o Ecossistema:** Adoção do TypeScript tanto no front-end quanto no back-end para garantir maior robustez, detecção precoce de erros e melhor manutenibilidade do código.

## Desafios e Soluções

Um dos maiores desafios neste projeto foi a configuração e integração de um ambiente de testes abrangente. Inicialmente, enfrentei dificuldades com a configuração do Jest no ambiente Vite, o que gerou frustração e perda de tempo.

**Solução:** Após uma pesquisa aprofundada e experimentação, decidi migrar a suíte de testes para o **Vitest**, que se mostrou muito mais compatível e performático com o Vite. Além disso, integrei o **MSW (Mock Service Worker)** para simular requisições de rede no front-end, permitindo testes de integração mais isolados e confiáveis. No back-end, o **Supertest** foi essencial para testar as rotas da API de forma eficiente.

Essa experiência não apenas resolveu os problemas técnicos, mas também aprofundou meu conhecimento sobre a importância da adaptabilidade em um ecossistema de desenvolvimento em constante evolução e a busca por ferramentas que otimizem o fluxo de trabalho.

## Aprendizados Chave

*   **TDD na Prática:** Aplicação da metodologia Test-Driven Development (TDD) em todas as camadas da aplicação, resultando em um código mais robusto, com menos bugs e mais fácil de manter.
*   **Segurança em Aplicações Web:** Aprofundamento em conceitos de autenticação (JWT) e autorização (RBAC), entendendo a importância de proteger rotas e dados sensíveis.
*   **Resolução de Problemas Complexos:** A experiência com a migração do Jest para o Vitest e a integração de MSW e Supertest reforçou minha capacidade de pesquisar, experimentar e encontrar soluções eficazes para desafios técnicos.
*   **Desenvolvimento Full-Stack Integrado:** Compreensão aprofundada de como as diferentes partes de uma aplicação Full-Stack se comunicam e interagem, desde a interface do usuário até o banco de dados.

## Contribuições

Todas as contribuições foram realizadas por Rafael Campiteli.

