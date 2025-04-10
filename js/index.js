import { config, loadConfig } from './config.js';
import { initializeGraph, updateGraph } from './graph.js';

// Carregar configurações salvas
loadConfig();

// Função para carregar dados simulados
async function loadSimulatedData() {
    try {
        const response = await fetch('../data/simulatedData.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erro ao carregar dados simulados:', error);
        return null;
    }
}

// Inicialização
async function initialize() {
    const data = await loadSimulatedData();
    if (data) {
        initializeGraph(data);
        
        if (config.refresh.autoRefresh) {
            setInterval(() => {
                updateGraph(data);
            }, config.refresh.interval);
        }
    }
}

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initialize); 