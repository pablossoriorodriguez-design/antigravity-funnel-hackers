// State Management
let funnels = JSON.parse(localStorage.getItem('funnelSpy_data')) || [];

// DOM Elements
const funnelContainer = document.getElementById('funnel-container');
const funnelForm = document.getElementById('funnel-form');
const addFunnelBtn = document.getElementById('add-funnel-btn');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const emptyState = document.getElementById('empty-state');
const modalTitle = document.getElementById('modal-title');

// Stats Elements
const totalFunnelsEl = document.getElementById('total-funnels');
const activeFunnelsEl = document.getElementById('active-funnels');
const capturedFunnelsEl = document.getElementById('captured-funnels');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderFunnels();
    updateStats();
});

// -- Functions --

function saveToLocalStorage() {
    localStorage.setItem('funnelSpy_data', JSON.stringify(funnels));
}

function updateStats() {
    const total = funnels.length;
    const active = funnels.filter(f => f.status === 'Lanzado' || f.status === 'Escalando').length;
    const captured = funnels.filter(f => f.status === 'Capturado').length;

    totalFunnelsEl.textContent = total;
    activeFunnelsEl.textContent = active;
    capturedFunnelsEl.textContent = captured;
}

function renderFunnels() {
    funnelContainer.innerHTML = '';
    
    if (funnels.length === 0) {
        funnelContainer.appendChild(emptyState);
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    funnels.forEach(funnel => {
        const card = createFunnelCard(funnel);
        funnelContainer.appendChild(card);
    });
}

function createFunnelCard(funnel) {
    const card = document.createElement('div');
    card.className = 'funnel-card';
    card.setAttribute('data-id', funnel.id);

    const statusClass = funnel.status.toLowerCase().replace(/\s/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    card.innerHTML = `
        <div class="funnel-header">
            <span class="status-badge badge-${statusClass}">${funnel.status}</span>
            <div class="funnel-id-tag" style="font-size: 0.6rem; color: var(--text-muted)">#${funnel.id.slice(0, 8)}</div>
        </div>
        <div class="funnel-info">
            <h3>${funnel.name}</h3>
            <span class="funnel-niche">${funnel.niche || 'General'}</span>
            <a href="${funnel.url}" target="_blank" class="funnel-url">${funnel.url}</a>
        </div>
        <div class="funnel-actions">
            <button class="btn-action btn-edit" onclick="editFunnel('${funnel.id}')">Editar</button>
            <button class="btn-action btn-delete" onclick="deleteFunnel('${funnel.id}')">Eliminar</button>
        </div>
    `;
    return card;
}

// Modal Control
addFunnelBtn.addEventListener('click', () => {
    openModal();
});

function openModal(editing = false) {
    if (!editing) {
        funnelForm.reset();
        document.getElementById('funnel-id').value = '';
        modalTitle.textContent = 'Añadir Nuevo Embudo';
    }
    modalOverlay.style.display = 'flex';
}

function closeModal() {
    modalOverlay.style.display = 'none';
}

closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

// Form Logic
funnelForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('funnel-id').value;
    const name = document.getElementById('funnel-name').value;
    const url = document.getElementById('funnel-url').value;
    const niche = document.getElementById('funnel-niche').value;
    const status = document.getElementById('funnel-status').value;

    if (id) {
        // Edit
        const index = funnels.findIndex(f => f.id === id);
        funnels[index] = { ...funnels[index], name, url, niche, status };
    } else {
        // Create
        const newFunnel = {
            id: Date.now().toString(),
            name,
            url,
            niche,
            status,
            createdAt: new Date().toISOString()
        };
        funnels.unshift(newFunnel);
    }

    saveToLocalStorage();
    renderFunnels();
    updateStats();
    closeModal();
});

// Edit & Delete (Exposed to Global Scope for inline onclick)
window.editFunnel = (id) => {
    const funnel = funnels.find(f => f.id === id);
    if (!funnel) return;

    document.getElementById('funnel-id').value = funnel.id;
    document.getElementById('funnel-name').value = funnel.name;
    document.getElementById('funnel-url').value = funnel.url;
    document.getElementById('funnel-niche').value = funnel.niche;
    document.getElementById('funnel-status').value = funnel.status;

    modalTitle.textContent = 'Editar Embudo';
    openModal(true);
};

window.deleteFunnel = (id) => {
    if (confirm('¿Estás seguro de que quieres eliminar este embudo?')) {
        funnels = funnels.filter(f => f.id !== id);
        saveToLocalStorage();
        renderFunnels();
        updateStats();
    }
};
