// State management
let fromBranch = "BST";  // Default from branch
let toBranch = "BAY";    // Default to branch
let barcodes = [];
let clearedBarcodes = [];
let transferHistory = [];

// Version tracking for update announcements
const currentVersion = "1.1.0"; // Updated version number for barcode counter feature

// Branch selection
function updateBranchSelection(type) {
    if (type === 'from') {
        fromBranch = document.getElementById('fromBranchSelect').value;
        
        // If from and to are the same, change the to branch
        if (fromBranch === toBranch) {
            // Set to branch to something different
            const options = ['BAY', 'BST', 'BPU'].filter(b => b !== fromBranch);
            toBranch = options[0]; // Pick the first available option
            document.getElementById('toBranchSelect').value = toBranch;
        }
    } else {
        toBranch = document.getElementById('toBranchSelect').value;
        
        // If from and to are the same, change the from branch
        if (fromBranch === toBranch) {
            // Set from branch to something different
            const options = ['BAY', 'BST', 'BPU'].filter(b => b !== toBranch);
            fromBranch = options[0]; // Pick the first available option
            document.getElementById('fromBranchSelect').value = fromBranch;
        }
    }
    
    // If there are barcodes, confirm the change
    if (barcodes.length > 0) {
        confirmBranchChange();
    }
}

async function confirmBranchChange() {
    const confirmed = await showModal(
        "Change Branch",
        "Changing branches will update all current entries. Continue?",
        true
    );
    
    if (confirmed) {
        // Update all barcodes with new branch information
        barcodes = barcodes.map(item => ({
            ...item,
            fromBranch: fromBranch,
            toBranch: toBranch
        }));
        
        updateBarcodeDisplay();
        saveCachedTransfers();
    } else {
        // Revert the selection to match the barcodes
        if (barcodes.length > 0) {
            fromBranch = barcodes[0].fromBranch;
            toBranch = barcodes[0].toBranch;
            document.getElementById('fromBranchSelect').value = fromBranch;
            document.getElementById('toBranchSelect').value = toBranch;
        }
    }
}

// Barcode handling
function addBarcode(event) {
    if (event.key === "Enter") {
        const input = event.target;
        const barcode = input.value.trim();
        if (barcode) {
            barcodes.unshift({
                barcode,
                fromBranch,
                toBranch,
                timestamp: new Date().toISOString()
            });
            input.value = "";
            updateBarcodeDisplay();
            updateBarcodeCounter();
            saveCachedTransfers();
        }
    }
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
        updateBarcodeCounter();
        saveCachedTransfers();
    }
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
    updateBarcodeCounter();
    saveCachedTransfers();
}

function undoClear() {
    barcodes = [...clearedBarcodes];
    updateBarcodeDisplay();
    updateBarcodeCounter();
    saveCachedTransfers();
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
    return `from_${fromBranch}_${description.replace(/\s+/g, '_')}_${date}_${time}.dat`;
}

function saveDatFile(description) {
    const fileName = formatFileName(description);
    let content = "KUDOS V2\n";
    content += barcodes.map(item => {
        const paddedBarcode = item.barcode + " ".repeat(14 - item.barcode.length);
        // Use the destination branch directly as the branch code
        return `${paddedBarcode}${item.toBranch} 1`;
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

function redownloadTransfer(index) {
    const transfer = transferHistory[index];
    const blob = new Blob([transfer.content], { type: 'text/plain' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = transfer.fileName;
    link.click();
    URL.revokeObjectURL(link.href);
} 