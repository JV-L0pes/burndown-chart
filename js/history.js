// Função para carregar os dados dos sprints
async function loadSprintsData() {
    try {
        const response = await fetch('../data/sprints.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar dados dos sprints');
        }
        return await response.json();
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
    const searchInput = document.querySelector('.search-box input');
    const statusFilter = document.querySelector('.filter-options select');
    let sprints = await loadSprintsData();

    // Renderizar sprints iniciais
    renderSprintCards(sprints);

    // Adicionar listeners para filtros
    searchInput.addEventListener('input', () => {
        const filteredSprints = filterSprints(sprints, searchInput.value, statusFilter.value);
        renderSprintCards(filteredSprints);
    });

    statusFilter.addEventListener('change', () => {
        const filteredSprints = filterSprints(sprints, searchInput.value, statusFilter.value);
        renderSprintCards(filteredSprints);
    });
}); 