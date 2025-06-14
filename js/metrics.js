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
        (key === '7fd281b264c39b6b3f17b478937b1d54' &&
        token === 'ATTAf8b7fc8e40203d0aa36b3ff8f9dc13ebca74dc1c78f44551a3578a0e5af2bccd62FB2E29' &&
        boardId === '64f7a3c2d0cbad8763f9a4e1') ||
        (key === '8e392c7a5f1d4b6a9c8e2d1f3a5b7c9d' &&
        token === 'ATTAf9c8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3' &&
        boardId === '75e4b2d1c9a8f7e6d5c4b3a2f1e0d9c8') ||
        (key === '3c7f9e2a1b5d8f4e6c9a2d7b3f8e1c5a' &&
        token === 'ATTAc3f7b9e2a1d5f8e4c6a9d2b7f3e8c1a5f9d2b7e3c8a1f5d9e2c7b4a8f1e6d3c9b2a7f5e8c1' &&
        boardId === '89a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5')
    );
}

// Função para identificar a sprint pelas credenciais de demo
function getSprintIdByDemoCredentials() {
    const key = localStorage.getItem('trello_key') || '';
    const token = localStorage.getItem('trello_token') || '';
    const boardId = localStorage.getItem('trello_board_id') || '';
    
    if (
        key === '7fd281b264c39b6b3f17b478937b1d54' &&
        token === 'ATTAf8b7fc8e40203d0aa36b3ff8f9dc13ebca74dc1c78f44551a3578a0e5af2bccd62FB2E29' &&
        boardId === '64f7a3c2d0cbad8763f9a4e1'
    ) {
        return 'sprint-1';
    }
    if (
        key === '8e392c7a5f1d4b6a9c8e2d1f3a5b7c9d' &&
        token === 'ATTAf9c8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3' &&
        boardId === '75e4b2d1c9a8f7e6d5c4b3a2f1e0d9c8'
    ) {
        return 'sprint-2';
    }
    if (
        key === '3c7f9e2a1b5d8f4e6c9a2d7b3f8e1c5a' &&
        token === 'ATTAc3f7b9e2a1d5f8e4c6a9d2b7f3e8c1a5f9d2b7e3c8a1f5d9e2c7b4a8f1e6d3c9b2a7f5e8c1' &&
        boardId === '89a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5'
    ) {
        return 'sprint-3';
    }
    return null;
}

// Função para mostrar ou ocultar conteúdo com base nas credenciais
function toggleContentVisibility() {
    const noAuthMessage = document.getElementById('no-auth-message');
    const metricsContent = document.getElementById('metrics-content');
    const sprintId = getSprintIdByDemoCredentials() || 'sprint-1';
    
    if (isSimulatedDemo()) {
        if (noAuthMessage) noAuthMessage.style.display = 'none';
        if (metricsContent) metricsContent.style.display = 'block';
        if (metricsContent) {
            updateSprintTitle(sprintId);
            updateDemoMetrics(sprintId);
            
            // Só inicializa os gráficos se ainda não existirem
            if (!velocityChartInstance) {
                initVelocityChart();
            }
            if (!productivityChartInstance) {
                initProductivityChart();
            }
            if (!efficiencyChartInstance) {
                initEfficiencyChart();
            }
            if (!qualityChartInstance) {
                initQualityChart();
            }
        }
    } else {
        if (noAuthMessage) noAuthMessage.style.display = 'flex';
        if (metricsContent) metricsContent.style.display = 'none';
        
        // Destroi os gráficos quando não há credenciais
        destroyAllCharts();
    }
}

// Função para destruir todos os gráficos
function destroyAllCharts() {
    if (velocityChartInstance) {
        velocityChartInstance.destroy();
        velocityChartInstance = null;
    }
    if (productivityChartInstance) {
        productivityChartInstance.destroy();
        productivityChartInstance = null;
    }
    if (efficiencyChartInstance) {
        efficiencyChartInstance.destroy();
        efficiencyChartInstance = null;
    }
    if (qualityChartInstance) {
        qualityChartInstance.destroy();
        qualityChartInstance = null;
    }
}

// Função para obter dados da sprint atual
function getCurrentSprintData() {
    // Detecta sprint pelas credenciais de demo
    const sprintId = getSprintIdByDemoCredentials() || 'sprint-1';
    
    if (sprintId === 'sprint-1') {
        return {
            labels: ['18-22/03', '25-29/03', '01-05/04', '08-15/04'],
            pontosCompletados: [10, 15, 25, 30],
            cardsCompletados: [5, 8, 9, 10],
            totalPontos: 80,
            totalCards: 32,
            efficiency: {
                realizado: [12.5, 31.25, 62.5, 100],
                esperado: [25, 50, 75, 100]
            }
        };
    } else if (sprintId === 'sprint-3') {
        return {
            labels: ['15-19/05', '22-26/05', '29/05-02/06', '05-13/06'],
            pontosCompletados: [19, 30, 35, 36],
            cardsCompletados: [7, 12, 14, 15],
            totalPontos: 120,
            totalCards: 48,
            efficiency: {
                realizado: [15.8, 41.7, 70.8, 100],
                esperado: [25, 50, 75, 100]
            }
        };
    } else {
        // Sprint 2: carregar dados reais do arquivo
        return fetch('../data/simulatedDataSprint2.json')
            .then(res => res.json())
            .then(data => {
                // Agrupar por semana real
                const labels = [];
                const pontosCompletados = [];
                const cardsCompletados = [];
                const dias = data.labels;
                const pontosPorDia = data.data.map(d => d.completed);
                const totalPontos = data.data[0].remaining;
                const totalCards = 40;
                
                // Agrupamento semanal
                let semana = 0;
                let pontosSemana = 0;
                let cardsSemana = 0;
                let diasSemana = 0;
                let lastCompleted = 0;
                
                for (let i = 0; i < dias.length; i++) {
                    const dia = dias[i];
                    const date = new Date(dia);
                    pontosSemana += (data.data[i].completed - lastCompleted);
                    cardsSemana += Math.round((data.data[i].completed - lastCompleted) / 2.5);
                    diasSemana++;
                    lastCompleted = data.data[i].completed;
                    
                    // Se for sábado ou último dia, fecha a semana
                    if (date.getDay() === 6 || i === dias.length-2) {
                        // Label da semana
                        const start = new Date(dias[i-diasSemana+1]);
                        const end = date;
                        const startLabel = `${('0'+start.getDate()).slice(-2)}/${('0'+(start.getMonth()+1)).slice(-2)}`;
                        const endLabel = `${('0'+end.getDate()).slice(-2)}/${('0'+(end.getMonth()+1)).slice(-2)}`;
                        labels.push(`${startLabel}\n${endLabel}`);
                        pontosCompletados.push(pontosSemana);
                        cardsCompletados.push(cardsSemana);
                        semana++;
                        pontosSemana = 0;
                        cardsSemana = 0;
                        diasSemana = 0;
                    }
                }
                
                // Eficiência
                let acumuladoPontos = 0;
                const pontosCompletadosLimitados = pontosCompletados.map((p, i) => {
                    acumuladoPontos += p;
                    if (acumuladoPontos > totalPontos) {
                        p = p - (acumuladoPontos - totalPontos);
                        acumuladoPontos = totalPontos;
                    }
                    return p;
                });
                const esperado = pontosCompletadosLimitados.map((_, i, arr) => Math.round(((i+1)/arr.length)*100));
                
                return {
                    labels,
                    pontosCompletados: pontosCompletadosLimitados,
                    cardsCompletados,
                    totalPontos,
                    totalCards,
                    efficiency: {
                        realizado: pontosCompletadosLimitados,
                        esperado
                    }
                };
            });
    }
}

// Variáveis globais para instâncias dos gráficos
let velocityChartInstance = null;
let productivityChartInstance = null;
let efficiencyChartInstance = null;
let qualityChartInstance = null;

// Gráfico de Velocidade
function initVelocityChart() {
    const ctx = document.getElementById('velocityChart');
    if (!ctx) return;
    const ctx2d = ctx.getContext('2d');
    const sprintId = getSprintIdByDemoCredentials() || 'sprint-1';
    const dataPromise = getCurrentSprintData();
    
    if (sprintId === 'sprint-2') {
        dataPromise.then(sprintData => {
            if (velocityChartInstance) { velocityChartInstance.destroy(); velocityChartInstance = null; }
            velocityChartInstance = new Chart(ctx2d, {
                type: 'line',
                data: {
                    labels: sprintData.labels,
                    datasets: [{
                        data: sprintData.pontosCompletados,
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
                            grid: { display: false },
                            title: { display: true, text: 'Pontos por semana' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { size: 10 },
                                padding: 10,
                                autoSkip: false,
                                callback: function(value, index, values) {
                                    return this.getLabelForValue(index).split('\\n');
                                }
                            }
                        }
                    }
                }
            });
        });
    } else {
        const sprintData = getCurrentSprintData();
        velocityChartInstance = new Chart(ctx2d, {
            type: 'line',
            data: {
                labels: sprintData.labels,
                datasets: [{
                    data: sprintData.pontosCompletados,
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
                        grid: { display: false },
                        title: { display: true, text: 'Pontos por semana' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 10 },
                            padding: 10,
                            autoSkip: false,
                            callback: function(value, index, values) {
                                return this.getLabelForValue(index).split('\\n');
                            }
                        }
                    }
                }
            }
        });
    }
}

// Gráfico de Produtividade
function initProductivityChart() {
    const ctx = document.getElementById('productivityChart');
    if (!ctx) return;
    const ctx2d = ctx.getContext('2d');
    const sprintId = getSprintIdByDemoCredentials() || 'sprint-1';
    const dataPromise = getCurrentSprintData();
    
    if (sprintId === 'sprint-2') {
        dataPromise.then(sprintData => {
            if (productivityChartInstance) { productivityChartInstance.destroy(); productivityChartInstance = null; }
            productivityChartInstance = new Chart(ctx2d, {
                type: 'bar',
                data: {
                    labels: sprintData.labels,
                    datasets: [{
                        data: sprintData.cardsCompletados,
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
                            grid: { display: false },
                            title: { display: true, text: 'Cards por semana' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { size: 10 },
                                padding: 10,
                                autoSkip: false,
                                callback: function(value, index, values) {
                                    return this.getLabelForValue(index).split('\\n');
                                }
                            }
                        }
                    }
                }
            });
        });
    } else {
        const sprintData = getCurrentSprintData();
        productivityChartInstance = new Chart(ctx2d, {
            type: 'bar',
            data: {
                labels: sprintData.labels,
                datasets: [{
                    data: sprintData.cardsCompletados,
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
                        grid: { display: false },
                        title: { display: true, text: 'Cards por semana' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 10 },
                            padding: 10,
                            autoSkip: false,
                            callback: function(value, index, values) {
                                return this.getLabelForValue(index).split('\\n');
                            }
                        }
                    }
                }
            }
        });
    }
}

// Gráfico de Eficiência
function initEfficiencyChart() {
    const ctx = document.getElementById('efficiencyChart');
    if (!ctx) return;
    const ctx2d = ctx.getContext('2d');
    const sprintId = getSprintIdByDemoCredentials() || 'sprint-1';
    const dataPromise = getCurrentSprintData();
    
    if (sprintId === 'sprint-2') {
        dataPromise.then(sprintData => {
            if (efficiencyChartInstance) { efficiencyChartInstance.destroy(); efficiencyChartInstance = null; }
            efficiencyChartInstance = new Chart(ctx2d, {
                type: 'line',
                data: {
                    labels: sprintData.labels,
                    datasets: [
                        {
                            label: 'Realizado',
                            data: sprintData.efficiency.realizado,
                            borderColor: '#9B4DCA',
                            backgroundColor: 'rgba(155, 77, 202, 0.1)',
                            tension: 0.4,
                            fill: true
                        },
                        {
                            label: 'Esperado',
                            data: sprintData.efficiency.esperado,
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
                    plugins: { legend: { display: true } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: { display: false },
                            title: { display: true, text: 'Progresso (%)' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: {
                                font: { size: 10 },
                                padding: 10,
                                autoSkip: false,
                                callback: function(value, index, values) {
                                    return this.getLabelForValue(index).split('\\n');
                                }
                            }
                        }
                    }
                }
            });
        });
    } else {
        const sprintData = getCurrentSprintData();
        efficiencyChartInstance = new Chart(ctx2d, {
            type: 'line',
            data: {
                labels: sprintData.labels,
                datasets: [
                    {
                        label: 'Realizado',
                        data: sprintData.efficiency.realizado,
                        borderColor: '#9B4DCA',
                        backgroundColor: 'rgba(155, 77, 202, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Esperado',
                        data: sprintData.efficiency.esperado,
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
                plugins: { legend: { display: true } },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { display: false },
                        title: { display: true, text: 'Progresso (%)' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: {
                            font: { size: 10 },
                            padding: 10,
                            autoSkip: false,
                            callback: function(value, index, values) {
                                return this.getLabelForValue(index).split('\\n');
                            }
                        }
                    }
                }
            }
        });
    }
}

// Gráfico de Qualidade
function initQualityChart() {
    const ctx = document.getElementById('qualityChart');
    if (!ctx) return;
    const ctx2d = ctx.getContext('2d');
    const sprintId = getSprintIdByDemoCredentials() || 'sprint-1';
    const dataPromise = getCurrentSprintData();
    
    if (sprintId === 'sprint-2') {
        dataPromise.then(sprintData => {
            if (qualityChartInstance) {
                qualityChartInstance.destroy();
                qualityChartInstance = null;
            }
            ctx2d.clearRect(0, 0, ctx.width, ctx.height);
            let totalCompletado = sprintData.pontosCompletados.reduce((a, b) => a + b, 0);
            const totalPontos = sprintData.totalPontos;
            let totalRestante = Math.max(totalPontos - totalCompletado, 0);
            let dataChart;
            let bgColors;
            let chartLabels;
            if (totalCompletado >= totalPontos || totalRestante <= 0) {
                dataChart = [totalPontos];
                bgColors = ['#4CAF50'];
                chartLabels = ['Concluído'];
            } else {
                dataChart = [totalCompletado, 0, totalRestante];
                bgColors = ['#4CAF50', '#4B4BFF', '#FF4B4B'];
                chartLabels = ['Concluído', 'Em Progresso', 'A Fazer'];
            }
            if (
                dataChart.length > 1 &&
                dataChart[0] > 0 &&
                dataChart.slice(1).reduce((a, b) => a + b, 0) <= 2
            ) {
                dataChart = [dataChart[0]];
                bgColors = [bgColors[0]];
                chartLabels = [chartLabels[0]];
            }
            console.log('Dados do gráfico de qualidade:', {dataChart, chartLabels, bgColors});
            qualityChartInstance = new Chart(ctx2d, {
                type: 'doughnut',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        data: dataChart,
                        backgroundColor: bgColors,
                        borderWidth: 0,
                        borderColor: 'transparent'
                    }]
                },
                options: {
                    ...chartConfig,
                    cutout: '70%'
                }
            });
        });
    } else {
        const sprintData = getCurrentSprintData();
        if (qualityChartInstance) {
            qualityChartInstance.destroy();
            qualityChartInstance = null;
        }
        ctx2d.clearRect(0, 0, ctx.width, ctx.height);
        let totalCompletado = sprintData.pontosCompletados.reduce((a, b) => a + b, 0);
        const totalPontos = sprintData.totalPontos;
        let totalRestante = Math.max(totalPontos - totalCompletado, 0);
        let dataChart;
        let bgColors;
        let chartLabels;
        if (totalCompletado >= totalPontos || totalRestante <= 0) {
            dataChart = [totalPontos];
            bgColors = ['#4CAF50'];
            chartLabels = ['Concluído'];
        } else {
            dataChart = [totalCompletado, 0, totalRestante];
            bgColors = ['#4CAF50', '#4B4BFF', '#FF4B4B'];
            chartLabels = ['Concluído', 'Em Progresso', 'A Fazer'];
        }
        if (
            dataChart.length > 1 &&
            dataChart[0] > 0 &&
            dataChart.slice(1).reduce((a, b) => a + b, 0) <= 2
        ) {
            dataChart = [dataChart[0]];
            bgColors = [bgColors[0]];
            chartLabels = [chartLabels[0]];
        }
        console.log('Dados do gráfico de qualidade:', {dataChart, chartLabels, bgColors});
        qualityChartInstance = new Chart(ctx2d, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: dataChart,
                    backgroundColor: bgColors,
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
}

// Função para atualizar o título da sprint
function updateSprintTitle(sprintId) {
    const sprintTitle = document.getElementById('sprint-title');
    if (sprintTitle) {
        if (sprintId === 'sprint-3') {
            sprintTitle.textContent = 'Métricas da Sprint 3';
        } else if (sprintId === 'sprint-2') {
            sprintTitle.textContent = 'Métricas da Sprint 2';
        } else {
            sprintTitle.textContent = 'Métricas da Sprint 1';
        }
    }
}

// Função para atualizar métricas simuladas
function updateDemoMetrics(sprintId) {
    if (!isSimulatedDemo()) return;
    
    if (sprintId === 'sprint-1') {
        // Métricas da Sprint 1
        document.querySelector('.metric-details p:nth-child(1) strong').textContent = '80/80';
        document.querySelector('.metric-details p:nth-child(2) strong').textContent = '100%';
        document.querySelectorAll('.metric-details')[1].innerHTML = '<p>Cards completados: <strong>32/32</strong></p><p>Média diária: <strong>1.6 cards</strong></p>';
        document.querySelectorAll('.metric-details')[2].innerHTML = '<p>Dias trabalhados: <strong>20/23</strong></p><p>Progresso temporal: <strong>86.96%</strong></p>';
        document.querySelectorAll('.metric-details')[3].innerHTML = '<p>Concluídos: <strong>100%</strong></p><p>Em progresso: <strong>0%</strong></p><p>A fazer: <strong>0%</strong></p>';
    } else if (sprintId === 'sprint-3') {
        // Métricas da Sprint 3
        document.querySelector('.metric-details p:nth-child(1) strong').textContent = '120/120';
        document.querySelector('.metric-details p:nth-child(2) strong').textContent = '100%';
        document.querySelectorAll('.metric-details')[1].innerHTML = '<p>Cards completados: <strong>48/48</strong></p><p>Média diária: <strong>1.7 cards</strong></p>';
        document.querySelectorAll('.metric-details')[2].innerHTML = '<p>Dias trabalhados: <strong>28/30</strong></p><p>Progresso temporal: <strong>93.33%</strong></p><p>Período: <strong>15/05 a 13/06</strong></p>';
        document.querySelectorAll('.metric-details')[3].innerHTML = '<p>Concluídos: <strong>100%</strong></p><p>Em progresso: <strong>0%</strong></p><p>A fazer: <strong>0%</strong></p>';
    } else if (sprintId === 'sprint-2') {
        // Métricas da Sprint 2 - Dados fixos para evitar async
        document.querySelector('.metric-details p:nth-child(1) strong').textContent = '100/100';
        document.querySelector('.metric-details p:nth-child(2) strong').textContent = '100%';
        document.querySelectorAll('.metric-details')[1].innerHTML = '<p>Cards completados: <strong>40/40</strong></p><p>Média diária: <strong>2.0 cards</strong></p>';
        document.querySelectorAll('.metric-details')[2].innerHTML = '<p>Dias trabalhados: <strong>20/20</strong></p><p>Progresso temporal: <strong>100%</strong></p><p>Período: <strong>16/04 a 14/05</strong></p>';
        document.querySelectorAll('.metric-details')[3].innerHTML = '<p>Concluídos: <strong>100%</strong></p><p>Em progresso: <strong>0%</strong></p><p>A fazer: <strong>0%</strong></p>';
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Primeiro destroi qualquer gráfico existente
    destroyAllCharts();
    
    // Depois inicializa conforme as credenciais
    toggleContentVisibility();
    
    // Verifica se há mudanças nas credenciais do localStorage
    window.addEventListener('storage', (e) => {
        if (e.key === 'trello_board_id' || e.key === 'trello_key' || e.key === 'trello_token') {
            // Destroi gráficos antes de recriar
            destroyAllCharts();
            toggleContentVisibility();
        }
    });
});