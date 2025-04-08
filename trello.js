// Configuração da API do Trello
const TRELLO_API_KEY = 'sua_api_key'; // Substitua pela sua API Key
const TRELLO_TOKEN = 'seu_token'; // Substitua pelo seu Token
const TRELLO_BOARD_ID = 'id_do_board'; // Substitua pelo ID do seu board

// Função para buscar cards do Trello
async function fetchTrelloCards() {
    try {
        const response = await fetch(
            `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar cards do Trello:', error);
        return [];
    }
}

// Função para buscar listas do Trello
async function fetchTrelloLists() {
    try {
        const response = await fetch(
            `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar listas do Trello:', error);
        return [];
    }
}

// Função para calcular pontos por dia
function calculatePointsByDay(cards, lists) {
    const pointsByDay = {};
    const today = new Date();
    
    cards.forEach(card => {
        const cardDate = new Date(card.dateLastActivity);
        const daysDiff = Math.floor((today - cardDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 0) {
            const points = parseInt(card.name.match(/\d+/)?.[0] || '0');
            const listName = lists.find(list => list.id === card.idList)?.name || 'Unknown';
            
            if (listName.toLowerCase().includes('done')) {
                pointsByDay[daysDiff] = (pointsByDay[daysDiff] || 0) + points;
            }
        }
    });
    
    return pointsByDay;
}

// Função para atualizar o gráfico
async function updateChart() {
    const cards = await fetchTrelloCards();
    const lists = await fetchTrelloLists();
    const pointsByDay = calculatePointsByDay(cards, lists);
    
    // Atualize o gráfico com os novos dados
    updateBurndownChart(pointsByDay);
}

// Atualize o gráfico a cada 5 minutos
setInterval(updateChart, 5 * 60 * 1000);

// Atualize imediatamente ao carregar
updateChart();
