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
        status: 'conteudo-estudar'
    };

    addItem(item);
    saveItem(item);
    itemForm.reset();
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
    if (status === 'conteudo-estudar') {
        itensConteudo.appendChild(item);
    } else if (status === 'em-progresso') {
        itensProgresso.appendChild(item);
    } else if (status === 'concluido') {
        itensConcluido.appendChild(item);
    }
}

function addDragAndDropEvents(item) {
    item.addEventListener('dragstart', () => {
        item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        const newStatus = item.parentElement.id;
        updateItemStatus(item.getAttribute('data-id'), newStatus);
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            column.appendChild(draggingItem);
        });

        column.addEventListener('drop', () => {
            const draggingItem = document.querySelector('.dragging');
            const newStatus = column.id;
            updateItemStatus(draggingItem.getAttribute('data-id'), newStatus);
        });
    });
}

function updateItemStatus(id, status) {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    const updatedItems = items.map(item => {
        if (item.id == id) {
            item.status = status;
        }
        return item;
    });
    localStorage.setItem('items', JSON.stringify(updatedItems));
    loadItems();
}

function saveItem(item) {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    items.push(item);
    localStorage.setItem('items', JSON.stringify(items));
}

function loadItems() {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    items.forEach(item => {
        addItem(item);
    });
}

function deleteItem(id) {
    const items = JSON.parse(localStorage.getItem('items')) || [];
    const updatedItems = items.filter(item => item.id != id);
    localStorage.setItem('items', JSON.stringify(updatedItems));
    document.querySelector(`[data-id='${id}']`).remove();
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

document.addEventListener('DOMContentLoaded', loadItems);
