(async function() {
    const TOOL_ID = 'ASS';
    const REPO_URL = 'https://solitaryzbyn.github.io/hovna';

    // Pokud TwCheese neexistuje, inicializujeme jádro
    if (window.TwCheese === undefined) {
        
        const errorProxy = (reject, ctx) => (xhr) => {
            reject(new Error(`[${xhr.status}] Error at ${ctx.type}: ${ctx.url}`));
        };

        const core = {
            ROOT: REPO_URL,
            version: '1.10-1-rev-custom',
            tools: {},
            lastToolUsedId: null,

            // Načítání skriptů přes jQuery AJAX
            fetchLib: async function(path, cache = true) {
                return new Promise((res, rej) => {
                    $.ajax(`${this.ROOT}/${path}`, {
                        cache: cache,
                        dataType: "script",
                        complete: res,
                        error: errorProxy(rej, this)
                    });
                });
            },

            // Načítání nástrojů jako modulů
            injectModule: async function(id) {
                return new Promise((res) => {
                    const el = document.createElement('script');
                    Object.assign(el, {
                        type: 'module',
                        src: `${this.ROOT}/src/ToolSetup/${id}.js`,
                        onload: res
                    });
                    document.head.appendChild(el);
                });
            },

            registerTool(t) { this.tools[t.id] = t; },
            
            use(id) {
                this.lastToolUsedId = id;
                this.tools[id].use();
            },

            has(id) { return !!this.tools[id]; }
        };

        // Aliasy pro zpětnou kompatibilitu s moduly, které hledají specifické názvy funkcí
        core.loadVendorLibsMinified = (cb) => core.fetchLib(`dist/vendor.min.js?${cb}`);
        core.loadToolCompiled = (id, cb) => core.fetchLib(`dist/tool/setup-only/${id}.min.js?${cb}`);
        core.useTool = (id) => core.use(id);
        core.hasTool = (id) => core.has(id);

        window.TwCheese = core;

        // Prvotní spuštění prostředí
        await TwCheese.loadVendorLibsMinified('a2b0f8e1635207439b95aa79f918de49');
        await TwCheese.loadToolCompiled('Sidebar', 'b020ae3be1df353f2aefbc1f2662d0cf');
        TwCheese.use('Sidebar');
    }

    // Spuštění konkrétního nástroje (ASS)
    if (TwCheese.has(TOOL_ID)) {
        TwCheese.use(TOOL_ID);
    } else {
        await TwCheese.loadToolCompiled(TOOL_ID, 'edf88e826f1d77c559ccfac91be036d2');
        TwCheese.use(TOOL_ID);
    }
})();
