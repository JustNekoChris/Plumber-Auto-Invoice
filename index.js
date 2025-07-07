const container = document.getElementById('procedures-container');

function createProcedureRow() {
    const row = document.createElement('div');
    row.className = 'procedure-row';

    const textarea = document.createElement('textarea');
    textarea.rows = 1;
    textarea.placeholder = 'Describe the procedure...';
    textarea.addEventListener('input', autoGrow);
    textarea.addEventListener('input', maybeAddNewRow);

    const cost = document.createElement('input');
    cost.type = 'number';
    cost.placeholder = 'Cost';
    cost.className = 'cost-input';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✖';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => {
        if (container.children.length > 1) {
            container.removeChild(row);
        }
    });

    row.appendChild(textarea);
    row.appendChild(cost);
    row.appendChild(deleteBtn);
    container.appendChild(row);
}

function autoGrow(event) {
    const el = event.target;
    el.style.height = "auto";
    el.style.height = (el.scrollHeight) + "px";
}

function maybeAddNewRow() {
    const rows = container.querySelectorAll('.procedure-row textarea');
    const last = rows[rows.length - 1];
    if (last && last.value.trim() !== '') {
        // Add new row only if the last one has text
        const allEmpty = Array.from(rows).every(t => t.value.trim() === '');
        if (!allEmpty && container.children.length === rows.length) {
        createProcedureRow();
        }
    }
}

// Initialize with one row
createProcedureRow();
