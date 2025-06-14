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
    border: '#E0E0E0',
    success: '#4CAF50',   // Verde
    warning: '#FFC107',   // Amarelo
    error: '#F44336'      // Vermelho erro
};

// Chaves para demo (APENAS SIMULAÇÃO)
const DEMO_KEYS = {
    'sprint-1': {
        key: '7fd281b264c39b6b3f17b478937b1d54',
        token: 'ATTAf8b7fc8e40203d0aa36b3ff8f9dc13ebca74dc1c78f44551a3578a0e5af2bccd62FB2E29',
        board: '64f7a3c2d0cbad8763f9a4e1'
    },
    'sprint-2': {
        key: '8e392c7a5f1d4b6a9c8e2d1f3a5b7c9d',
        token: 'ATTAf9c8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3',
        board: '75e4b2d1c9a8f7e6d5c4b3a2f1e0d9c8'
    },
    'sprint-3': {
        key: '3c7f9e2a1b5d8f4e6c9a2d7b3f8e1c5a',
        token: 'ATTAc3f7b9e2a1d5f8e4c6a9d2b7f3e8c1a5f9d2b7e3c8a1f5d9e2c7b4a8f1e6d3c9b2a7f5e8c1',
        board: '89a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5'
    }
};

// Função para obter o ID da sprint da URL
function getSprintIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('sprint') || 'sprint-1';
}

// Função para carregar dados simulados baseado na sprint
async function loadSimulatedData(sprintId) {
    try {
        let dataFile = 'simulatedData.json'; // Sprint 1 (default)
        
        if (sprintId === 'sprint-2') {
            dataFile = 'simulatedDataSprint2.json';
        } else if (sprintId === 'sprint-3') {
            dataFile = 'simulatedDataSprint3.json';
        }
        
        console.log(`Carregando dados simulados para sprint: ${sprintId}`);
        console.log(`Arquivo de dados: ${dataFile}`);
        
        const response = await fetch(`../data/${dataFile}`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar dados simulados: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao carregar dados simulados:', error);
        throw error;
    }
}

// Função para identificar a sprint pelas credenciais
function getSprintIdByCredentials(key, token, boardId) {
    for (const [sprintId, creds] of Object.entries(DEMO_KEYS)) {
        if (key === creds.key && token === creds.token && boardId === creds.board) {
            return sprintId;
        }
    }
    return null;
}

// Função para verificar se as credenciais são válidas (simuladas)
function isValidCredentials(key, token, boardId) {
    return Object.values(DEMO_KEYS).some(creds => 
        key === creds.key && token === creds.token && boardId === creds.board
    );
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

// Função para limpar credenciais e desconectar
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
        document.getElementById('loading-message').textContent = 'Preencha as credenciais para visualizar o gráfico.';
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

// Função para carregar dados simulados
async function loadBurndownData() {
    const key = document.getElementById('trello-key').value.trim();
    const token = document.getElementById('trello-token').value.trim();
    const boardId = document.getElementById('trello-board').value.trim();
    const errorDiv = document.getElementById('trello-error');
    errorDiv.style.display = 'none';

    if (!key || !token || !boardId) {
        document.getElementById('loading-message').textContent = 'Preencha as credenciais para visualizar o gráfico.';
        document.getElementById('loading-message').style.display = 'block';
        return;
    }

    // Verifica se as credenciais são válidas
    if (!isValidCredentials(key, token, boardId)) {
        errorDiv.textContent = 'Credenciais inválidas. Use as credenciais de uma das sprints disponíveis.';
        errorDiv.style.display = 'block';
        document.getElementById('loading-message').textContent = 'Erro: Credenciais inválidas.';
        return;
    }

    document.getElementById('loading-message').textContent = 'Carregando dados...';
    document.getElementById('loading-message').style.display = 'block';

    try {
        // Detecta sprint pelas credenciais
        const sprintId = getSprintIdByCredentials(key, token, boardId) || getSprintIdFromUrl();
        console.log('Carregando sprint:', sprintId);
        
        const data = await loadSimulatedData(sprintId);
        await renderBurndownWithData(data);
        document.getElementById('loading-message').style.display = 'none';
        updateSprintTitle(sprintId);
    } catch (err) {
        console.error('Erro ao carregar dados:', err);
        errorDiv.textContent = err.message;
        errorDiv.style.display = 'block';
        document.getElementById('loading-message').textContent = 'Erro ao carregar dados.';
    }
}

// Função para atualizar o título da sprint dinamicamente
function updateSprintTitle(sprintId) {
    const titleEl = document.getElementById('sprint-title');
    if (!titleEl) return;
    if (sprintId === 'sprint-3') {
        titleEl.textContent = 'Métricas da Sprint 3';
    } else if (sprintId === 'sprint-2') {
        titleEl.textContent = 'Métricas da Sprint 2';
    } else {
        titleEl.textContent = 'Métricas da Sprint 1';
    }
}

// Função para renderizar o gráfico e métricas
async function renderBurndownWithData(data) {
    const ctx = document.getElementById('burndownChart').getContext('2d');
    if (burndownChart) burndownChart.destroy();
    
    const labels = data.labels;
    const remainingPoints = data.data.map(item => item.remaining);
    const completedPoints = data.data.map(item => item.completed);
    const idealLine = calculateIdealLine(data);

    // Configuração do gradiente para o gráfico
    const gradientRemaining = ctx.createLinearGradient(0, 0, 0, 400);
    gradientRemaining.addColorStop(0, 'rgba(255, 75, 75, 0.2)');
    gradientRemaining.addColorStop(1, 'rgba(255, 75, 75, 0)');

    const gradientCompleted = ctx.createLinearGradient(0, 0, 0, 400);
    gradientCompleted.addColorStop(0, 'rgba(75, 75, 255, 0.2)');
    gradientCompleted.addColorStop(1, 'rgba(75, 75, 255, 0)');

    burndownChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Pontos Restantes',
                    data: remainingPoints,
                    borderColor: theme.primary,
                    backgroundColor: gradientRemaining,
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
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
                    backgroundColor: gradientCompleted,
                    tension: 0.4,
                    fill: true,
                    borderWidth: 3,
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
            interaction: {
                mode: 'index',
                intersect: false
            },
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20
                }
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
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(1) + ' pontos';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true,
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0.05)'
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
                        minRotation: 45,
                        callback: function(value, index) {
                            const label = this.getLabelForValue(index);
                            const [ano, mes, dia] = label.split('-');
                            return `${dia}/${mes}`;
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });

    // Atualiza as métricas com animação
    updateMetricsWithAnimation(data.metrics);
}

// Função para atualizar métricas com animação
function updateMetricsWithAnimation(metrics) {
    const elements = {
        cardsCompleted: {
            progress: document.getElementById('cards-progress'),
            text: document.getElementById('cards-text')
        },
        pointsCompleted: {
            progress: document.getElementById('points-progress'),
            text: document.getElementById('points-text')
        },
        daysWorked: {
            progress: document.getElementById('days-progress'),
            text: document.getElementById('days-text')
        }
    };

    // Anima cada métrica
    Object.entries(metrics).forEach(([key, value]) => {
        const element = elements[key];
        if (!element) return;

        // Anima a barra de progresso
        element.progress.style.transition = 'width 1s ease-in-out';
        element.progress.style.width = `${value.percentage}%`;

        // Anima o texto
        let currentValue = 0;
        const targetValue = value.completed;
        const duration = 1000;
        const steps = 60;
        const increment = targetValue / steps;
        const stepTime = duration / steps;

        const updateText = () => {
            currentValue = Math.min(currentValue + increment, targetValue);
            element.text.textContent = `${Math.round(currentValue)}/${value.total} (${value.percentage}%)`;
            
            if (currentValue < targetValue) {
                setTimeout(updateText, stepTime);
            }
        };

        updateText();
    });
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Inicializa o modal
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
        
        // Listener para carregar dados
        document.getElementById('load-trello-btn').addEventListener('click', async () => {
            const key = document.getElementById('trello-key').value.trim();
            const token = document.getElementById('trello-token').value.trim();
            const boardId = document.getElementById('trello-board').value.trim();
            if (key && token && boardId) {
                saveCredentials(key, token, boardId);
            }
            await loadBurndownData();
            closeTrelloModal();
        });

        // Listener para desconectar
        document.getElementById('disconnect-trello-btn').addEventListener('click', disconnectFromTrello);
        
        loadCredentials();
        await loadBurndownData();
    } catch (error) {
        console.error('Erro ao inicializar:', error);
    }
});

// Atualizar dados a cada 5 minutos
setInterval(loadBurndownData, 5 * 60 * 1000);