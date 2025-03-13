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

// Migration function for old data format
function migrateOldData(data) {
    if (data.transfers && data.transfers.length > 0) {
        // Check if using old format (has destinationBranch instead of toBranch)
        if (data.transfers[0].destinationBranch !== undefined) {
            console.log("Migrating old data format to new format");
            data.transfers = data.transfers.map(item => {
                const toBranch = item.destinationBranch;
                const fromBranch = toBranch === 'BST' ? 'BAY' : 'BST';
                
                return {
                    barcode: item.barcode,
                    fromBranch,
                    toBranch,
                    timestamp: item.timestamp
                };
            });
        }
    }
    return data;
}

function loadCachedTransfers() {
    try {
        const cachedData = localStorage.getItem("dayTransfers");
        if (cachedData) {
            let data = JSON.parse(cachedData);
            const today = new Date().toISOString().split('T')[0];
            
            if (data.date === today) {
                // Migrate old data format if needed
                data = migrateOldData(data);
                
                barcodes = data.transfers;
                
                // Set the branch selectors to match the first barcode
                if (barcodes.length > 0) {
                    fromBranch = barcodes[0].fromBranch;
                    toBranch = barcodes[0].toBranch;
                    
                    // Update the UI selectors
                    document.getElementById('fromBranchSelect').value = fromBranch;
                    document.getElementById('toBranchSelect').value = toBranch;
                }
                
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
            let data = JSON.parse(historyData);
            const today = new Date().toISOString().split('T')[0];
            
            if (data.date === today) {
                // Migrate old history format if needed
                if (data.transfers && data.transfers.length > 0 && data.transfers[0].barcodes) {
                    data.transfers.forEach(transfer => {
                        if (transfer.barcodes && transfer.barcodes.length > 0 && 
                            transfer.barcodes[0].destinationBranch !== undefined) {
                            // Convert old barcode format
                            transfer.barcodes = transfer.barcodes.map(item => {
                                const toBranch = item.destinationBranch;
                                const fromBranch = toBranch === 'BST' ? 'BAY' : 'BST';
                                
                                return {
                                    barcode: item.barcode,
                                    fromBranch,
                                    toBranch,
                                    timestamp: item.timestamp
                                };
                            });
                        }
                    });
                }
                
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