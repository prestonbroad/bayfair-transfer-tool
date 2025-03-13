// Event Listeners
window.addEventListener("beforeunload", () => {
    saveCachedTransfers();
    saveHistory();
});

window.addEventListener("load", () => {
    cleanupOldData();
    
    // Initialize branch selectors
    document.getElementById('fromBranchSelect').value = fromBranch;
    document.getElementById('toBranchSelect').value = toBranch;
    
    // Check localStorage directly
    console.log('On page load - lastSeenVersion:', localStorage.getItem('lastSeenVersion'));
    
    // Initialize the update announcement
    handleUpdateAnnouncement();
    
    // Initialize version history
    handleVersionHistory();
    
    loadCachedTransfers();
    loadHistory();
    handleInstructions();
    updateBarcodeDisplay();
    updateHistoryDisplay();
    if (!document.getElementById("transferDescription").value) {
        document.getElementById("transferDescription").focus();
    }
}); 