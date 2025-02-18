# Free Quiz

### Server
# API de Autenticação SSO

Este projeto é uma API de autenticação SSO (Single Sign-On) que permite o registro, login e recuperação de senha de usuários. A API utiliza Express.js para o gerenciamento de rotas, bcrypt para criptografia de senhas, e JWT (JSON Web Tokens) para autenticação. Além disso, a API integra-se com o Firebase para autenticação via Google.

## Rotas Disponíveis

### Autenticação e Registro

- **GET /sso/authorizeCallback/:callbackURL**: Verifica se a URL de callback é permitida.
- **POST /sso/createRegisterCode**: Gera e envia um código de registro para o e-mail do usuário.
- **POST /sso/verifyCode/:code**: Verifica o código de registro e cria um novo usuário no banco de dados.

### Login

- **POST /sso/trylogin**: Realiza o login do usuário com e-mail e senha.
- **POST /sso/firebaseLogin**: Realiza o login do usuário utilizando o Firebase (Google).

### Verificação de Sessão

- **GET /sso/verifySession**: Verifica se o token JWT do usuário é válido e retorna os dados do usuário.

### Recuperação de Senha

- **POST /sso/sendResetPasswordEmail/:callback**: Envia um e-mail com um token para redefinição de senha.
- **GET /sso/verifyResetToken/:email/:token**: Verifica se o token de redefinição de senha é válido.
- **POST /sso/changePassword/:email/:token**: Altera a senha do usuário após a verificação do token.

## Como Utilizar

### Requisitos

- Node.js
- npm ou yarn
- Banco de dados MySQL

### Instalação
1. Clone o repositório:
   ```bash
   git clone https://github.com/SuperZNnn/sso-freequiz.git
   cd seu-repositorio

2. Instale as dependências:
    ```bash
    npm install

3. Configure o banco de dados:
    - Crie um banco de dados MySQL.
    - Configure as credenciais do banco de dados no arquivo `config/db.ts`.

4. Configure as variáveis de ambiente:
    Crie um arquivo `.env` na raiz do projeto e adicione as seguintes variáveis:
    ```env
    FREEQUIZ_SECRET=
    DATABASE_HOST=
    DATABASE_USER=
    DATABASE_PASSWORD=
    DATABASE_NAME=

5. Inicie o servidor:
    ```bash
    npm start