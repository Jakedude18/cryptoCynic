document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const txTable = document.querySelector('table');
    const mempoolList = document.getElementById('mempool-list');

    if (!form || !txTable || !mempoolList) return;

    // -----------------------------
    // Function: Load transaction
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
                'status',
                'fee',
                'size',
                'timeInMempool',
                'mempoolRank',
                'estimatedConfirmation',
                'blockInclusion',
                'confirmations'
            ];

            tableMap.forEach((field, i) => {
                txTable.rows[i+1].cells[1].innerText = txData[field];
            });

        } catch (err) {
            console.error(err);
            alert("Failed to fetch transaction.");
        }
    }

    // -----------------------------
    // Function: Refresh mempool list
    // -----------------------------
    async function refreshMempool(limit = 25) {
        try {
            const res = await fetch(`http://127.0.0.1:8000/mempool?limit=${limit}`);
            const data = await res.json();

            mempoolList.innerHTML = "";

            data.txids.forEach(txid => {
                const li = document.createElement("li");
                li.innerHTML = `<a href="#" data-txid="${txid}">${txid.slice(0,12)}...</a>`;
                mempoolList.appendChild(li);
            });
        } catch (err) {
            console.error("Failed to fetch mempool:", err);
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
        for (let i = 1; i < txTable.rows.length; i++) {
            txTable.rows[i].cells[1].innerText = '--';
        }

        loadTransaction(txid);
    });

    // -----------------------------
    // Handle clicks on mempool list
    // -----------------------------
    mempoolList.addEventListener('click', (e) => {
        if (e.target.dataset.txid) {
            e.preventDefault();
            const txid = e.target.dataset.txid;
            document.getElementById('txid').value = txid;

            // Clear old table values
            for (let i = 1; i < txTable.rows.length; i++) {
                txTable.rows[i].cells[1].innerText = '--';
            }

            loadTransaction(txid);
        }
    });

    // -----------------------------
    // Initial mempool load + auto-refresh
    // -----------------------------
    refreshMempool();
    setInterval(refreshMempool, 10000); // refresh every 10 seconds
});
