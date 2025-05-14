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
        boardId === '75e4b2d1c9a8f7e6d5c4b3a2f1e0d9c8')
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
            initVelocityChart();
            initProductivityChart();
            initEfficiencyChart();
            initQualityChart();
        }
    } else {
        if (noAuthMessage) noAuthMessage.style.display = 'flex';
        if (metricsContent) metricsContent.style.display = 'none';
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
    } else {
        // Sprint 2: carregar dados reais do arquivo
        // Esta função agora retorna uma Promise!
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
                // Eficiência: realizado é o percentual acumulado de pontos completados, esperado é linear
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
        sprintTitle.textContent = `Métricas da ${sprintId === 'sprint-1' ? 'Sprint 1' : 'Sprint 2'}`;
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
    } else {
        // Carregar dados reais do gráfico Sprint 2
        fetch('../data/simulatedDataSprint2.json')
            .then(res => res.json())
            .then(data => {
                const totalPontos = data.data[0].remaining;
                const pontosCompletados = totalPontos - data.data[data.data.length-2].remaining;
                const diasTotais = data.labels.length - 1;
                let diasTrabalhados = 0;
                let completedAnterior = 0;
                data.data.forEach((d, i) => {
                    if (i > 0 && d.completed > completedAnterior) diasTrabalhados++;
                    completedAnterior = d.completed;
                });
                const mediaDiaria = (pontosCompletados / diasTrabalhados).toFixed(2);
                const progressoTemporal = ((diasTrabalhados / diasTotais) * 100).toFixed(0);
                // Cards: 1 card = 2,5 pontos (ajuste se necessário)
                const cardsCompletados = Math.min(Math.round(pontosCompletados / 2.5), 40);
                // Datas
                const dataInicio = data.labels[0].split('-').reverse().join('/');
                // Encontrar o último dia de entrega (onde remaining passa de >0 para 0)
                let dataFimIndex = data.data.length - 2;
                for (let i = data.data.length - 1; i > 0; i--) {
                    if (data.data[i].remaining === 0 && data.data[i-1].remaining > 0) {
                        dataFimIndex = i;
                        break;
                    }
                }
                const dataFim = data.labels[dataFimIndex].split('-').reverse().join('/');
                // Atualiza métricas na tela
                document.querySelector('.metric-details p:nth-child(1) strong').textContent = `${pontosCompletados}/${totalPontos}`;
                document.querySelector('.metric-details p:nth-child(2) strong').textContent = '100%';
                document.querySelectorAll('.metric-details')[1].innerHTML = `<p>Cards completados: <strong>${cardsCompletados}/40</strong></p><p>Média diária: <strong>${mediaDiaria} pontos</strong></p>`;
                document.querySelectorAll('.metric-details')[2].innerHTML = `<p>Dias trabalhados: <strong>${diasTrabalhados}/${diasTotais}</strong></p><p>Progresso temporal: <strong>${progressoTemporal}%</strong></p><p>Período: <strong>${dataInicio} a ${dataFim}</strong></p>`;
                document.querySelectorAll('.metric-details')[3].innerHTML = '<p>Concluídos: <strong>100%</strong></p><p>Em progresso: <strong>0%</strong></p><p>A fazer: <strong>0%</strong></p>';
            });
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateSprintTitle();
    initVelocityChart();
    initProductivityChart();
    initQualityChart();
    
    // Verifica credenciais e controla visibilidade
    toggleContentVisibility();
    
    // Verifica se há mudanças nas credenciais do localStorage
    window.addEventListener('storage', (e) => {
        if (e.key === 'trello_board_id' || e.key === 'trello_key' || e.key === 'trello_token') {
            toggleContentVisibility();
        }
    });
});