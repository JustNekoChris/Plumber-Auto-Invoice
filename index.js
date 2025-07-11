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
    cost.addEventListener('input', updateTotal);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✖';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => {
        if (container.children.length > 1) {
            container.removeChild(row);
            updateTotal();
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
        createProcedureRow();
    }
}

function updateTotal() {
    const costInputs = container.querySelectorAll('.cost-input');
    let total = 0;

    costInputs.forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val)) {
            total += val;
        }
    });

    const input = document.getElementById('totalCost');
    const raw = parseFloat(total);
    if (!isNaN(raw)) {
        input.value = raw.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else {
        input.value = '';
    }
}


document.getElementById('totalCost').addEventListener('blur', () => {
    const input = document.getElementById('totalCost');
    const cleaned = input.value.replace(/,/g, '');
    const raw = parseFloat(cleaned);

    if (!isNaN(raw)) {
        input.value = raw.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else {
        input.value = '';
    }
});

document.getElementById('totalCost').addEventListener('input', (e) => {
    const input = e.target;

    // Allow only numbers, dot, and commas (for manual formatting or paste)
    input.value = input.value.replace(/[^\d.,]/g, '');
});


document.getElementById('resetButton').addEventListener('click', () => {
    updateTotal();
});

// Initialize with one row
createProcedureRow();

function gatherWorkOrderData() {
  return {
    name: document.getElementById('name').value,
    jobName: document.getElementById('jobName').value,
    techName: document.getElementById('techName').value,
    address: document.getElementById('address').value,
    jobLocation: document.getElementById('jobLocation').value,
    date: document.getElementById('date').value,
    datePlans: document.getElementById('datePlans').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    architect: document.getElementById('architect').value,
    procedures: Array.from(document.querySelectorAll('.procedure-row')).map(row => ({
      description: row.querySelector('textarea').value,
      cost: parseFloat(row.querySelector('.cost-input').value) || 0,
    })),
    totalCost: parseFloat(document.getElementById('totalCost').value.replace(/,/g, '')) || 0,
    paymentFollow: document.getElementById('paymentFollow').value,
    submittedBy: document.getElementById('submittedBy').value,
    withdrawPeriod: document.getElementById('withdrawPeriod').value,
  };
}

document.getElementById('savePdfBtn').addEventListener('click', async () => {
  const data = gatherWorkOrderData();
  try {
    const filePath = await window.electronAPI.generatePDF(data);
    alert(`PDF saved to ${filePath}`);
  } catch (error) {
    alert('Failed to generate PDF: ' + error.message);
  }
});
