const config = {
    sprint: {
        name: "Sprint 1",
        startDate: new Date("2025-03-18"),
        endDate: new Date("2025-04-15"),
        totalPoints: 40,
        remainingPoints: 40,
        totalCards: 19,
        completedCards: 8
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
function saveConfig() {
    localStorage.setItem('burndownConfig', JSON.stringify(config));
}

function loadConfig() {
    const savedConfig = localStorage.getItem('burndownConfig');
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        parsed.sprint.startDate = new Date(parsed.sprint.startDate);
        parsed.sprint.endDate = new Date(parsed.sprint.endDate);
        Object.assign(config, parsed);
    }
}

// Exportar configurações
export { config, saveConfig, loadConfig }; 