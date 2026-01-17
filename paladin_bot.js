(async (ModuleLoader) => {
    'use strict';

    //****************************** Konfigurace ******************************//
    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1461838230663200890/Ff_OIbBuC3zMxKZFinwxmoJchc2Jq2h2l_nBddEp5hTE3Ys4o1-FCnpAZy20Zv92YnY";
    const minCheckInterval = 3000; 
    const maxCheckInterval = 7000; 
    const requiredRes = 500; // Nastavte cenu tréninku paladina
    //*************************** Konec Konfigurace ***************************//

    let isBotRunning = true;
    let lastResourceAlert = 0;

    const sendDiscordMessage = (content) => {
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `**[Paladin Bot]** ${content}` })
        }).catch(err => console.error("Chyba při odesílání na Discord:", err));
    };

    const stopBot = (reason) => {
        isBotRunning = false;
        console.error(`[STOP] Bot byl zastaven: ${reason}`);
        sendDiscordMessage(`🔴 **BOT ZASTAVEN!** Důvod: ${reason} @everyone`);
    };

    const checkCaptcha = () => {
        const hasCaptcha = document.querySelector('iframe[src*="recaptcha"]') || 
                           document.querySelector('.recaptcha-checkbox') ||
                           window.location.href.indexOf('bot_protection') > -1;
        if (hasCaptcha) {
            stopBot("Detekována CAPTCHA (ochrana proti botům).");
            return true;
        }
        return false;
    };

    const getRes = (type) => {
        const el = document.getElementById(`storage_${type}`);
        return el ? parseInt(el.textContent) : 0;
    };

    const run = async () => {
        if (!isBotRunning) return;

        // Kontrola Captchy před každým krokem
        if (checkCaptcha()) return;

        const knightActivity = document.querySelector("#knight_activity > span");
        const knightActions = document.querySelector("#knight_actions > div > a");
        
        // 1. Pokud paladin nepracuje
        if (!knightActivity && knightActions) {
            const wood = getRes('wood'), stone = getRes('stone'), iron = getRes('iron');

            if (wood >= requiredRes && stone >= requiredRes && iron >= requiredRes) {
                console.log("[Bot] Zahajuji výcvik...");
                knightActions.click();
                
                setTimeout(() => {
                    const firstOption = document.querySelector("#popup_box_knight_regimens > div > div:nth-child(4) > div.actions.center > a:nth-child(1)");
                    if (firstOption) firstOption.click();
                }, Math.random() * 1500 + 1000);
            } else {
                // Hlášení nedostatku surovin (max jednou za 10 minut)
                const now = Date.now();
                if (now - lastResourceAlert > 600000) {
                    sendDiscordMessage(`⚠️ Nedostatek surovin na další výcvik (D:${wood}, A:${stone}, Ž:${iron}). Čekám na doplnění.`);
                    lastResourceAlert = now;
                }
                console.warn("[Bot] Nedostatek surovin, zkusím to později...");
            }
        }

        // 2. Kontrola konce výcviku pro refresh
        const timerElement = document.querySelector("[data-endtime]");
        if (timerElement) {
            const endTime = parseInt(timerElement.getAttribute("data-endtime"));
            const nowSeconds = Math.round(Date.now() / 1000);
            if (endTime <= nowSeconds) {
                setTimeout(() => { if(isBotRunning) window.location.reload(); }, Math.random() * 4000 + 2000);
                return;
            }
        }

        // Plánování další smyčky
        const nextInterval = Math.random() * (maxCheckInterval - minCheckInterval) + minCheckInterval;
        setTimeout(run, nextInterval);
    };

    // Spuštění
    console.log("[Bot] Aktivován s Discord webhookem.");
    run();

})({
    loadModule: m => new Promise((res, rej) => {
        $.ajax({ url: `https://raw.githubusercontent.com/joaovperin/TribalWars/master/Modules/${m.replace('.', '/')}.js`, dataType: "text" })
         .done(data => res(eval(data))).fail(() => rej());
    })
});
