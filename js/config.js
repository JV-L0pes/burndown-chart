const config = {
    sprints: {
        'sprint-1': {
            name: "Sprint 1",
            startDate: new Date("2025-03-18"),
            endDate: new Date("2025-04-15"),
            totalPoints: 80,
            remainingPoints: 80,
            totalCards: 32,
            completedCards: 32
        },
        'sprint-2': {
            name: "Sprint 2",
            startDate: new Date("2025-04-16"),
            endDate: new Date("2025-05-14"),
            totalPoints: 100,
            remainingPoints: 100,
            totalCards: 40,
            completedCards: 24
        }
    },
    chart: {
        backgroundColor: 'rgba(222, 184, 135, 0.2)', // Bege claro
        borderColor: '#4F95FF', // Azul mais claro
        borderWidth: 2,
        pointBackgroundColor: '#4F95FF',
        pointRadius: 4,
        pointHoverRadius: 6,
        completedColor: '#FF6B6B', // Vermelho mais suave
        idealColor: '#FFA500', // Laranja
        idealBorderDash: [5, 5],
        gridColor: 'rgba(0, 0, 0, 0.05)', // Grid mais suave
        textColor: '#666666',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: 12,
    },
    api: {
        baseUrl: 'http://localhost:3000',
        endpoints: {
            burndown: '/api/burndown',
            sprint: '/api/sprint',
            settings: '/api/settings',
        },
    },
    refresh: {
        interval: 300000, // 5 minutos
        autoRefresh: true,
    }
};

// Funções de utilidade para configuração
function getCurrentSprint() {
    const urlParams = new URLSearchParams(window.location.search);
    const sprintId = urlParams.get('sprint') || 'sprint-1';
    return config.sprints[sprintId];
}

function saveConfig() {
    localStorage.setItem('burndownConfig', JSON.stringify(config));
}

function loadConfig() {
    const savedConfig = localStorage.getItem('burndownConfig');
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        parsed.sprints['sprint-1'].startDate = new Date(parsed.sprints['sprint-1'].startDate);
        parsed.sprints['sprint-1'].endDate = new Date(parsed.sprints['sprint-1'].endDate);
        parsed.sprints['sprint-2'].startDate = new Date(parsed.sprints['sprint-2'].startDate);
        parsed.sprints['sprint-2'].endDate = new Date(parsed.sprints['sprint-2'].endDate);
        Object.assign(config, parsed);
    }
}

// Exportar configurações
export { config, saveConfig, loadConfig }; 