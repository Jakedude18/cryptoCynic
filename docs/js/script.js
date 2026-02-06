document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tx-form');
    const txDetailTable = document.getElementById('tx-detail-table');
    const recentTxTableBody = document.getElementById('recent-tx-table').querySelector('tbody');

    // -----------------------------
    // Load details for one transaction
    // -----------------------------
    async function loadTransaction(txid) {
        try {
            const res = await fetch(`http://127.0.0.1:8000/mempool/${txid}`);
            const data = await res.json();

            if (data.error) {
                alert("Transaction not found in mempool.");
                return;
            }

            const txData = {
                status: "Unconfirmed",
                fee: data.fee_sats + " sats",
                size: data.vsize + " vB",
                timeInMempool: data.time_in_mempool + " mins",
                mempoolRank: data.feerate + " sats/vB",
                estimatedConfirmation: "Calculating...",
                blockInclusion: "Pending",
                confirmations: "0"
            };

            const tableMap = [
                'status', 'fee', 'size', 'timeInMempool',
                'mempoolRank', 'estimatedConfirmation', 'blockInclusion', 'confirmations'
            ];

            tableMap.forEach((field, i) => {
                txDetailTable.rows[i+1].cells[1].innerText = txData[field];
            });

        } catch (err) {
            console.error(err);
            alert("Failed to fetch transaction.");
        }
    }

    // -----------------------------
    // Refresh recent transactions
    // -----------------------------
    async function refreshRecent(limit = 25) {
        try {
            const res = await fetch(`http://127.0.0.1:8000/mempool?limit=${limit}`);
            const data = await res.json();

            recentTxTableBody.innerHTML = "";

            data.txids.forEach((txid, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td><a href="#" class="tx-link" data-txid="${txid}">${txid.slice(0,12)}...</a></td>
                `;
                recentTxTableBody.appendChild(row);
            });

        } catch (err) {
            console.error("Failed to fetch recent transactions:", err);
        }
    }

    // -----------------------------
    // Handle form submission
    // -----------------------------
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const txid = document.getElementById('txid').value.trim();
        if (!txid) return alert("Please enter a transaction ID.");

        // Clear old table values
        for (let i = 1; i < txDetailTable.rows.length; i++) {
            txDetailTable.rows[i].cells[1].innerText = '--';
        }

        loadTransaction(txid);
    });

    // -----------------------------
    // Handle clicks on recent transactions
    // -----------------------------
    recentTxTableBody.addEventListener('click', (e) => {
        if (e.target.dataset.txid) {
            e.preventDefault();
            const txid = e.target.dataset.txid;
            document.getElementById('txid').value = txid;

            // Clear old table values
            for (let i = 1; i < txDetailTable.rows.length; i++) {
                txDetailTable.rows[i].cells[1].innerText = '--';
            }

            loadTransaction(txid);
        }
    });

    // -----------------------------
    // Initial load + auto-refresh
    // -----------------------------
    refreshRecent();
    setInterval(refreshRecent, 10000); // refresh every 10 seconds
});
