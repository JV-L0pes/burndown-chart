// Detecta se está usando dados simulados (demo)
function isSimulatedDemo() {
    const key = localStorage.getItem('trello_key') || '';
    const token = localStorage.getItem('trello_token') || '';
    const boardId = localStorage.getItem('trello_board_id') || '';
    return (
        key === '7fd281b264c39b6b3f17b478937b1d54' &&
        token === 'ATTAf8b7fc8e40203d0aa36b3ff8f9dc13ebca74dc1c78f44551a3578a0e5af2bccd62FB2E29' &&
        boardId === '64f7a3c2d0cbad8763f9a4e1'
    );
}

// Função para mostrar ou ocultar conteúdo com base nas credenciais
function toggleContentVisibility() {
    const noAuthMessage = document.getElementById('no-auth-message');
    const sprintsGrid = document.querySelector('.sprints-grid');
    
    if (isSimulatedDemo()) {
        // Se tiver credenciais, mostra o conteúdo e esconde a mensagem
        if (noAuthMessage) noAuthMessage.style.display = 'none';
        if (sprintsGrid) sprintsGrid.style.display = 'grid';
    } else {
        // Se não tiver credenciais, mostra a mensagem e esconde o conteúdo
        if (noAuthMessage) noAuthMessage.style.display = 'flex';
        if (sprintsGrid) sprintsGrid.style.display = 'none';
    }
}

// Função para carregar os dados dos sprints
async function loadSprintsData() {
    try {
        let sprints = [];
        if (isSimulatedDemo()) {
            // Dados simulados para demo
            sprints = [
                {
                    id: 'sprint-1',
                    name: 'Sprint 1 - Aprendizado Inicial',
                    status: 'Completada',
                    startDate: '2025-03-18',
                    endDate: '2025-04-15',
                    metrics: {
                        cards: '32/32',
                        points: '80/80',
                        days: '20/23'
                    },
                    description: 'Primeira sprint da equipe, focada no aprendizado inicial. Apesar dos desafios de adaptação, a equipe conseguiu entregar todos os cards e pontos planejados, demonstrando excelente capacidade de evolução ao longo do sprint.'
                }
            ];
        } else {
            const response = await fetch('../data/sprints.json');
            if (!response.ok) {
                throw new Error('Erro ao carregar dados dos sprints');
            }
            sprints = await response.json();
        }
        return sprints;
    } catch (error) {
        console.error('Erro:', error);
        return [];
    }
}

// Função para filtrar sprints
function filterSprints(sprints, searchTerm, statusFilter) {
    return sprints.filter(sprint => {
        const matchesSearch = sprint.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || sprint.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
}

// Função para renderizar os cards de sprint
function renderSprintCards(sprints) {
    const grid = document.querySelector('.sprints-grid');
    if (!grid) return;

    grid.innerHTML = sprints.map(sprint => `
        <div class="sprint-card">
            <div class="sprint-header">
                <h3>${sprint.name}</h3>
            </div>
            <div class="sprint-info">
                <div class="sprint-dates">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(sprint.startDate)} - ${formatDate(sprint.endDate)}</span>
                </div>
                <div class="sprint-status ${sprint.status.toLowerCase().replace(' ', '-')}">
                    <i class="fas fa-check-circle"></i>
                    ${sprint.status}
                </div>
            </div>
            <div class="sprint-metrics">
                <div class="metric">
                    <span class="metric-label">Cards</span>
                    <span class="metric-value">${sprint.metrics.cards}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Pontos</span>
                    <span class="metric-value">${sprint.metrics.points}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Dias</span>
                    <span class="metric-value">${sprint.metrics.days}</span>
                </div>
            </div>
            <div class="sprint-description">
                <p>${sprint.description}</p>
            </div>
            <div class="sprint-actions">
                <a href="graph.html?sprint=${sprint.id}" class="btn btn-primary">
                    <i class="fas fa-chart-line"></i>
                    Ver Gráfico
                </a>
            </div>
        </div>
    `).join('');
}

// Função para formatar data
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Verifica credenciais e controla visibilidade do conteúdo
    toggleContentVisibility();

    // Carrega os dados apenas se tiver credenciais
    if (isSimulatedDemo()) {
        const searchInput = document.querySelector('.search-box input');
        const statusFilter = document.querySelector('.filter-options select');
        let sprints = await loadSprintsData();

        // Renderizar sprints iniciais
        renderSprintCards(sprints);

        // Adicionar listeners para filtros
        if (searchInput && statusFilter) {
            searchInput.addEventListener('input', () => {
                const filteredSprints = filterSprints(sprints, searchInput.value, statusFilter.value);
                renderSprintCards(filteredSprints);
            });

            statusFilter.addEventListener('change', () => {
                const filteredSprints = filterSprints(sprints, searchInput.value, statusFilter.value);
                renderSprintCards(filteredSprints);
            });
        }
    }

    // Verifica se há mudanças nas credenciais do localStorage
    window.addEventListener('storage', (e) => {
        if (e.key === 'trello_board_id' || e.key === 'trello_key' || e.key === 'trello_token') {
            toggleContentVisibility();
            if (isSimulatedDemo()) {
                loadSprintsData().then(renderSprintCards);
            }
        }
    });
});