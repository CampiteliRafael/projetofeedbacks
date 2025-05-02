# Feedback App - Sistema de Coleta e Moderação de Feedbacks

## 📜 Descrição

Feedback App é uma aplicação web Full-Stack desenvolvida para simular um sistema real de coleta e gerenciamento de feedbacks. Usuários podem se registrar, autenticar, enviar seus feedbacks e visualizar o status deles. Administradores possuem um painel dedicado para visualizar todos os feedbacks, estatísticas gerais, e moderar o conteúdo (aprovar, rejeitar, deletar).

Este projeto demonstra a implementação de autenticação segura com JWT, autorização baseada em papéis (Role-Based Access Control - RBAC), arquitetura cliente-servidor com API REST, e boas práticas de desenvolvimento frontend e backend, incluindo tipagem com TypeScript e uma suíte de testes abrangente.

---


## ✨ Funcionalidades

* **Autenticação:**
    * Registro de novos usuários (com hashing de senha usando `bcryptjs`).
    * Login de usuários existentes.
    * Geração de JSON Web Tokens (JWT) na autenticação.
    * Logout.
* **Autorização (RBAC):**
    * Diferenciação entre papéis `user` e `adm`.
    * Middleware no backend para proteger rotas baseadas em autenticação e/ou role específica.
    * Componentes no frontend (`ProtectedRoute`, `RedirectIfLoggedIn`) para controlar o acesso a rotas da UI.
* **Fluxo do Usuário (`user`):**
    * Envio de novos feedbacks (associados ao seu usuário).
    * Visualização da lista dos *seus próprios* feedbacks e seus status (pendente, aprovado, rejeitado).
    * Redirecionamento automático para sua lista de feedbacks após o login.
* **Fluxo do Administrador (`adm`):**
    * Redirecionamento automático para o painel de administração após o login.
    * Visualização de estatísticas gerais (Total, Pendente, Aprovado, Rejeitado).
    * Visualização da lista de **todos** os feedbacks de todos os usuários.
    * Moderação de feedbacks: Aprovar ou Rejeitar feedbacks com status 'pendente'.
    * Exclusão de qualquer feedback.
* **Interface:**
    * Single Page Application (SPA) construída com React.
    * Componentes de UI reutilizáveis (`Button`, `InputField`, `FormErrorMessage`).
    * Estilização escopada com CSS Modules.
* **Testes:**
    * **Backend:** Testes unitários (Jest + Mocks) para controllers e middleware; Testes de integração (Jest + Supertest + MongoDB Memory Server) para os endpoints da API.
    * **Frontend:** Testes unitários (Vitest + React Testing Library + MSW) para componentes reutilizáveis, componentes de lógica/contexto e páginas com interação de API simulada.

---

## 🏛️ Arquitetura e Decisões de Design

* **Full-Stack:** Aplicação dividida em Frontend (React SPA) e Backend (Node.js/Express REST API).
* **API RESTful:** Backend expõe endpoints seguindo princípios REST para manipulação de recursos (usuários, feedbacks).
* **Autenticação Stateless (JWT):** Utiliza JSON Web Tokens para autenticação, armazenados no `localStorage` do cliente e enviados no header `Authorization` (Bearer Token) em requisições protegidas. A validação ocorre no backend usando um segredo (`JWT_SECRET`).
* **RBAC (Role-Based Access Control):** A autorização é feita no backend (via middleware `auth`) e refletida na UI (via `ProtectedRoute`), garantindo que apenas usuários com a `role` apropriada acessem determinados recursos ou executem certas ações.
* **Banco de Dados NoSQL:** MongoDB escolhido pela flexibilidade, com Mongoose para modelagem e interação no backend.
* **Gerenciamento de Estado (Frontend):** React Context API utilizada para gerenciar o estado global de autenticação (`user`, `isLoading`). Para estados locais, `useState` é utilizado.
* **Estilização (Frontend):** CSS Modules para garantir estilos escopados por componente, evitando conflitos e facilitando a manutenção. Um arquivo CSS global (`index.css`) é usado para estilos base e resets.
* **Testes:** Abordagem mista:
    * **Backend:** Foco em testes unitários com mocks para isolar a lógica e testes de integração para validar o fluxo completo da API com banco de dados em memória.
    * **Frontend:** Foco em testes unitários/componente com React Testing Library, seguindo a filosofia de testar como o usuário interage. MSW é usado para simular a API, isolando o frontend do backend real durante os testes.

---

## 🛠️ Tecnologias Utilizadas

### Linguagens Principais
* **TypeScript**
* **JavaScript (Node.js)**

### Frontend
* **React** (~v19)
* **Vite** (Build Tool / Dev Server)
* **React Router DOM** (~v6/v7)
* **Context API** (Gerenciamento de Estado)
* **CSS Modules**
* **`jwt-decode`**
* **`whatwg-fetch`** (Polyfill para testes)

### Backend
* **Node.js** (v20 LTS recomendado)
* **Express**
* **Mongoose** (ODM para MongoDB)
* **`jsonwebtoken`** (Manipulação de JWT)
* **`bcryptjs`** (Hashing de Senha)
* **`cors`**
* **`dotenv`**

### Banco de Dados
* **MongoDB**

### Testes
* **Backend:**
    * **Jest** (Test Runner / Framework)
    * **Supertest** (Requisições HTTP em testes de integração)
    * **MongoDB Memory Server** (Banco de dados em memória para testes)
    * **`ts-jest`** (Integração TS com Jest)
* **Frontend:**
    * **Vitest** (Test Runner / Framework)
    * **React Testing Library (RTL)**
    * **`@testing-library/jest-dom/vitest`** (Matchers DOM)
    * **`@testing-library/user-event`** (Simulação de Interação)
    * **Mock Service Worker (MSW)** (Mocking de API)
    * **`happy-dom` / `jsdom`** (Ambiente DOM para testes)

### Ferramentas Gerais
* **Git / GitHub**
* **NPM / Yarn**
* **ESLint / Prettier** (Qualidade e Formatação de Código)

---

## 🚀 Como Rodar Localmente

**Pré-requisitos:**

* Git
* Node.js (Versão LTS v20 ou v22 recomendada - use NVM para gerenciar)
* NPM ou Yarn
* Uma instância do MongoDB rodando (localmente ou via Atlas)

**Passos:**

1.  **Clonar o Repositório:**
    ```bash
    git clone [(https://github.com/CampiteliRafael/projetofeedbacks.git)]
    cd nome-da-pasta-do-projeto
    ```

2.  **Configurar Backend:**
    ```bash
    cd backend
    npm install # ou yarn install
    # Crie um arquivo .env na pasta backend
    # Adicione as variáveis conforme exemplo abaixo:
    cp .env.example .env # Se você criar um .env.example
    # Edite o .env com seus valores reais
    npm run build # Se houver um passo de compilação TS
    npm run dev # Para iniciar em modo de desenvolvimento (ou npm start)
    ```
    **Conteúdo Exemplo para `backend/.env`:**
    ```env
    PORT=5000
    MONGODB_URI=sua_string_conexao_mongodb # Ex: mongodb://127.0.0.1:27017/feedback_app
    JWT_SECRET=crie_uma_chave_secreta_muito_forte_aqui
    JWT_EXPIRES_IN_SECONDS=3600 # 1 hora
    ```

3.  **Configurar Frontend:**
    ```bash
    cd ../frontend # Volte para a raiz e entre no frontend
    npm install # ou yarn install
    # Crie um arquivo .env na pasta frontend (se necessário para VITE_API_BASE_URL, etc.)
    # Geralmente não precisa se a URL da API está fixa no código do serviço
    npm run dev # Inicia o servidor de desenvolvimento Vite
    ```

4.  **Acessar:** Abra seu navegador no endereço fornecido pelo Vite (geralmente `http://localhost:5173` ou similar).

---

## ✅ Rodando os Testes

* **Backend:**
    ```bash
    cd backend
    npm test
    ```
* **Frontend:**
    ```bash
    cd frontend
    npm test
    # ou:
    npm run test:watch # para modo watch
    npm run test:ui # para interface gráfica do Vitest
    ```

---
## 📚 Documentação da API

* `POST /api/auth/register`: Registra um novo usuário (`user`).
* `POST /api/auth/login`: Autentica um usuário e retorna um JWT.
* `GET /api/feedbacks`: Retorna todos os feedbacks (Admin).
* `POST /api/feedbacks`: Cria um novo feedback (User).
* `DELETE /api/feedbacks/:id`: Deleta um feedback (Admin).
* `PATCH /api/feedbacks/:id/status`: Atualiza o status ('aprovado' ou 'rejeitado') de um feedback (Admin).
* `GET /api/feedbacks/stats`: Retorna estatísticas dos feedbacks (Admin).
* `GET /api/feedbacks/my-feedbacks`: Retorna os feedbacks do usuário autenticado (User).


---

## 💡 Possíveis Melhorias Futuras

* Testes E2E (Cypress/Playwright).
* Paginação nas listas de feedback.
* Filtros e Ordenação nas listas.
* Notificações/Toasts para feedback ao usuário.
* Melhorias na UI/UX geral.
* Deploy contínuo (CI/CD).

---

## Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.

---

## 📧 Contato

[Rafael Campiteli Pereira] - [campitelir8@gmail.com] - [(https://www.linkedin.com/in/rafael-campiteli-pereira-033537240/)]

Link do Projeto: [(https://github.com/CampiteliRafael/projetofeedbacks.git)]
