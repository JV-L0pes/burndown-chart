// Importe o módulo do Trello
import './trello.js';

document.addEventListener("DOMContentLoaded", async function () {
  const ctx = document.getElementById("burndownChart").getContext("2d");
  let sprintData;
  let burndownChart;

  // Carregar dados do JSON
  try {
    const response = await fetch('simulatedData.json');
    sprintData = await response.json();
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    return;
  }

  // Calcular pontos completados
  const pointsCompleted = sprintData.actualLine.map((value, index, array) => {
    if (index === 0) return 0;
    return array[index - 1] - value > 0 ? array[index - 1] - value : 0;
  });
  
  // Calcular total de pontos completados
  const totalPoints = sprintData.idealLine[0];
  const remainingPoints = sprintData.actualLine[sprintData.actualLine.length - 1];
  const completedPoints = totalPoints - remainingPoints;
  
  // Dados para o gráfico
  const data = {
    labels: sprintData.labels,
    datasets: [
      {
        label: "Points Remaining",
        data: sprintData.actualLine,
        borderColor: "#3366CC",
        backgroundColor: "rgba(51, 102, 204, 0.2)",
        borderWidth: 2,
        pointRadius: 2,
        tension: 0.1,
        fill: true
      },
      {
        label: "Points Completed",
        data: pointsCompleted,
        borderColor: "#FF4444",
        backgroundColor: "rgba(255, 204, 204, 0.3)",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
        fill: true
      },
      {
        label: "Ideal Burndown",
        data: sprintData.idealLine,
        borderColor: "#FFA500",
        backgroundColor: "transparent",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0,
        fill: false
      }
    ]
  };

  // Criar gráfico
  burndownChart = new Chart(ctx, {
    type: "line",
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { 
            display: true, 
            text: "Pontos restantes",
            color: "#333"
          },
          grid: {
            color: "rgba(224, 224, 224, 0.4)"
          },
          ticks: {
            color: "#333"
          }
        },
        x: {
          title: { 
            display: true, 
            text: "Data",
            color: "#333"
          },
          grid: {
            color: "rgba(224, 224, 224, 0.4)"
          },
          ticks: {
            color: "#333"
          }
        }
      },
      plugins: {
        legend: { 
          display: false,
          labels: {
            color: "#333"
          }
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          titleColor: "#333",
          bodyColor: "#333",
          borderColor: "#DDD",
          borderWidth: 1
        }
      }
    }
  });

  // Atualizar título com pontos restantes
  document.getElementById("remaining-points").textContent = 
    `Atualmente ${remainingPoints} pontos restantes`;

  // Configurar valores das métricas para 100%
  const totalCards = 57;
  const completedCards = 57; // Alterado para total
  const cardsPercentage = 100; // 100%
  
  const totalDays = sprintData.labels.length - 1;
  const daysElapsed = totalDays; // Alterado para total
  const daysPercentage = 100; // 100%
  
  const pointsPercentage = 100; // 100%

  // Atualizar barras de progresso
  const cardsProgress = document.getElementById("cards-progress");
  cardsProgress.style.width = "100%";
  cardsProgress.textContent = `${completedCards}/${totalCards} (100%)`;

  const pointsProgress = document.getElementById("points-progress");
  pointsProgress.style.width = "100%";
  pointsProgress.textContent = `${totalPoints}/${totalPoints} (100%)`;

  const daysProgress = document.getElementById("days-progress");
  daysProgress.style.width = "100%";
  daysProgress.textContent = `${totalDays}/${totalDays} (100%)`;
});

// Função para atualizar o gráfico de burndown
function updateBurndownChart(pointsByDay) {
    const ctx = document.getElementById('burndownChart').getContext('2d');
    
    // Destrua o gráfico existente se houver um
    if (burndownChart) {
        burndownChart.destroy();
    }
    
    // Prepare os dados
    const labels = Object.keys(pointsByDay).sort((a, b) => a - b);
    const data = labels.map(day => pointsByDay[day]);
    
    // Calcule a linha ideal
    const totalPoints = data.reduce((sum, points) => sum + points, 0);
    const idealLine = labels.map(day => totalPoints * (1 - day / Math.max(...labels)));
    
    // Crie o gráfico
    burndownChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(day => `Dia ${day}`),
            datasets: [
                {
                    label: 'Pontos Restantes',
                    data: data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Linha Ideal',
                    data: idealLine,
                    borderColor: 'rgb(251, 146, 60)',
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Pontos'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Dias'
                    }
                }
            }
        }
    });
    
    // Atualize as métricas
    updateMetrics(pointsByDay);
}

// Função para atualizar as métricas
function updateMetrics(pointsByDay) {
    const totalPoints = Object.values(pointsByDay).reduce((sum, points) => sum + points, 0);
    const completedPoints = Object.values(pointsByDay)
        .filter((_, index) => index < Object.keys(pointsByDay).length - 1)
        .reduce((sum, points) => sum + points, 0);
    
    const progress = (completedPoints / totalPoints) * 100;
    
    document.getElementById('points-progress').style.width = `${progress}%`;
    document.getElementById('points-progress').textContent = `${completedPoints}/${totalPoints} (${Math.round(progress)}%)`;
}