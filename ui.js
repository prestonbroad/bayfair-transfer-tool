// Modal handling
async function showModal(title, message, showCancel = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');
        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn = document.getElementById('modal-cancel');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        cancelBtn.style.display = showCancel ? 'block' : 'none';

        const handleConfirm = () => {
            modal.style.display = 'none';
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(true);
        };

        const handleCancel = () => {
            modal.style.display = 'none';
            confirmBtn.removeEventListener('click', handleConfirm);
            cancelBtn.removeEventListener('click', handleCancel);
            resolve(false);
        };

        confirmBtn.addEventListener('click', handleConfirm);
        cancelBtn.addEventListener('click', handleCancel);

        modal.style.display = 'flex';
    });
}

// Update announcement handling
function handleUpdateAnnouncement() {
    const updateModal = document.getElementById('updateAnnouncement');
    const confirmBtn = document.getElementById('update-confirm');
    
    // Check if user has seen this version's update
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    console.log('Current version:', currentVersion);
    console.log('Last seen version from localStorage:', lastSeenVersion);
    
    // Show update announcement if it's a new version
    if (!lastSeenVersion || lastSeenVersion !== currentVersion) {
        console.log('Showing update announcement');
        updateModal.style.display = 'flex';
    } else {
        console.log('Update announcement already seen');
    }
    
    // Got it button handler - Remove any existing event listeners first
    confirmBtn.removeEventListener('click', handleUpdateConfirm);
    confirmBtn.addEventListener('click', handleUpdateConfirm);
}

// Separate function to handle the update confirmation
function handleUpdateConfirm() {
    const updateModal = document.getElementById('updateAnnouncement');
    updateModal.style.display = 'none';
    
    // Store the current version in localStorage
    localStorage.setItem('lastSeenVersion', currentVersion);
    
    // Log to verify it's being set
    console.log('Update announcement dismissed. Version saved:', currentVersion);
}

// Instructions handling
function handleInstructions() {
    const instructions = document.getElementById('instructions');
    const showInstructionsBtn = document.getElementById('showInstructions');
    const closeBtn = document.querySelector('.close-btn');
    
    // Check if user has seen instructions before
    const hasSeenInstructions = localStorage.getItem('hasSeenInstructions');

    // Show instructions if it's the first visit
    if (!hasSeenInstructions) {
        instructions.style.display = 'block';
    }

    // Close button handler
    closeBtn.addEventListener('click', () => {
        instructions.style.display = 'none';
        localStorage.setItem('hasSeenInstructions', 'true');
    });

    // Show instructions button handler
    showInstructionsBtn.addEventListener('click', () => {
        instructions.style.display = 'block';
    });
}

// Version history handling
function handleVersionHistory() {
    const versionHistoryModal = document.getElementById('versionHistoryModal');
    const showVersionHistoryBtn = document.getElementById('showVersionHistory');
    const closeBtn = document.getElementById('version-history-close');
    
    // Show version history button handler
    showVersionHistoryBtn.addEventListener('click', () => {
        versionHistoryModal.style.display = 'flex';
    });
    
    // Close button handler
    closeBtn.addEventListener('click', () => {
        versionHistoryModal.style.display = 'none';
    });
}

// Barcode display functions
function updateBarcodeDisplay() {
    const barcodeList = document.getElementById("barcodeList");
    let html = `
        <tr class="scan-row">
            <td colspan="2">
                <input 
                    type="text" 
                    id="barcodeInput" 
                    placeholder="Scan or Enter Barcode" 
                    onkeypress="addBarcode(event)" 
                    autocomplete="off"
                >
            </td>
        </tr>
    `;
    
    html += barcodes.map((item, index) => `
        <tr>
            <td>${item.barcode}</td>
            <td><button class="remove-btn" onclick="removeBarcode(${index})"><span class="material-icons">delete</span></button></td>
        </tr>
    `).join("");
    
    barcodeList.innerHTML = html;
    
    const input = document.getElementById("barcodeInput");
    if (input) input.focus();
    
    // Update the barcode counter
    updateBarcodeCounter();
}

// New function to update the barcode counter
function updateBarcodeCounter() {
    const counterElement = document.getElementById("barcodeCounter");
    if (counterElement) {
        counterElement.textContent = barcodes.length;
    }
}

function updateHistoryDisplay() {
    const historyList = document.getElementById("historyList");
    if (transferHistory.length === 0) {
        historyList.innerHTML = '<div class="history-item">No transfers yet today</div>';
        return;
    }

    historyList.innerHTML = transferHistory.map((transfer, index) => `
        <div class="history-item">
            <div class="history-info">
                <div>${transfer.description}</div>
                <div class="history-time">
                    ${new Date(transfer.timestamp).toLocaleTimeString()}
                </div>
            </div>
            <button class="download-btn" onclick="redownloadTransfer(${index})">
                <span class="material-icons">download</span>
            </button>
        </div>
    `).join("");
} 