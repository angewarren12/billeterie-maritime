export interface ReceiptData {
    companyName: string;
    companyAddress?: string;
    trip: {
        departure: string;
        arrival: string;
        date: string;
        shipName: string;
    };
    bookingRef: string;
    passengers: Array<{
        name: string;
        type: string;
        price: number;
    }>;
    totalAmount: number;
    cashierName?: string;
    date: string;
}

export interface ZReportData {
    companyName: string;
    cashierName: string;
    date: string;
    startTime: string;
    endTime: string;
    totalRevenue: number;
    totalTransactions: number;
    paymentMethods: Array<{
        method: string;
        amount: number;
        count: number;
    }>;
}

export const thermalPrintService = {
    /**
     * Génère un rapport Z (Clôture)
     */
    printZReport: (data: ZReportData) => {
        const width = '80mm';
        const style = `
            <style>
                @page { margin: 0; size: auto; }
                body {
                    font-family: 'Courier New', monospace;
                    width: ${width};
                    margin: 0;
                    padding: 5px;
                    font-size: 12px;
                    line-height: 1.2;
                    color: black;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .header, .items { margin-bottom: 10px; border-bottom: 1px dashed black; padding-bottom: 5px; }
                .item-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
                .large-text { font-size: 16px; font-weight: bold; }
            </style>
        `;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>${style}</head>
            <body>
                <div class="header text-center">
                    <div class="large-text">${data.companyName}</div>
                    <div class="bold">CLOTURE DE CAISSE (Z)</div>
                </div>

                <div class="info">
                    <div>Caisse: ${data.cashierName}</div>
                    <div>Date: ${data.date}</div>
                    <div>Période: ${data.startTime} - ${data.endTime}</div>
                </div>

                <div class="items">
                    <div class="bold item-row">
                        <span>Méthode</span>
                        <span>Montant</span>
                    </div>
                    ${data.paymentMethods.map(p => `
                        <div class="item-row">
                            <span>${p.method} (${p.count})</span>
                            <span>${p.amount.toLocaleString()} F</span>
                        </div>
                    `).join('')}
                </div>

                <div class="totals">
                    <div class="item-row bold large-text">
                        <span>TOTAL</span>
                        <span>${data.totalRevenue.toLocaleString()} FCFA</span>
                    </div>
                    <div class="text-center" style="margin-top:5px">
                        Nb Trans: ${data.totalTransactions}
                    </div>
                </div>
                
                <div class="text-center" style="margin-top: 20px;">
                    Signature du Caissier:
                    <br/><br/><br/>
                    _________________
                </div>

                <script>
                    window.onload = function() { window.print(); setTimeout(function() { window.close(); }, 500); }
                </script>
            </body>
            </html>
        `;
        const printWindow = window.open('', '', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        }
    },

    /**
     * Génère un reçu HTML optimisé pour imprimante thermique (80mm) et lance l'impression
     */
    printReceipt: (data: ReceiptData) => {
        const width = '80mm'; // Standard thermal paper width

        const style = `
            <style>
                @page { margin: 0; size: auto; }
                body {
                    font-family: 'Courier New', monospace;
                    width: ${width};
                    margin: 0;
                    padding: 5px;
                    font-size: 12px;
                    line-height: 1.2;
                    color: black;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .header { margin-bottom: 10px; border-bottom: 1px dashed black; padding-bottom: 5px; }
                .items { margin-bottom: 10px; border-bottom: 1px dashed black; padding-bottom: 5px; }
                .item-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
                .totals { margin-bottom: 15px; }
                .footer { text-align: center; font-size: 10px; margin-top: 10px; }
                .large-text { font-size: 16px; font-weight: bold; }
            </style>
        `;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>${style}</head>
            <body>
                <div class="header text-center">
                    <div class="large-text">${data.companyName}</div>
                    ${data.companyAddress ? `<div>${data.companyAddress}</div>` : ''}
                    <div>--------------------------------</div>
                    <div class="bold">TICKET DE CAISSE</div>
                </div>

                <div class="info">
                    <div>Date: ${data.date}</div>
                    <div>Ref: <span class="bold">${data.bookingRef}</span></div>
                    <div>Caisse: ${data.cashierName || 'Guichet 1'}</div>
                </div>
                
                <div style="margin: 10px 0; border: 1px solid black; padding: 5px;">
                    <div class="bold text-center">${data.trip.departure} -> ${data.trip.arrival}</div>
                    <div class="text-center">Navire: ${data.trip.shipName}</div>
                    <div class="text-center">Départ: ${data.trip.date}</div>
                </div>

                <div class="items">
                    <div class="bold item-row">
                        <span>Description</span>
                        <span>Prix</span>
                    </div>
                    ${data.passengers.map(p => `
                        <div class="item-row">
                            <span>${p.name} (${p.type})</span>
                            <span>${p.price.toLocaleString()} F</span>
                        </div>
                    `).join('')}
                </div>

                <div class="totals">
                    <div class="item-row bold large-text">
                        <span>TOTAL</span>
                        <span>${data.totalAmount.toLocaleString()} FCFA</span>
                    </div>
                </div>

                <div class="footer">
                    <div>Merci de votre voyage !</div>
                    <div>Conservez ce ticket pour le contrôle.</div>
                    <br/>
                    <div class="text-center">
                        *** BILLET NON ECHANGEABLE ***
                    </div>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    }
                </script>
            </body>
            </html>
        `;

        // Ouvrir une fenêtre popup pour l'impression
        const printWindow = window.open('', '', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
        } else {
            console.error("Impossible d'ouvrir la fenêtre d'impression. Vérifiez les bloqueurs de popups.");
            alert("Veuillez autoriser les popups pour imprimer le ticket.");
        }
    }
};
