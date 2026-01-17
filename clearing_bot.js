(async function() {
    const TOOL_ID = 'ASS';
    const REPO_URL = 'https://solitaryzbyn.github.io/hovna';
    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1461838230663200890/Ff_OIbBuC3zMxKZFinwxmoJchc2Jq2h2l_nBddEp5hTE3Ys4o1-FCnpAZy20Zv92YnYf';

    // NASTAVENÍ ČASU (1h základ + 1-8 min náhoda)
    const WAIT_TIME = 3600000; 
    const MIN_OFFSET = 60000; 

    async function playAlarm() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const playTone = () => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.type = 'sawtooth'; osc.frequency.setValueAtTime(880, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                osc.start(); osc.stop(audioCtx.currentTime + 0.5);
            };
            setInterval(playTone, 5000); playTone();
        } catch (e) { console.error("Audio error", e); }
    }

    async function notifyDiscord(message) {
        if (!DISCORD_WEBHOOK_URL) return;
        try {
            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: `⚠️ **TW Bot hlášení** ⚠️\n${message}\nČas: ${new Date().toLocaleTimeString()}` })
            });
        } catch (e) { console.error('Discord error', e); }
    }

    function isCaptchaPresent() {
        return document.getElementById('bot_check') || document.querySelector('.h-captcha') || document.body.innerText.includes('Captcha');
    }

    const sleep = ms => new Promise(res => setTimeout(res, ms));

    async function runScavengingCycle() {
        console.log(`%c[Bot] Cyklus spuštěn: ${new Date().toLocaleTimeString()}`, "color: yellow; font-weight: bold;");

        if (isCaptchaPresent()) {
            await notifyDiscord("Byla detekována hCaptcha! Bot se zastavil.");
            playAlarm();
            return;
        }

        // Inicializace TwCheese
        if (window.TwCheese === undefined) {
            window.TwCheese = {
                ROOT: REPO_URL, tools: {},
                fetchLib: async function(path) {
                    return new Promise((res) => $.ajax(`${this.ROOT}/${path}`, { cache: true, dataType: "script", complete: res }));
                },
                registerTool(t) { this.tools[t.id] = t; },
                use(id) { this.tools[id].use(); },
                has(id) { return !!this.tools[id]; }
            };
            await TwCheese.fetchLib('dist/vendor.min.js');
            await TwCheese.fetchLib('dist/tool/setup-only/Sidebar.min.js');
            TwCheese.use('Sidebar');
        }

        try {
            if (!TwCheese.has(TOOL_ID)) await TwCheese.fetchLib(`dist/tool/setup-only/${TOOL_ID}.min.js`);
            TwCheese.use(TOOL_ID);

            // Krátká pauza na načtení ASS políček
            await sleep(4000);

            // Odesílání zprava doleva s lidskou prodlevou
            let buttons = Array.from(document.querySelectorAll('.btn-send, .free_send_button')).reverse();
            let count = 0;
            for (const btn of buttons) {
                if (!btn.classList.contains('btn-disabled') && btn.offsetParent !== null) {
                    btn.click();
                    count++;
                    await sleep(1300 + Math.floor(Math.random() * 800));
                }
            }
            
            // Výpočet času pro příští cyklus
            const randomSpread = Math.floor(Math.random() * 420000);
            const nextDelay = WAIT_TIME + MIN_OFFSET + randomSpread;
            const nextRunTime = new Date(Date.now() + nextDelay);

            console.log(`%c[Bot] Odesláno ${count} sběrů.`, "color: green; font-weight: bold;");
            console.log(`%c[Bot] Další cyklus bez refreshe započne v: ${nextRunTime.toLocaleTimeString('cs-CZ')}`, "color: cyan; font-weight: bold;");
            
            // Místo location.reload() jen naplánujeme další spuštění funkce v tomto okně
            setTimeout(runScavengingCycle, nextDelay);

        } catch (err) {
            console.error("ASS Error", err);
            await notifyDiscord(`Chyba: ${err.message}`);
        }
    }

    runScavengingCycle();
})();
