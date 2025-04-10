# Burndown Chart

Um gráfico de burndown interativo para visualização do progresso de sprints.

## Estrutura do Projeto

```
burndown/
├── css/              # Estilos
│   └── style.css
├── js/               # JavaScript
│   └── graph.js
├── data/             # Dados simulados
│   └── simulatedData.json
├── pages/            # Páginas da aplicação
│   └── graph.html    # Página do gráfico
├── reference/        # Arquivos de referência
│   └── trello-reference.json
├── index.html        # Página inicial
└── README.md         # Este arquivo
```

## Páginas

- **Home**: Página inicial com acesso ao gráfico e histórico
- **Graph**: Visualização do gráfico de burndown

## Funcionalidades

- Gráfico de burndown com dados simulados
- Atualização automática a cada 5 minutos
- Métricas de progresso do sprint
- Interface responsiva
- Suporte a temas claros/escuros

## Como Usar

1. Clone o repositório
2. Abra o `index.html` em um servidor web local
   - Você pode usar o Live Server do VS Code
   - Ou qualquer outro servidor HTTP simples
3. Navegue até a página do gráfico clicando em "Ver Gráfico"

## Desenvolvimento

Para modificar os dados simulados, edite o arquivo `data/simulatedData.json`. O formato esperado é:

```json
{
    "sprintInfo": {
        "name": "Nome do Sprint",
        "startDate": "YYYY-MM-DD",
        "endDate": "YYYY-MM-DD",
        "totalPoints": 100
    },
    "dailyData": [
        { "date": "DD/MM", "remaining": 100, "completed": 0 },
        ...
    ]
}
```

## GitHub Pages

O projeto está configurado para deploy automático no GitHub Pages através do workflow em `.github/workflows/deploy.yml`.
