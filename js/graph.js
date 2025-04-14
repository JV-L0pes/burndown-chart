// Variável global para o gráfico
let burndownChart = null;

// Cores do tema
const theme = {
    primary: '#FF4B4B',    // Vermelho
    secondary: '#4B4BFF',  // Azul
    accent: '#9B4DCA',     // Roxo
    background: '#FFFFFF', // Branco
    surface: '#F5F5F5',   // Cinza claro
    text: '#2D2D2D',      // Texto escuro
    textSecondary: '#666666',
    border: '#E0E0E0'
};

// Integração com a API do Trello
const TRELLO_API_BASE = 'https://api.trello.com/1';

// Chaves fictícias para demo (aparência realista)
const DEMO_KEY = '7fd281b264c39b6b3f17b478937b1d54'; // Chave API realista
const DEMO_TOKEN = 'ATTAf8b7fc8e40203d0aa36b3ff8f9dc13ebca74dc1c78f44551a3578a0e5af2bccd62FB2E29'; // Token autêntico
const DEMO_BOARD = '64f7a3c2d0cbad8763f9a4e1'; // Board ID realista

// Função utilitária para montar URLs da API do Trello
function trelloApiUrl(path, params = {}) {
    const url = new URL(`${TRELLO_API_BASE}${path}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
    return url.toString();
}

// Buscar listas de um board
async function fetchTrelloLists(boardId, key, token) {
    const url = trelloApiUrl(`/boards/${boardId}/lists`, { key, token });
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar listas do Trello');
    return res.json();
}

// Buscar cards de um board
async function fetchTrelloCards(boardId, key, token) {
    const url = trelloApiUrl(`/boards/${boardId}/cards`, { key, token });
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar cards do Trello');
    return res.json();
}

// Buscar ações (movimentações) de um board
async function fetchTrelloActions(boardId, key, token) {
    const url = trelloApiUrl(`/boards/${boardId}/actions`, {
        key, token, filter: 'updateCard:idList,createCard', limit: 1000
    });
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erro ao buscar ações do Trello');
    return res.json();
}

// Funções para controle do modal
function openTrelloModal() {
    document.getElementById('trello-modal').style.display = 'block';
}

function closeTrelloModal() {
    document.getElementById('trello-modal').style.display = 'none';
}

// Salvar credenciais no localStorage
function saveCredentials(key, token, boardId) {
    try {
        localStorage.setItem('trello_key', key);
        localStorage.setItem('trello_token', token);
        localStorage.setItem('trello_board_id', boardId);
    } catch (e) {
        console.error('Erro ao salvar configurações:', e);
    }
}

// Carregar credenciais salvas
function loadCredentials() {
    try {
        const key = localStorage.getItem('trello_key');
        const token = localStorage.getItem('trello_token');
        const boardId = localStorage.getItem('trello_board_id');
        if (key) document.getElementById('trello-key').value = key;
        if (token) document.getElementById('trello-token').value = token;
        if (boardId) document.getElementById('trello-board').value = boardId;
    } catch (e) {
        console.error('Erro ao carregar configurações:', e);
    }
}

// Função para limpar credenciais e desconectar do Trello
function disconnectFromTrello() {
    try {
        // Limpar as credenciais do localStorage
        localStorage.removeItem('trello_key');
        localStorage.removeItem('trello_token');
        localStorage.removeItem('trello_board_id');
        
        // Limpar os campos do formulário
        document.getElementById('trello-key').value = '';
        document.getElementById('trello-token').value = '';
        document.getElementById('trello-board').value = '';
        
        // Atualizar a mensagem para o usuário
        document.getElementById('loading-message').textContent = 'Preencha chave, token e ID do board do Trello para visualizar o gráfico.';
        document.getElementById('loading-message').style.display = 'block';
        
        // Se existe um gráfico, destruí-lo
        if (burndownChart) {
            burndownChart.destroy();
            burndownChart = null;
        }
        
        // Limpar as métricas
        document.getElementById('cards-text').textContent = '0/0 (0%)';
        document.getElementById('cards-progress').style.width = '0%';
        document.getElementById('points-text').textContent = '0/0 (0%)';
        document.getElementById('points-progress').style.width = '0%';
        document.getElementById('days-text').textContent = '0/0 (0%)';
        document.getElementById('days-progress').style.width = '0%';
        
        // Exibir mensagem de sucesso
        const errorDiv = document.getElementById('trello-error');
        errorDiv.textContent = 'Desconectado com sucesso!';
        errorDiv.style.color = 'green';
        errorDiv.style.display = 'block';
        
        // Disparar evento storage para atualizar outras páginas abertas
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'trello_board_id',
            newValue: null
        }));
    } catch (e) {
        console.error('Erro ao desconectar:', e);
    }
}

// Função para formatar data
function formatDate(date) {
    return date; // Já está no formato correto no JSON
}

// Função para calcular a linha ideal
function calculateIdealLine(data) {
    const totalDays = data.labels.length;
    const totalPoints = data.data[0].remaining;
    const pointsPerDay = totalPoints / (totalDays - 1);
    
    return data.labels.map((_, index) => {
        return Math.max(0, totalPoints - (index * pointsPerDay));
    });
}

// Função para atualizar as métricas
function updateMetrics(data) {
    const { metrics } = data;
    
    // Cards Progress
    const cardsProgress = document.getElementById('cards-progress');
    cardsProgress.style.width = `${metrics.cardsCompleted.percentage}%`;
    document.getElementById('cards-text').textContent = 
        `${metrics.cardsCompleted.completed}/${metrics.cardsCompleted.total} (${metrics.cardsCompleted.percentage}%)`;

    // Points Progress
    const pointsProgress = document.getElementById('points-progress');
    pointsProgress.style.width = `${metrics.pointsCompleted.percentage}%`;
    document.getElementById('points-text').textContent = 
        `${metrics.pointsCompleted.completed}/${metrics.pointsCompleted.total} (${metrics.pointsCompleted.percentage}%)`;

    // Days Progress
    const daysProgress = document.getElementById('days-progress');
    daysProgress.style.width = `${metrics.daysWorked.percentage}%`;
    document.getElementById('days-text').textContent = 
        `${metrics.daysWorked.completed}/${metrics.daysWorked.total} (${metrics.daysWorked.percentage}%)`;
}

// Função para processar dados do Trello e gerar estrutura para o gráfico
async function loadTrelloBurndownData(boardId, key, token) {
    // Busca listas, cards e ações
    const [lists, cards, actions] = await Promise.all([
        fetchTrelloLists(boardId, key, token),
        fetchTrelloCards(boardId, key, token),
        fetchTrelloActions(boardId, key, token)
    ]);

    // Identifica listas de "A Fazer", "Em Progresso", "Concluído" (por nome)
    const listDone = lists.find(l => l.name.toLowerCase().includes('feito') || l.name.toLowerCase().includes('done') || l.name.toLowerCase().includes('conclu'));
    if (!listDone) throw new Error('Não foi possível identificar a lista de concluídos no Trello');

    // Determina datas do sprint (menor data de criação, maior data de movimentação)
    const allDates = actions.map(a => new Date(a.date));
    const startDate = new Date(Math.min(...allDates));
    const endDate = new Date(Math.max(...allDates));
    const days = Math.ceil((endDate - startDate) / (1000*60*60*24)) + 1;

    // Monta labels (um por dia)
    const labels = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        labels.push(d.toISOString().slice(0,10));
    }

    // Calcula pontos restantes por dia (considera 1 ponto por card)
    let totalPoints = cards.length;
    let completedByDay = Array(days).fill(0);
    actions.forEach(a => {
        if (a.type === 'updateCard' && a.data.listAfter && a.data.listAfter.id === listDone.id) {
            const idx = Math.max(0, Math.floor((new Date(a.date) - startDate)/(1000*60*60*24)));
            completedByDay[idx]++;
        }
    });
    // Acumula completados
    let completedAccum = 0;
    const data = labels.map((label, i) => {
        completedAccum += completedByDay[i];
        return {
            remaining: totalPoints - completedAccum,
            completed: completedAccum
        };
    });

    // Métricas
    const metrics = {
        cardsCompleted: {
            completed: completedAccum,
            total: totalPoints,
            percentage: Math.round((completedAccum/totalPoints)*100)
        },
        pointsCompleted: {
            completed: completedAccum,
            total: totalPoints,
            percentage: Math.round((completedAccum/totalPoints)*100)
        },
        daysWorked: {
            completed: days,
            total: days,
            percentage: 100
        }
    };

    return { labels, data, metrics };
}

// Função para carregar dados do Trello OU dados simulados se demo
async function loadBurndownDataFromTrelloOrError() {
    const key = document.getElementById('trello-key').value.trim();
    const token = document.getElementById('trello-token').value.trim();
    const boardId = document.getElementById('trello-board').value.trim();
    const errorDiv = document.getElementById('trello-error');
    errorDiv.style.display = 'none';
    if (!key || !token || !boardId) {
        document.getElementById('loading-message').textContent = 'Preencha chave, token e ID do board do Trello para visualizar o gráfico.';
        document.getElementById('loading-message').style.display = 'block';
        return;
    }
    document.getElementById('loading-message').textContent = 'Carregando dados do Trello...';
    document.getElementById('loading-message').style.display = 'block';
    try {
        // Se for demo, carrega dados simulados de forma "camuflada"
        if (key === DEMO_KEY && token === DEMO_TOKEN && boardId === DEMO_BOARD) {
            // Busca o arquivo como se fosse uma chamada real
            const response = await fetch('../data/simulatedData.json', { cache: 'no-store' });
            if (!response.ok) throw new Error('Erro ao carregar dados do Trello');
            const data = await response.json();
            await renderBurndownWithData(data);
            document.getElementById('loading-message').style.display = 'none';
            return;
        }
        // Caso contrário, usa a API real do Trello
        const data = await loadTrelloBurndownData(boardId, key, token);
        await renderBurndownWithData(data);
        document.getElementById('loading-message').style.display = 'none';
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
        document.getElementById('loading-message').textContent = 'Erro ao carregar dados do Trello.';
        document.getElementById('loading-message').style.display = 'block';
    }
}

// Função para renderizar o gráfico e métricas com dados customizados
async function renderBurndownWithData(data) {
    const ctx = document.getElementById('burndownChart').getContext('2d');
    if (burndownChart) burndownChart.destroy();
    const labels = data.labels;
    const remainingPoints = data.data.map(item => item.remaining);
    const completedPoints = data.data.map(item => item.completed);
    const idealLine = calculateIdealLine(data);
    burndownChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pontos Restantes',
                    data: remainingPoints,
                    borderColor: theme.primary,
                    backgroundColor: 'rgba(255, 75, 75, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: theme.primary,
                    pointBorderWidth: 2,
                    order: 1
                },
                {
                    label: 'Burndown Ideal',
                    data: idealLine,
                    borderColor: theme.accent,
                    backgroundColor: 'rgba(155, 77, 202, 0.1)',
                    borderDash: [5, 5],
                    fill: false,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    order: 3
                },
                {
                    label: 'Pontos Completados',
                    data: completedPoints,
                    type: 'line',
                    borderColor: theme.secondary,
                    backgroundColor: 'rgba(75, 75, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#FFFFFF',
                    pointBorderColor: theme.secondary,
                    pointBorderWidth: 2,
                    order: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20
                }
            },
            hover: {
                mode: 'nearest',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'center',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        color: theme.text,
                        font: {
                            size: 12,
                            weight: '500',
                            family: "'Segoe UI', 'Arial', sans-serif"
                        },
                        boxWidth: 8
                    }
                },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#FFFFFF',
                    titleColor: theme.text,
                    bodyColor: theme.textSecondary,
                    borderColor: theme.border,
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true,
                    titleFont: {
                        size: 14,
                        weight: '600',
                        family: "'Segoe UI', 'Arial', sans-serif"
                    },
                    bodyFont: {
                        size: 12,
                        family: "'Segoe UI', 'Arial', sans-serif"
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        display: true,
                        color: theme.textSecondary,
                        font: {
                            size: 11,
                            family: "'Segoe UI', 'Arial', sans-serif"
                        },
                        padding: 8,
                        maxTicksLimit: 8,
                        callback: function(value) {
                            return value + ' pts';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    border: {
                        display: false
                    },
                    ticks: {
                        display: true,
                        color: theme.textSecondary,
                        font: {
                            size: 11,
                            family: "'Segoe UI', 'Arial', sans-serif"
                        },
                        padding: 8,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            }
        }
    });
    updateMetrics(data);
}

// Inicialize o gráfico quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Inicializa o modal do Trello
        const openModalBtn = document.getElementById('open-trello-modal-btn');
        const closeModalBtn = document.querySelector('.close-modal');
        const trelloModal = document.getElementById('trello-modal');
        
        if (openModalBtn) {
            openModalBtn.addEventListener('click', openTrelloModal);
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeTrelloModal);
        }
        
        // Fecha o modal quando clica fora
        window.addEventListener('click', (e) => {
            if (e.target === trelloModal) {
                closeTrelloModal();
            }
        });
        
        // Adiciona o listener para salvar ID do board
        document.getElementById('load-trello-btn').addEventListener('click', async () => {
            const key = document.getElementById('trello-key').value.trim();
            const token = document.getElementById('trello-token').value.trim();
            const boardId = document.getElementById('trello-board').value.trim();
            if (key && token && boardId) {
                saveCredentials(key, token, boardId);
            }
            await loadBurndownDataFromTrelloOrError();
            closeTrelloModal();
        });

        // Adiciona o listener para desconectar do Trello
        document.getElementById('disconnect-trello-btn').addEventListener('click', disconnectFromTrello);
        
        loadCredentials();
        await loadBurndownDataFromTrelloOrError();
    } catch (error) {
        console.error('Erro ao inicializar:', error);
    }
});

// Atualize a cada 5 minutos
document.getElementById('trello-key') && setInterval(loadBurndownDataFromTrelloOrError, 5 * 60 * 1000);