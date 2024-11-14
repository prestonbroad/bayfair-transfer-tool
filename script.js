// State management
let branch = "BAY";
let barcodes = [];
let clearedBarcodes = [];
let transferHistory = [];

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

// Branch switching
async function confirmBranchSwitch(newBranch) {
    if (barcodes.length > 0) {
        const confirmed = await showModal(
            "Switch Branch",
            "Switching destination branch will update all current entries. Continue?",
            true
        );
        if (confirmed) {
            branch = newBranch;
            barcodes = barcodes.map(item => ({
                ...item,
                destinationBranch: newBranch
            }));
            updateToggle();
            updateBarcodeDisplay();
            saveCachedTransfers();
        }
    } else {
        branch = newBranch;
        updateToggle();
    }
}

function updateToggle() {
    document.getElementById("bayBtn").classList.toggle("active", branch === "BAY");
    document.getElementById("bstBtn").classList.toggle("active", branch === "BST");
}

// Barcode handling
function addBarcode(event) {
    if (event.key === "Enter") {
        const input = event.target;
        const barcode = input.value.trim();
        if (barcode) {
            barcodes.unshift({
                barcode,
                destinationBranch: branch,
                timestamp: new Date().toISOString()
            });
            input.value = "";
            updateBarcodeDisplay();
            saveCachedTransfers();
        }
    }
}

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
            <td><button class="remove-btn" onclick="removeBarcode(${index})">Remove</button></td>
        </tr>
    `).join("");
    
    barcodeList.innerHTML = html;
    
    const input = document.getElementById("barcodeInput");
    if (input) input.focus();
}

async function removeBarcode(index) {
    const confirmed = await showModal(
        "Remove Barcode",
        "Remove this barcode?",
        true
    );
    if (confirmed) {
        barcodes.splice(index, 1);
        updateBarcodeDisplay();
        saveCachedTransfers();
    }
}

// Save functionality
async function confirmSave() {
    const description = document.getElementById("transferDescription").value.trim();
    if (!description) {
        await showModal(
            "Missing Description",
            "Please enter a description for this transfer."
        );
        document.getElementById("transferDescription").focus();
        return;
    }

    if (barcodes.length === 0) {
        await showModal(
            "No Barcodes",
            "Please add at least one barcode before saving."
        );
        document.getElementById("barcodeInput").focus();
        return;
    }

    const confirmed = await showModal(
        "Save Transfer",
        "Are you sure you want to save this transfer to a .dat file?",
        true
    );
    if (confirmed) {
        saveDatFile(description);
        clearAllBarcodes();
    }
}

function formatFileName(description) {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const fromBranch = branch === 'BST' ? 'BAY' : 'BST'; // If TO BST, then FROM BAY and vice versa
    return `from_${fromBranch}_${description.replace(/\s+/g, '_')}_${date}_${time}.dat`;
}

function saveDatFile(description) {
    const fileName = formatFileName(description);
    let content = "KUDOS V2\n";
    content += barcodes.map(item => {
        const paddedBarcode = item.barcode + " ".repeat(14 - item.barcode.length);
        // Use the destination branch directly as the branch code
        return `${paddedBarcode}${item.destinationBranch} 1`;
    }).join('\n');
    content += '\n';

    transferHistory.unshift({
        fileName,
        description,
        content,
        timestamp: new Date().toISOString(),
        barcodes: [...barcodes]
    });
    saveHistory();
    updateHistoryDisplay();

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);

    document.getElementById("transferDescription").value = "";
}

// Clear functionality
async function confirmClear() {
    if (barcodes.length === 0) {
        await showModal(
            "No Barcodes",
            "No barcodes to clear."
        );
        return;
    }

    const confirmed = await showModal(
        "Clear Barcodes",
        "Clear all barcodes? This cannot be undone.",
        true
    );
    if (confirmed) {
        clearedBarcodes = [...barcodes];
        clearAllBarcodes();
        setTimeout(async () => {
            const undoConfirmed = await showModal(
                "Undo Clear",
                "Do you want to undo the clear?",
                true
            );
            if (undoConfirmed) {
                undoClear();
            }
        }, 5000);
    }
}

function clearAllBarcodes() {
    barcodes = [];
    updateBarcodeDisplay();
    saveCachedTransfers();
}

function undoClear() {
    barcodes = [...clearedBarcodes];
    updateBarcodeDisplay();
    saveCachedTransfers();
}

// Cache management
function saveCachedTransfers() {
    const today = new Date().toISOString().split('T')[0];
    const cacheData = {
        date: today,
        transfers: barcodes
    };
    localStorage.setItem("dayTransfers", JSON.stringify(cacheData));
}

function saveHistory() {
    const today = new Date().toISOString().split('T')[0];
    const historyData = {
        date: today,
        transfers: transferHistory
    };
    localStorage.setItem("transferHistory", JSON.stringify(historyData));
}

function loadCachedTransfers() {
    try {
        const cachedData = localStorage.getItem("dayTransfers");
        if (cachedData) {
            const data = JSON.parse(cachedData);
            const today = new Date().toISOString().split('T')[0];
            
            if (data.date === today) {
                barcodes = data.transfers;
                updateBarcodeDisplay();
            } else {
                localStorage.removeItem("dayTransfers");
                barcodes = [];
            }
        }
    } catch (error) {
        console.error("Error loading cached transfers:", error);
        localStorage.removeItem("dayTransfers");
    }
}

function loadHistory() {
    try {
        const historyData = localStorage.getItem("transferHistory");
        if (historyData) {
            const data = JSON.parse(historyData);
            const today = new Date().toISOString().split('T')[0];
            
            if (data.date === today) {
                transferHistory = data.transfers;
                updateHistoryDisplay();
            } else {
                localStorage.removeItem("transferHistory");
                transferHistory = [];
            }
        }
    } catch (error) {
        console.error("Error loading history:", error);
        localStorage.removeItem("transferHistory");
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
                Download
            </button>
        </div>
    `).join("");
}

function redownloadTransfer(index) {
    const transfer = transferHistory[index];
    const blob = new Blob([transfer.content], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = transfer.fileName;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Daily cleanup
function cleanupOldData() {
    const today = new Date().toISOString().split('T')[0];
    const lastCleanup = localStorage.getItem('lastCleanupDate');

    if (lastCleanup !== today) {
        localStorage.removeItem('dayTransfers');
        localStorage.removeItem('transferHistory');
        localStorage.setItem('lastCleanupDate', today);
        barcodes = [];
        transferHistory = [];
        updateBarcodeDisplay();
        updateHistoryDisplay();
    }
}

// Event Listeners
window.addEventListener("beforeunload", () => {
    saveCachedTransfers();
    saveHistory();
});

window.addEventListener("load", () => {
    cleanupOldData();
    loadCachedTransfers();
    loadHistory();
    if (!document.getElementById("transferDescription").value) {
        document.getElementById("transferDescription").focus();
    }
});