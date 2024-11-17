// Seleção de elementos da DOM
const itemForm = document.getElementById('item-form');
const itensConteudo = document.getElementById('itens-conteudo');
const itensProgresso = document.getElementById('itens-progresso');
const itensConcluido = document.getElementById('itens-concluido');
const searchInput = document.getElementById('search');
const columns = [itensConteudo, itensProgresso, itensConcluido];

// Ao enviar o formulário, cria um novo item e o adiciona
itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Pega os valores dos campos do formulário
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const prioridade = document.getElementById('prioridade').value;
    const dataVencimento = document.getElementById('data-vencimento').value;
    const responsaveis = document.getElementById('responsaveis').value;

    // Cria um objeto para o novo item
    const item = {
        id: Date.now(),
        titulo,
        descricao,
        prioridade,
        dataVencimento,
        responsaveis,
        status: 'conteudo-estudar' // Status inicial
    };

    // Adiciona o item à página e ao localStorage
    addItem(item);
    saveItem(item);
    itemForm.reset();
});

// Função para adicionar um item à coluna correta
function addItem(item) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');
    itemDiv.setAttribute('draggable', 'true');
    itemDiv.setAttribute('data-id', item.id);
    itemDiv.innerHTML = `
        <h3>${item.titulo}</h3>
        <p>${item.descricao}</p>
        <p>Prioridade: ${item.prioridade}</p>
        <p>Data de Vencimento: ${item.dataVencimento}</p>
        <p>Responsáveis: ${item.responsaveis}</p>
        <button onclick="deleteItem(${item.id})">🗑️</button>
    `;
    setColorBasedOnDate(itemDiv, item.dataVencimento, item.status);
    appendItemToColumn(itemDiv, item.status);
    addDragAndDropEvents(itemDiv);
}

// Função para determinar em qual coluna o item deve ser adicionado
function appendItemToColumn(item, status) {
    switch (status) {
        case 'conteudo-estudar':
            itensConteudo.appendChild(item);
            break;
        case 'em-progresso':
            itensProgresso.appendChild(item);
            break;
        case 'concluido':
            itensConcluido.appendChild(item);
            break;
    }
}

// Função para adicionar os eventos de arraste e soltura nos itens
function addDragAndDropEvents(item) {
    item.addEventListener('dragstart', () => {
        item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
        const draggingItem = document.querySelector('.dragging');
        if (draggingItem) {
            // Remover todas as classes temporárias (exceto as de status)
            draggingItem.classList.remove('dragging'); // Remove o status temporário 'dragging'

            // Remove todas as outras classes que não sejam de status
            draggingItem.classList.remove('expired', 'near-deadline', 'concluido');

            // Agora, aplica o status correto com base na coluna onde o item foi movido
            const newStatus = draggingItem.parentElement.id; // O ID da coluna é o status
            draggingItem.classList.add(newStatus); // Adiciona a classe com o novo status

            // Atualiza o status no localStorage
            updateItemStatus(draggingItem.getAttribute('data-id'), newStatus); // Atualiza o status no localStorage
        }
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            if (draggingItem) {
                column.appendChild(draggingItem); // Faz o item "flutuar" sobre a coluna
            }
        });

        column.addEventListener('drop', () => {
            const draggingItem = document.querySelector('.dragging');
            if (draggingItem) {
                const newStatus = column.id; // Novo status baseado no id da coluna
                draggingItem.classList.remove('dragging'); // Remove o status temporário
                draggingItem.classList.add(newStatus); // Adiciona o status final

                // Atualiza o status no localStorage
                updateItemStatus(draggingItem.getAttribute('data-id'), newStatus); // Atualiza o status no localStorage
            }
        });
    });
}

// Função para atualizar o status do item no localStorage
function updateItemStatus(id, status) {
    let items = JSON.parse(localStorage.getItem('items')) || [];
    const updatedItem = items.find(item => item.id == id);

    if (updatedItem) {
        updatedItem.status = status; // Atualiza o status do item
        // Atualiza o localStorage com a lista de itens atualizada
        localStorage.setItem('items', JSON.stringify(items));
    }
}

// Função para salvar o item no localStorage
function saveItem(item) {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    items.push(item); // Adiciona o novo item à lista de itens
    localStorage.setItem('items', JSON.stringify(items)); // Salva no localStorage
}

// Função para carregar os itens do localStorage ao carregar a página
function loadItems() {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    clearColumns(); // Limpa as colunas antes de adicionar os itens

    // Carrega os itens separadamente para cada coluna com base no status
    items.forEach(item => {
        appendItemToColumn(createItemElement(item), item.status);
    });
}

// Função auxiliar para criar o elemento do item (HTML)
function createItemElement(item) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');
    itemDiv.setAttribute('draggable', 'true');
    itemDiv.setAttribute('data-id', item.id);
    itemDiv.innerHTML = `
        <h3>${item.titulo}</h3>
        <p>${item.descricao}</p>
        <p>Prioridade: ${item.prioridade}</p>
        <p>Data de Vencimento: ${item.dataVencimento}</p>
        <p>Responsáveis: ${item.responsaveis}</p>
        <button onclick="deleteItem(${item.id})">🗑️</button>
    `;
    setColorBasedOnDate(itemDiv, item.dataVencimento, item.status);
    return itemDiv;
}

// Função para excluir um item
function deleteItem(id) {
    let items = JSON.parse(localStorage.getItem('items')) || [];
    items = items.filter(item => item.id !== id); // Remove o item da lista
    localStorage.setItem('items', JSON.stringify(items)); // Atualiza o localStorage
    document.querySelector(`[data-id='${id}']`).remove(); // Remove o item da interface
}

// Função para filtrar itens com base no texto de busca
searchInput.addEventListener('input', (e) => {
    const searchText = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.item');
    items.forEach(item => {
        const title = item.querySelector('h3').innerText.toLowerCase();
        if (title.includes(searchText)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
});

// Função para alterar a cor do item com base na data de vencimento
function setColorBasedOnDate(item, date, status) {
    const now = new Date();
    const itemDate = new Date(date);
    const diffTime = itemDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    item.classList.remove('expired', 'near-deadline', 'concluido');

    if (status === 'concluido') {
        item.classList.add('concluido');
    } else if (diffDays <= 3 && diffDays >= 0) {
        item.classList.add('near-deadline');
    } else if (diffDays < 0) {
        item.classList.add('expired');
    }
}

// Função para limpar as colunas antes de carregar novos itens
function clearColumns() {
    itensConteudo.innerHTML = '';
    itensProgresso.innerHTML = '';
    itensConcluido.innerHTML = '';
}

// Ao carregar a página, carregue os itens do localStorage
document.addEventListener('DOMContentLoaded', () => {
    loadItems(); // Carrega os itens do
