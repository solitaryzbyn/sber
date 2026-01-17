(async function() {
    const TOOL_ID = 'ASS';
    const REPO_URL = 'https://solitaryzbyn.github.io/hovna';
    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1461838230663200890/Ff_OIbBuC3zMxKZFinwxmoJchc2Jq2h2l_nBddEp5hTE3Ys4o1-FCnpAZy20Zv92YnYf';

    const WAIT_TIME = 7200000; 
    const MIN_OFFSET = 60000; 
    const RANDOM_SPREAD = Math.floor(Math.random() * 420000); 
    const TOTAL_DELAY = WAIT_TIME + MIN_OFFSET + RANDOM_SPREAD;

    async function notifyDiscord(message) {
        if (!DISCORD_WEBHOOK_URL) return;
        try {
            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `⚠️ **TW Bot hlášení** ⚠️\n${message}\nČas: ${new Date().toLocaleTimeString()}`
                })
            });
        } catch (e) { console.error('Discord error', e); }
    }

    function isCaptchaPresent() {
        return document.getElementById('bot_check') || 
               document.querySelector('.h-captcha') || 
               document.querySelector('iframe[src*="hcaptcha"]') ||
               document.body.innerText.includes('Captcha');
    }

    const sleep = ms => new Promise(res => setTimeout(res, ms));

    async function runScavenging() {
        if (isCaptchaPresent()) {
            await notifyDiscord("Byla detekována hCaptcha! Bot se zastavil.");
            return;
        }

        if (window.TwCheese === undefined) {
            const core = {
                ROOT: REPO_URL,
                version: '1.10-1-rev-custom',
                tools: {},
                fetchLib: async function(path) {
                    return new Promise((res, rej) => {
                        $.ajax(`${this.ROOT}/${path}`, {
                            cache: true, dataType: "script", complete: res,
                            error: (xhr) => rej(new Error(`Chyba: ${path}`))
                        });
                    });
                },
                registerTool(t) { this.tools[t.id] = t; },
                use(id) { this.tools[id].use(); },
                has(id) { return !!this.tools[id]; }
            };
            core.loadVendorLibsMinified = (cb) => core.fetchLib(`dist/vendor.min.js?${cb}`);
            core.loadToolCompiled = (id, cb) => core.fetchLib(`dist/tool/setup-only/${id}.min.js?${cb}`);
            window.TwCheese = core;

            try {
                await TwCheese.loadVendorLibsMinified('a2b0f8e1635207439b95aa79f918de49');
                await TwCheese.loadToolCompiled('Sidebar', 'b020ae3be1df353f2aefbc1f2662d0cf');
                TwCheese.use('Sidebar');
            } catch (err) {
                await notifyDiscord(`Chyba inicializace: ${err.message}`);
                return;
            }
        }

        try {
            if (!TwCheese.has(TOOL_ID)) {
                await TwCheese.loadToolCompiled(TOOL_ID, 'edf88e826f1d77c559ccfac91be036d2');
            }
            TwCheese.use(TOOL_ID);
            console.log('[Bot] ASS spuštěn, čekám na výpočet (zprava doleva)...');

            // --- PŘIROZENÉ ODESÍLÁNÍ ZPRAVA DOLEVA ---
            setTimeout(async () => {
                // Najdeme všechna odesílací tlačítka a převedeme na pole
                let buttons = Array.from(document.querySelectorAll('.btn-send, .free_send_button'));
                
                // OBRÁCENÍ POŘADÍ (Zprava doleva)
                buttons.reverse(); 

                let count = 0;
                for (const btn of buttons) {
                    if (!btn.classList.contains('btn-disabled') && btn.offsetParent !== null) {
                        btn.click();
                        count++;
                        // Lidská prodleva 1.2s - 2s
                        const humanDelay = 1200 + Math.floor(Math.random() * 800);
                        await sleep(humanDelay);
                    }
                }
                console.log(`[Bot] Automaticky odesláno ${count} sběrů (v pořadí od nejvyššího).`);
            }, 3500); // Mírně delší prodleva pro jistotu výpočtu ASS

        } catch (err) {
            await notifyDiscord(`Chyba ASS: ${err.message}`);
            return;
        }

        const minutes = Math.floor(TOTAL_DELAY / 60000);
        console.log(`[Bot] Další refresh za ${minutes} minut.`);
        
        setTimeout(() => {
            if (!isCaptchaPresent()) {
                location.reload();
            } else {
                notifyDiscord("Captcha před refreshem! Stop.");
            }
        }, TOTAL_DELAY);
    }

    runScavenging();
})();
