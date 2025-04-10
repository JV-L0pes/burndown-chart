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

// Função para formatar data
function formatDate(date) {
    return date; // Já está no formato correto no JSON
}

// Função para carregar dados simulados
async function loadSimulatedData() {
    try {
        const response = await fetch('../data/simulatedData.json');
        if (!response.ok) {
            throw new Error('Erro ao carregar dados');
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        throw error;
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

// Função para atualizar o gráfico de burndown
async function updateBurndownChart() {
    try {
        const data = await loadSimulatedData();
        const ctx = document.getElementById('burndownChart').getContext('2d');
        
        // Destrua o gráfico existente se houver um
        if (burndownChart) {
            burndownChart.destroy();
        }
        
        // Prepare os dados
        const labels = data.labels;
        const remainingPoints = data.data.map(item => item.remaining);
        const completedPoints = data.data.map(item => item.completed);
        const idealLine = calculateIdealLine(data);
        
        // Crie o gráfico
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
        
        // Atualize as métricas
        updateMetrics(data);
        
        // Esconda a mensagem de carregamento
        document.getElementById('loading-message').style.display = 'none';
        
    } catch (error) {
        console.error('🔴 Erro ao atualizar gráfico:', error);
        document.getElementById('loading-message').textContent = 'Erro ao carregar dados do gráfico';
        document.getElementById('loading-message').style.display = 'block';
    }
}

// Inicialize o gráfico quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await updateBurndownChart();
    } catch (error) {
        console.error('Erro ao inicializar:', error);
    }
});

// Atualize a cada 5 minutos
setInterval(updateBurndownChart, 5 * 60 * 1000);