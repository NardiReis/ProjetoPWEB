const itemForm = document.getElementById('item-form');
const itensConteudo = document.getElementById('itens-conteudo');
const itensProgresso = document.getElementById('itens-progresso');
const itensConcluido = document.getElementById('itens-concluido');
const searchInput = document.getElementById('search');
const columns = [itensConteudo, itensProgresso, itensConcluido];

itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const prioridade = document.getElementById('prioridade').value;
    const dataVencimento = document.getElementById('data-vencimento').value;
    const responsaveis = document.getElementById('responsaveis').value;

    const item = {
        id: Date.now(),
        titulo,
        descricao,
        prioridade,
        dataVencimento,
        responsaveis,
        status: 'conteudo-estudar' // Status inicial
    };

    addItem(item);
    saveItem(item);
    itemForm.reset();
    console.log('Item adicionado e salvo:', item); // Log de depuração
});

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

function addDragAndDropEvents(item) {
    item.addEventListener('dragstart', () => {
        item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
        const draggingItem = document.querySelector('.dragging');
        if (draggingItem) {
            draggingItem.classList.remove('dragging');
            const newStatus = draggingItem.parentElement.id;
            updateItemStatus(draggingItem.getAttribute('data-id'), newStatus); // Atualizando o status no localStorage
            console.log('Item movido para:', newStatus); // Log de depuração
        }
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            if (draggingItem) {
                column.appendChild(draggingItem);
            }
        });

        column.addEventListener('drop', () => {
            const draggingItem = document.querySelector('.dragging');
            if (draggingItem) {
                const newStatus = column.id; // Pegando o novo status baseado na coluna
                updateItemStatus(draggingItem.getAttribute('data-id'), newStatus); // Atualizando o status do item no localStorage
            }
        });
    });
}

function updateItemStatus(id, status) {
    let items = JSON.parse(localStorage.getItem('items')) || [];
    const updatedItem = items.find(item => item.id == id);

    if (updatedItem) {
        updatedItem.status = status; // Atualizando o status do item
        // Salvando os itens atualizados no localStorage
        localStorage.setItem('items', JSON.stringify(items));
        console.log('Status do item atualizado no localStorage:', id, status); // Log de depuração
    }
}

function saveItem(item) {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    items.push(item); // Adicionando o novo item ao array
    localStorage.setItem('items', JSON.stringify(items)); // Salvando no localStorage
    console.log('Itens salvos no localStorage:', items); // Log de depuração
}

function loadItems() {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    clearColumns(); // Limpa as colunas antes de carregar os itens
    items.forEach(item => {
        addItem(item); // Adiciona o item na coluna correspondente ao seu status
    });
    console.log('Itens carregados do localStorage:', items); // Log de depuração
}

function deleteItem(id) {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    const updatedItems = items.filter(item => item.id != id);
    localStorage.setItem('items', JSON.stringify(updatedItems));
    document.querySelector(`[data-id='${id}']`).remove();
    console.log('Item deletado:', id); // Log de depuração
}

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

function clearColumns() {
    itensConteudo.innerHTML = '';
    itensProgresso.innerHTML = '';
    itensConcluido.innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
    loadItems(); // Carrega os itens do localStorage ao carregar a página
    console.log('Página carregada e itens carregados do localStorage.'); // Log de depuração
});
