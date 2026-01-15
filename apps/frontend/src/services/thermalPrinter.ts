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

export interface IndividualTicketData {
    companyName: string;
    companyAddress?: string;
    trip: {
        departure: string;
        arrival: string;
        date: string;
        shipName: string;
    };
    bookingRef: string;
    passenger: {
        name: string;
        type: string;
        price: number;
    };
    ticketNumber: string;
    qrCodeData: string;
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
            </body>
            </html>
        `;

        thermalPrintService.printHtml(html);
    },

    /**
     * Helper to print HTML using an iframe
     */
    printHtml: (html: string) => {
        const iframeId = 'thermal-printer-frame';
        let iframe = document.getElementById(iframeId) as HTMLIFrameElement;

        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = iframeId;
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
        }

        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(html);
            doc.close();
            // Wait for content to load then print
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
            }, 500);
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
                
                <div class="text-center" style="margin-top:20px; font-size:10px;">
                    Imprimé le ${data.date}
                </div>
            </body>
            </html>
        `;

        thermalPrintService.printHtml(html);
    },

    /**
     * Imprime UN ticket individuel avec QR code pour UN passager
     */
    printIndividualTicket: (data: IndividualTicketData) => {
        const width = '80mm';

        const style = `
            <style>
                @page { margin: 0; size: auto; }
                body {
                    font-family: 'Courier New', monospace;
                    width: ${width};
                    margin: 0;
                    padding: 8px;
                    font-size: 12px;
                    line-height: 1.3;
                    color: black;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .header { margin-bottom: 12px; border-bottom: 2px solid black; padding-bottom: 8px; }
                .trip-box { margin: 12px 0; border: 2px solid black; padding: 8px; background: #f0f0f0; }
                .passenger-box { margin: 12px 0; border: 1px dashed black; padding: 8px; }
                .qr-box { margin: 15px 0; padding: 10px; border: 2px solid black; background: white; }
                .footer { text-center; font-size: 10px; margin-top: 15px; border-top: 1px dashed black; padding-top: 8px; }
                .large-text { font-size: 18px; font-weight: bold; }
                .medium-text { font-size: 14px; font-weight: bold; }
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
                    <div style="margin: 8px 0;">================================</div>
                    <div class="medium-text">🎫 BILLET DE VOYAGE 🎫</div>
                </div>

                <div class="trip-box">
                    <div class="bold text-center medium-text">${data.trip.departure} → ${data.trip.arrival}</div>
                    <div class="text-center" style="margin-top: 5px;">Navire: ${data.trip.shipName}</div>
                    <div class="text-center">Départ: ${data.trip.date}</div>
                </div>

                <div class="passenger-box">
                    <div class="bold" style="font-size: 14px;">PASSAGER:</div>
                    <div style="font-size: 16px; font-weight: bold; margin: 5px 0;">${data.passenger.name}</div>
                    <div>Type: ${data.passenger.type === 'adult' ? 'Adulte' : data.passenger.type === 'child' ? 'Enfant' : 'Bébé'}</div>
                    <div>Prix: <span class="bold">${data.passenger.price.toLocaleString()} FCFA</span></div>
                </div>

                <div style="margin: 10px 0;">
                    <div>Réf. Réservation: <span class="bold">${data.bookingRef}</span></div>
                    <div>N° Ticket: <span class="bold">${data.ticketNumber}</span></div>
                    <div>Caisse: ${data.cashierName || 'Guichet'}</div>
                </div>

                <div class="qr-box text-center">
                    <div class="bold" style="margin-bottom: 8px;">CODE QR D'EMBARQUEMENT</div>
                    <div id="qrcode" style="margin: 10px auto; display: inline-block;"></div>
                    <div style="font-size: 9px; margin-top: 8px; word-break: break-all;">${data.qrCodeData}</div>
                </div>

                <div class="footer">
                    <div class="bold">⚠️ IMPORTANT ⚠️</div>
                    <div>Présentez ce ticket + QR code à l'embarquement</div>
                    <div>Billet non échangeable, non remboursable</div>
                    <div style="margin-top: 8px;">Imprimé le ${data.date}</div>
                    <div style="margin-top: 8px;">Bon voyage ! 🚢</div>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
                <script>
                    QRCode.toCanvas(document.getElementById('qrcode'), '${data.qrCodeData}', {
                        width: 200,
                        margin: 1,
                        errorCorrectionLevel: 'M'
                    }, function (error) {
                        if (error) console.error(error);
                    });
                </script>
            </body>
            </html>
        `;

        thermalPrintService.printHtml(html);
    }
};

