// Configuração comum para todos os gráficos
const chartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    }
};

// Gráfico de Velocidade
function initVelocityChart() {
    const ctx = document.getElementById('velocityChart').getContext('2d');
    
    // Dados semanais até 15/04
    const labels = ['18-22/03', '25-29/03', '01-05/04', '08-15/04'];
    const pontosCompletados = [10, 15, 25, 30]; // Total: 80 pontos

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: pontosCompletados,
                borderColor: '#FF4B4B',
                backgroundColor: 'rgba(255, 75, 75, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            ...chartConfig,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Pontos por semana'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Gráfico de Produtividade
function initProductivityChart() {
    const ctx = document.getElementById('productivityChart').getContext('2d');
    
    // Dados até 15/04
    const labels = ['18-22/03', '25-29/03', '01-05/04', '08-15/04'];
    const cardsCompletados = [5, 8, 9, 10]; // Total: 32 cards

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: cardsCompletados,
                backgroundColor: 'rgba(75, 75, 255, 0.2)',
                borderColor: '#4B4BFF',
                borderWidth: 1
            }]
        },
        options: {
            ...chartConfig,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Cards por semana'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Gráfico de Eficiência
function initEfficiencyChart() {
    const ctx = document.getElementById('efficiencyChart').getContext('2d');
    
    // Progresso semanal em relação ao ideal até 15/04
    const labels = ['18-22/03', '25-29/03', '01-05/04', '08-15/04'];
    const realizado = [12.5, 31.25, 62.5, 100]; // Percentual acumulado real
    const esperado = [25, 50, 75, 100]; // Percentual ideal

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Realizado',
                    data: realizado,
                    borderColor: '#9B4DCA',
                    backgroundColor: 'rgba(155, 77, 202, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Esperado',
                    data: esperado,
                    borderColor: '#4B4BFF',
                    backgroundColor: 'rgba(75, 75, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            ...chartConfig,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Progresso (%)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Gráfico de Qualidade
function initQualityChart() {
    const ctx = document.getElementById('qualityChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Concluído', 'Em Progresso', 'A Fazer'],
            datasets: [{
                data: [100, 0, 0], // Sprint concluída com sucesso
                backgroundColor: [
                    '#4CAF50',
                    '#4B4BFF',
                    '#FF4B4B'
                ],
                borderWidth: 0,
                borderColor: 'transparent'
            }]
        },
        options: {
            ...chartConfig,
            cutout: '70%'
        }
    });
}

// Inicialização dos gráficos
document.addEventListener('DOMContentLoaded', () => {
    initVelocityChart();
    initProductivityChart();
    initEfficiencyChart();
    initQualityChart();
}); 