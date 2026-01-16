(function() {
    const LIMIT_HLINA = 400; 
    const MNOZSTVI = 10;      

    // Pomocná funkce pro náhodný čas
    const nahodnyCas = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    console.log("%c BEZPEČNĚJŠÍ Bot aktivován!", "color: black; background: #ffcc00; padding: 5px;");

    function hlidatTrh() {
        let kurzy = Array.from(document.querySelectorAll('.premium-exchange-sep'))
            .map(el => el.innerText.trim())
            .filter(t => t.length > 2);

        let kurzHlina = parseInt(kurzy[1]);
        if (isNaN(kurzHlina)) return;

        if (kurzHlina <= LIMIT_HLINA) {
            let inputHlina = document.getElementById("premium_exchange_buy_stone");
            
            if (inputHlina && inputHlina.value == "" && !document.querySelector('.btn-confirm-yes')) {
                console.log("Nalezena cena " + kurzHlina + ". Simuluji lidskou aktivitu...");

                // Simulace kliknutí do pole před zápisem
                inputHlina.focus();
                
                setTimeout(() => {
                    inputHlina.value = MNOZSTVI;
                    ['input', 'change'].forEach(evt => 
                        inputHlina.dispatchEvent(new Event(evt, { bubbles: true }))
                    );

                    // Náhodná pauza před kliknutím na Vypočítat (1.2 až 2.5 sekundy)
                    setTimeout(() => {
                        let btn = document.querySelector('.btn-premium-exchange-buy');
                        if (btn && !btn.disabled) {
                            btn.click();
                            
                            // Náhodná pauza před potvrzením (2 až 4 sekundy)
                            setTimeout(potvrditNakup, nahodnyCas(2000, 4000));
                        }
                    }, nahodnyCas(1200, 2500));
                }, nahodnyCas(500, 1000));
            }
        }
        
        // Nastavíme další kontrolu na náhodný čas (7 až 15 sekund)
        let dalsiKontrola = nahodnyCas(7000, 15000);
        setTimeout(hlidatTrh, dalsiKontrola);
    }

    function potvrditNakup() {
        let tlacitko = document.querySelector('.btn-confirm-yes');
        if (tlacitko) {
            tlacitko.click();
            console.log("Potvrzeno. Restartuji...");
            setTimeout(() => { window.location.reload(); }, nahodnyCas(3000, 6000));
        }
    }

    // Spuštění první kontroly
    hlidatTrh();
})();
