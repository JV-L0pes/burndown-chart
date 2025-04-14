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
    const metricsContent = document.getElementById('metrics-content');
    
    if (isSimulatedDemo()) {
        // Se tiver credenciais, mostra o conteúdo e esconde a mensagem
        if (noAuthMessage) noAuthMessage.style.display = 'none';
        if (metricsContent) metricsContent.style.display = 'block';
        
        // Inicializa os gráficos apenas se o conteúdo estiver visível
        if (metricsContent) {
            initVelocityChart();
            initProductivityChart();
            initEfficiencyChart();
            initQualityChart();
        }
    } else {
        // Se não tiver credenciais, mostra a mensagem e esconde o conteúdo
        if (noAuthMessage) noAuthMessage.style.display = 'flex';
        if (metricsContent) metricsContent.style.display = 'none';
    }
}

// Substitui métricas simuladas se demo
function updateDemoMetrics() {
    if (!isSimulatedDemo()) return;
    // Velocidade
    document.querySelector('.metric-details p:nth-child(1) strong').textContent = '80/80';
    document.querySelector('.metric-details p:nth-child(2) strong').textContent = '100%';
    // Produtividade
    document.querySelectorAll('.metric-details')[1].innerHTML = '<p>Cards completados: <strong>32/32</strong></p><p>Média diária: <strong>1.6 cards</strong></p>';
    // Eficiência
    document.querySelectorAll('.metric-details')[2].innerHTML = '<p>Dias trabalhados: <strong>20/23</strong></p><p>Progresso temporal: <strong>86.96%</strong></p>';
    // Qualidade
    document.querySelectorAll('.metric-details')[3].innerHTML = '<p>Concluídos: <strong>100%</strong></p><p>Em progresso: <strong>0%</strong></p><p>A fazer: <strong>0%</strong></p>';
}

// Gráfico de Velocidade
function initVelocityChart() {
    const ctx = document.getElementById('velocityChart');
    if (!ctx) return;
    
    const ctx2d = ctx.getContext('2d');
    
    // Dados semanais até 15/04
    const labels = ['18-22/03', '25-29/03', '01-05/04', '08-15/04'];
    const pontosCompletados = [10, 15, 25, 30]; // Total: 80 pontos

    new Chart(ctx2d, {
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
    const ctx = document.getElementById('productivityChart');
    if (!ctx) return;
    
    const ctx2d = ctx.getContext('2d');
    
    // Dados até 15/04
    const labels = ['18-22/03', '25-29/03', '01-05/04', '08-15/04'];
    const cardsCompletados = [5, 8, 9, 10]; // Total: 32 cards

    new Chart(ctx2d, {
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
    const ctx = document.getElementById('efficiencyChart');
    if (!ctx) return;
    
    const ctx2d = ctx.getContext('2d');
    
    // Progresso semanal em relação ao ideal até 15/04
    const labels = ['18-22/03', '25-29/03', '01-05/04', '08-15/04'];
    const realizado = [12.5, 31.25, 62.5, 100]; // Percentual acumulado real
    const esperado = [25, 50, 75, 100]; // Percentual ideal

    new Chart(ctx2d, {
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
    const ctx = document.getElementById('qualityChart');
    if (!ctx) return;
    
    const ctx2d = ctx.getContext('2d');
    
    new Chart(ctx2d, {
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
    // Verifica credenciais e controla visibilidade
    toggleContentVisibility();
    
    // Verifica se há mudanças nas credenciais do localStorage
    window.addEventListener('storage', (e) => {
        if (e.key === 'trello_board_id' || e.key === 'trello_key' || e.key === 'trello_token') {
            toggleContentVisibility();
        }
    });
});