# 🧠 MindMesh — Mapa Mental Colaborativo em Tempo Real

O **MindMesh** é uma aplicação fullstack inovadora que permite criar **mapas mentais colaborativos** em tempo real. Desenvolvido para explorar ideias de forma visual e dinâmica, o projeto combina **integração em tempo real**, **persistência em grafos** e uma interface interativa e fluida.

---

## 🚀 Stack Tecnológica

### **Frontend**

- React.js (Vite)
- Zustand (gerenciamento de estado)
- D3.js (visualização dos nós e conexões)
- WebSocket client nativo
- TailwindCSS (estilização)

### **Backend**

- Spring Boot (Java 21+)
- Spring WebSocket (com STOMP para comunicação bidirecional)
- Spring Data Neo4j (persistência em grafo)
- Lombok (boilerplate reduction)

### **Banco de Dados**

- Neo4j (armazenamento de nós e relações)

---

## 🧩 Conceito Principal

Cada ideia é representada como um **nó** e as conexões entre ideias formam **arestas** dentro de um **grafo semântico**.  
Os usuários podem colaborar em tempo real — adicionando, renomeando e conectando nós simultaneamente.

---

## ⚙️ Funcionalidades Principais

- 🔗 **Criação e edição de nós** (ideias)
- 🧠 **Conexão entre nós** (relacionamentos visuais)
- 👥 **Colaboração em tempo real** via WebSocket
- 💾 **Persistência no Neo4j**
- ⏳ **Histórico e versionamento de alterações**
- 🎨 **Visualização interativa com zoom, drag e animações**

---

## 📁 Estrutura de Pastas

```
mindmesh/
├── backend/
│   ├── src/main/java/com/mindmesh/
│   │   ├── config/         # Configurações WebSocket e Neo4j
│   │   ├── controller/     # Endpoints REST e STOMP
│   │   ├── dto/            # DTOs de requisição e resposta
│   │   ├── model/          # Entidades de Nó e Relação
│   │   ├── repository/     # Repositórios Neo4j
│   │   ├── service/        # Lógica de negócio
│   │   └── MindMeshApp.java
│   └── resources/
│
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes de UI
│   │   ├── store/          # Zustand store
│   │   ├── hooks/          # Hooks customizados
│   │   ├── utils/          # Funções auxiliares
│   │   └── App.jsx
│   └── package.json
│
├── docker-compose.yml      # Configuração do Neo4j via Docker Compose
└── README.md
```

---

## 🧠 Modelo de Dados (Neo4j)

```
(:Node { id, title, x, y })
(:Node)-[:CONNECTED_TO]->(:Node)
```

### Exemplo de entidade Java

```java
@Node("MindNode")
public class MindNode {
    @Id private Long id;
    private String title;
    private String description;
    private double x;
    private double y;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Relationship(type = "CONNECTED_TO")
    private List<MindNode> connections = new ArrayList<>();
}
```

---

## 🌐 WebSocket Channels

| Tópico         | Descrição                                      |
| -------------- | ---------------------------------------------- |
| `/topic/nodes` | Atualizações de criação/edição/exclusão de nós |
| `/app/connect` | Solicitação de conexão entre nós               |
| `/topic/graph` | Broadcast de estado completo do grafo          |

---

## 🧠 Fluxo de Execução

1. Usuário cria ou edita um nó → evento enviado via WebSocket
2. Spring Broadcasts atualização para todos os clientes conectados
3. Frontend atualiza grafo dinamicamente via D3.js
4. Mudanças persistem no **Neo4j** via serviço de sincronização

---

## 🧪 Endpoints REST (exemplo)

| Método                    | Rota                     | Descrição |
| ------------------------- | ------------------------ | --------- |
| `GET /api/nodes`          | Lista todos os nós       |
| `POST /api/nodes`         | Cria um novo nó          |
| `PUT /api/nodes/{id}`     | Atualiza um nó existente |
| `DELETE /api/nodes/{id}`  | Remove um nó             |
| `POST /api/nodes/connect` | Conecta dois nós         |

---

## 🧰 Como Executar

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Banco de Dados

Execute o Neo4j via Docker Compose:

```bash
docker-compose up -d
```

Isso iniciará o Neo4j com as configurações definidas no `docker-compose.yml` (porta 7474 para web UI, 7687 para Bolt, autenticação neo4j/testpassword).

---

## 📈 Possíveis Extensões Futuras

- ✏️ Sistema de comentários em cada nó
- 🧩 Clustering automático de ideias similares
- 🔐 Autenticação e permissões de edição
- 🤖 Sugestão automática de conexões com IA (ex: embeddings semânticos)

---

## 👨‍💻 Autor

**Yuri Cristian Pedrosa de Oliveira**
