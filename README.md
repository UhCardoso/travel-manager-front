# Guia do Projeto Laravel

Este README foi criado para ajudar você a entender e executar o projeto de Gestão de Viagens. Use os links abaixo para navegar pelas seções.

---

[1 Instalação](#instalação)
<br/>
[2 Sobre o Projeto](#sobre-o-projeto)
<br/>
[3 Telas do Projeto](#telas-do-projeto)

---

## Instalação

### Requisitos

Para rodar este projeto, você precisa ter as seguintes ferramentas instaladas:

* **Node.js:** Versão 20.19.3 ou superior.
    * [Link para download](https://nodejs.org/en/download/)

### Passos de Instalação

Siga os comandos abaixo para configurar o projeto:

1.  **Clone o repositório:**
    ```bash
    git clone (https://github.com/UhCardoso/travel-manager-front.git)
    ```

2.  **Acesse o diretório do projeto:**
    ```bash
    cd travel-manager-front
    ```

3.  **Instale as dependências do NPM:**
    ```bash
    npm install
    ```

4.  **Inicie o projeto:**
    ```bash
    npm run dev
    ```

5.  **Verifique se o projeto está funcionando:**
    O projeto deve estar rodando em [http://localhost:3000](http://localhost:3000).

---

## Sobre o Projeto

### Acesso login admin: 
- email: admin@admin.com
- senha: admin123

Este projeto é um portal de gerenciamento de viagens com dois tipos de acesso distintos: um para usuários comuns e outro para administradores.

* **Usuário Comum:** Pode registrar novas viagens, visualizar o histórico de solicitações e solicitar o cancelamento de uma viagem, desde que ela ainda não tenha sido aprovada.

* **Administrador:** Possui um portal exclusivo para gerenciar todos os pedidos de viagem. Ele pode alterar o status de uma solicitação para **aprovado** ou **cancelado**. Uma vez que a viagem é aprovada, seu status não pode mais ser alterado para cancelado.


Qualquer alteração no status de uma viagem envia uma notificação por e-mail para o usuário responsável pela solicitação.

---

## Telas do Projeto

### Tela de Registro de Viagem

Quando o usuário digita o nome do local de destino, uma lista dinâmica de lugares aparece com detalhes como região, país e estado. Esses detalhes ajudam o usuário a escolher o destino correto e são salvos no banco de dados.
<img width="1914" height="806" alt="Captura de tela de 2025-08-26 10-45-37" src="https://github.com/user-attachments/assets/8d5c34ba-6742-4edb-98f6-be4e5594c238" />

### Tela de Listagem de Viagens (Usuário)
Nesta tela, o usuário pode ver todas as viagens que ele agendou com paginação. Ele tem a opção de cancelar uma viagem, desde que o status dela não tenha sido alterado para "aprovado" pelo administrador.<br/>
<img width="1914" height="806" alt="Captura de tela de 2025-08-26 10-45-43" src="https://github.com/user-attachments/assets/ba9c9e9d-bd64-42fe-a925-207a1356dddb" /><br/>
<img width="1914" height="806" alt="Captura de tela de 2025-08-26 10-45-37" src="https://github.com/user-attachments/assets/276c8dc8-6102-4427-9726-4e29522b1318" />
### Tela de Viagens (Admin)
Ao acessar a tela de listagem de viagens com paginação, o administrador pode clicar para alterar o status de uma viagem recebida. O status só pode ser alterado se a viagem não tiver sido aprovada anteriormente.
<img width="1914" height="806" alt="Captura de tela de 2025-08-26 10-50-09" src="https://github.com/user-attachments/assets/e17532a1-6d4f-4abd-a202-71591da6e90c" />
