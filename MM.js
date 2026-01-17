(async (ModuleLoader, notificationConfig) => {
    'use strict';

    //****************************** Configuration ******************************//
    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1462130873586417857/tWUGkOsfGbXfQldQ0AGhUwapq6Fl9Zn5fvdECx1BLdV-ISrtoAQWgCkV9MyQIBNwNZ1o";
    const refreshMin = 5000; 
    const refreshMax = 9000; 
    const CRITICAL_THRESHOLD = 200;
    //*************************** End Configuration ***************************//

    await ModuleLoader.loadModule('utils/notify-utils');
    TwFramework.setIdleTitlePreffix('PREMIUM_ALERT', document.title);

    // Pojistka proti spamu (aby neposílal 3 zprávy každých 5 sekund)
    if (!window.lastCriticalAlert) window.lastCriticalAlert = 0;

    const sendDiscordMessage = async (msg, isCritical = false) => {
        const payload = { content: msg };
        const send = () => fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (isCritical) {
            // Pošle 3 zprávy po sobě pro maximální upozornění
            await send();
            await send();
            await send();
        } else {
            await send();
        }
    };

    const _checkMarket = () => {
        try {
            let woodTax = parseInt(/.*?(\d+).*/g.exec($('#premium_exchange_rate_wood div').text())[1]);
            let stoneTax = parseInt(/.*?(\d+).*/g.exec($('#premium_exchange_rate_stone div').text())[1]);
            let ironTax = parseInt(/.*?(\d+).*/g.exec($('#premium_exchange_rate_iron div').text())[1]);

            let criticalTriggered = [];
            let normalTriggered = [];

            // Kontrola kritických hodnot (pod 200)
            if (woodTax <= CRITICAL_THRESHOLD) criticalTriggered.push(`DŘEVO: ${woodTax}`);
            if (stoneTax <= CRITICAL_THRESHOLD) criticalTriggered.push(`HLÍNA: ${stoneTax}`);
            if (ironTax <= CRITICAL_THRESHOLD) criticalTriggered.push(`ŽELEZO: ${ironTax}`);

            // Kontrola běžných hodnot (pod 500)
            if (woodTax <= 500 && woodTax > CRITICAL_THRESHOLD) normalTriggered.push(`Dřevo (${woodTax})`);
            if (stoneTax <= 500 && stoneTax > CRITICAL_THRESHOLD) normalTriggered.push(`Hlína (${stoneTax})`);
            if (ironTax <= 500 && ironTax > CRITICAL_THRESHOLD) normalTriggered.push(`Železo (${ironTax})`);

            // 1. KRITICKÝ ALERT (POD 200)
            if (criticalTriggered.length > 0) {
                const now = Date.now();
                if (now - window.lastCriticalAlert > 30000) { // Omezení na jednou za 30s
                    const critMsg = `# 🚨 !!! KRITICKÁ HODNOTA POD ${CRITICAL_THRESHOLD} !!! 🚨\n# ⚡ ${criticalTriggered.join(' | ')} ⚡\n@everyone KUPUJ OKAMŽITĚ! 🟥🟥🟥`;
                    sendDiscordMessage(critMsg, true);
                    window.lastCriticalAlert = now;
                }
            } 
            // 2. BĚŽNÝ ALERT (POD 500)
            else if (normalTriggered.length > 0) {
                const msg = `🔔 **Burza Alert (Pod 500):** ${normalTriggered.join(', ')}`;
                sendDiscordMessage(msg, false);
            }

        } catch (e) {
            console.error("Chyba při čtení trhu.");
        }
    };

    // Vykreslení a okamžitá kontrola
    setInterval(() => {
        if (!$('#PEA-rtable').length) {
            $('#market_status_bar').append($(notificationConfig));
            _checkMarket();
            
            $('#PEA-save-btn').click(() => {
                UI.Notification.show(null, 'Uloženo', 'Nastavení bylo uloženo do paměti.');
            });
        }
    }, 500);

    // Náhodné obnovování stránky 5-9s
    const nextRefresh = Math.floor(Math.random() * (refreshMax - refreshMin + 1)) + refreshMin;
    console.log(`Příští refresh za ${nextRefresh / 1000}s`);
    setTimeout(() => {
        window.location.reload();
    }, nextRefresh);

})({
    loadModule: m => new Promise((res, rej) => {
        $.ajax({ url: `https://raw.githubusercontent.com/joaovperin/TribalWars/master/Modules/${m.replace('.', '/')}.js`, dataType: "text" })
         .done(data => res(eval(data))).fail(rej);
    })
}, `<div class="PEA-container"><h3>Burza Monitor (Ultra Alert <200)</h3>
<p>Skript běží automaticky. Kritické alerty (<200) posílají 3 zprávy na Discord.</p>
<button id='PEA-save-btn' class='btn'>Potvrdit aktivitu</button>
</div>`);
