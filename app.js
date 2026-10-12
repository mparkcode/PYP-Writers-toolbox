// Application Data Holder
let pypData = { units: [] };

// Application Navigation State
let currentState = {
    view: 'home', // 'home' | 'unit' | 'tool' | 'strategy'
    unitId: null,
    toolId: null,
    strategyId: null
};

// Track active example index for each sentence starter / advert to allow cycling
let exampleIndexes = {};

// DOM Elements
let appContent;
let breadcrumbNav;

// Load Data and Initialize Application
window.onload = async function() {
    appContent = document.getElementById('app-content');
    breadcrumbNav = document.getElementById('breadcrumb');

    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Could not load data.json');
        pypData = await response.json();
    } catch (error) {
        console.error('Error fetching data.json:', error);
    }

    renderView();
    document.getElementById('json-display').textContent = JSON.stringify(pypData, null, 2);
};

function navigateTo(view, params = {}) {
    currentState.view = view;
    if (params.unitId !== undefined) currentState.unitId = params.unitId;
    if (params.toolId !== undefined) currentState.toolId = params.toolId;
    if (params.strategyId !== undefined) currentState.strategyId = params.strategyId;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderView();
}

function renderBreadcrumbs() {
    let crumbs = [
        { label: "🏠 Home", action: () => navigateTo('home') }
    ];

    const currentUnit = pypData.units.find(u => u.id === currentState.unitId);
    if (currentUnit && (currentState.view === 'unit' || currentState.view === 'tool' || currentState.view === 'strategy')) {
        crumbs.push({ 
            label: currentUnit.title.split(':')[0], 
            action: () => navigateTo('unit', { unitId: currentUnit.id }) 
        });
    }

    if (currentUnit) {
        const currentTool = currentUnit.tools.find(t => t.id === currentState.toolId);
        if (currentTool && (currentState.view === 'tool' || currentState.view === 'strategy')) {
            crumbs.push({ 
                label: currentTool.title, 
                action: () => navigateTo('tool', { toolId: currentTool.id }) 
            });
        }

        if (currentTool && currentState.view === 'strategy') {
            const currentStrategy = currentTool.strategies?.find(s => s.id === currentState.strategyId);
            if (currentStrategy) {
                crumbs.push({ 
                    label: currentStrategy.title.split(' ')[0], 
                    action: null 
                });
            }
        }
    }

    breadcrumbNav.innerHTML = crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        if (isLast) {
            return `<span class="text-pypBlue font-bold">${crumb.label}</span>`;
        } else {
            return `<button onclick="crumbClick(${idx})" class="hover:text-pypBlue hover:underline transition">${crumb.label}</button>
                    <span class="text-slate-300">/</span>`;
        }
    }).join('');

    window.crumbActions = crumbs.map(c => c.action);
}

function crumbClick(index) {
    if (window.crumbActions && window.crumbActions[index]) {
        window.crumbActions[index]();
    }
}

function renderView() {
    renderBreadcrumbs();

    switch (currentState.view) {
        case 'home':
            renderHomeView();
            break;
        case 'unit':
            renderUnitView();
            break;
        case 'tool':
            renderToolView();
            break;
        case 'strategy':
            renderStrategyView();
            break;
        default:
            renderHomeView();
    }
}

// 1. HOME VIEW
function renderHomeView() {
    let html = `
        <div class="mb-8 bg-gradient-to-r from-pypBlue to-teal-600 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div class="relative z-10 max-w-2xl">
                <span class="bg-white/20 text-white font-bold text-xs uppercase px-3 py-1 rounded-full tracking-wider mb-3 inline-block">Welcome Students!</span>
                <h2 class="text-2xl md:text-4xl font-bold mb-2">What are you inquiring about today?</h2>
                <p class="text-teal-50 text-sm md:text-base font-medium">Select your current PYP Unit of Inquiry below to explore helpers, sentence starters, and writing tools.</p>
            </div>
            <div class="absolute -right-6 -bottom-6 text-8xl opacity-20 select-none">💡</div>
        </div>

        <h3 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>📚</span> Units of Inquiry
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    `;

    pypData.units.forEach(unit => {
        if (unit.active) {
            html += `
                <div onclick="navigateTo('unit', { unitId: '${unit.id}' })" 
                     class="card-hover bg-white border-2 border-pypBlue p-6 rounded-3xl shadow-sm cursor-pointer flex flex-col justify-between relative group">
                    <div>
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-4xl p-2 bg-teal-50 rounded-2xl">${unit.icon}</span>
                            <span class="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1 rounded-full">${unit.badge}</span>
                        </div>
                        <h4 class="text-lg font-bold text-slate-800 mb-1 group-hover:text-pypBlue transition">${unit.title}</h4>
                        <p class="text-xs font-semibold text-slate-500 mb-3">${unit.subtitle}</p>
                        <p class="text-sm text-slate-600 leading-relaxed">${unit.description}</p>
                    </div>
                    <div class="mt-6 flex items-center text-pypBlue font-bold text-sm">
                        <span>Open Unit</span>
                        <span class="ml-2 group-hover:translate-x-1 transition-transform">➔</span>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="bg-slate-100 border-2 border-dashed border-slate-300 p-6 rounded-3xl opacity-75 flex flex-col justify-between relative">
                    <div>
                        <div class="flex justify-between items-start mb-4">
                            <span class="text-4xl p-2 bg-slate-200 rounded-2xl opacity-60">${unit.icon}</span>
                            <span class="bg-slate-200 text-slate-600 font-bold text-xs px-3 py-1 rounded-full">${unit.badge}</span>
                        </div>
                        <h4 class="text-lg font-bold text-slate-600 mb-1">${unit.title}</h4>
                        <p class="text-xs font-semibold text-slate-400 mb-3">${unit.subtitle}</p>
                        <p class="text-xs text-slate-500 italic">This unit will unlock later in the school year!</p>
                    </div>
                    <div class="mt-6 text-xs text-slate-400 font-bold">🔒 Locked</div>
                </div>
            `;
        }
    });

    html += `</div>`;
    appContent.innerHTML = html;
}

// 2. UNIT VIEW
function renderUnitView() {
    const unit = pypData.units.find(u => u.id === currentState.unitId);
    if (!unit) return renderHomeView();

    let html = `
        <div class="mb-6 flex items-center justify-between">
            <div>
                <span class="text-xs font-bold text-pypBlue uppercase tracking-wider">Unit Tools</span>
                <h2 class="text-2xl md:text-3xl font-bold text-slate-800">${unit.title}</h2>
            </div>
            <button onclick="navigateTo('home')" class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-2xl text-sm transition">
                ← Back to Units
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    `;

    unit.tools.forEach(tool => {
        if (tool.active) {
            html += `
                <div onclick="navigateTo('tool', { toolId: '${tool.id}' })" 
                     class="card-hover bg-white border-2 border-pypYellow p-6 rounded-3xl shadow-sm cursor-pointer flex items-start gap-4 group">
                    <span class="text-5xl p-3 bg-amber-50 rounded-2xl">${tool.icon}</span>
                    <div>
                        <span class="bg-amber-100 text-amber-800 font-bold text-xs px-2.5 py-0.5 rounded-full mb-2 inline-block">Interactive Tool</span>
                        <h3 class="text-xl font-bold text-slate-800 group-hover:text-pypOrange transition">${tool.title}</h3>
                        <p class="text-xs text-slate-500 mt-1 mb-3">${tool.subtitle}</p>
                        <span class="text-xs text-pypOrange font-bold flex items-center gap-1">
                            Click to launch helper <span class="group-hover:translate-x-1 transition-transform">➔</span>
                        </span>
                    </div>
                </div>
            `;
        }
    });

    html += `</div>`;
    appContent.innerHTML = html;
}

// 3. TOOL VIEW
function renderToolView() {
    const unit = pypData.units.find(u => u.id === currentState.unitId);
    const tool = unit?.tools.find(t => t.id === currentState.toolId);
    if (!tool) return renderHomeView();

    // TOOL WITH STRATEGIES
    if (tool.strategies) {
        let html = `
            <div class="mb-6 flex items-center justify-between">
                <div>
                    <span class="text-xs font-bold text-pypOrange uppercase tracking-wider">${unit.title}</span>
                    <h2 class="text-2xl md:text-3xl font-bold text-slate-800">${tool.title}</h2>
                    <p class="text-xs md:text-sm text-slate-500 font-medium">Choose a part of your persuasive text to practice!</p>
                </div>
                <button onclick="navigateTo('unit')" class="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-2xl text-sm transition">
                    ← Back
                </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        `;

        tool.strategies.forEach(strat => {
            if (strat.active) {
                html += `
                    <div onclick="navigateTo('strategy', { strategyId: '${strat.id}' })"
                         class="card-hover bg-gradient-to-br from-white to-amber-50/50 border-2 border-pypYellow p-5 rounded-3xl shadow-sm cursor-pointer flex flex-col justify-between group">
                        <div>
                            <div class="flex justify-between items-center mb-3">
                                <span class="text-3xl p-2 bg-white rounded-2xl shadow-sm border border-slate-100">${strat.icon}</span>
                                <span class="bg-pypYellow text-slate-800 font-bold text-xs px-2.5 py-1 rounded-full">Active</span>
                            </div>
                            <h3 class="text-lg font-bold text-slate-800 group-hover:text-pypOrange transition">${strat.title}</h3>
                            <p class="text-xs text-slate-500 mt-1">${strat.type === 'generator' ? 'Interactive title generator tool.' : 'Explore sentence starters & example sentences.'}</p>
                        </div>
                        <div class="mt-5 text-pypOrange font-bold text-xs flex items-center gap-1">
                            ${strat.type === 'generator' ? 'Launch Generator' : 'Open Starters'} <span class="group-hover:translate-x-1 transition-transform">➔</span>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="bg-slate-100 border-2 border-dashed border-slate-300 p-5 rounded-3xl opacity-70 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-center mb-3">
                                <span class="text-3xl p-2 bg-slate-200 rounded-2xl opacity-60">${strat.icon}</span>
                                <span class="bg-slate-200 text-slate-500 font-bold text-xs px-2.5 py-1 rounded-full">Coming Soon</span>
                            </div>
                            <h3 class="text-lg font-bold text-slate-600">${strat.title}</h3>
                            <p class="text-xs text-slate-400 mt-1">This section will be available soon!</p>
                        </div>
                        <div class="mt-5 text-xs text-slate-400 font-bold">🔒 Placeholder</div>
                    </div>
                `;
            }
        });

        html += `</div>`;
        appContent.innerHTML = html;
    } 
    // TOOL WITH CYCLING VISUAL ADVERTS
    else if (tool.adverts) {
        const adKey = `tool_ad_${tool.id}`;
        if (exampleIndexes[adKey] === undefined) {
            exampleIndexes[adKey] = 0;
        }

        const currentAdIdx = exampleIndexes[adKey];
        const currentAd = tool.adverts[currentAdIdx];
        const totalAds = tool.adverts.length;

        let html = `
            <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-2xl">${tool.icon}</span>
                        <h2 class="text-2xl md:text-3xl font-bold text-slate-800">${tool.title}</h2>
                    </div>
                    <p class="text-sm text-slate-600 bg-amber-50 border border-amber-200 p-3 rounded-2xl max-w-2xl font-medium">
                        💡 <strong>Teacher Tip:</strong> ${tool.explanation}
                    </p>
                </div>
                <button onclick="navigateTo('unit')" class="self-start md:self-auto bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-2xl text-sm transition">
                    ← Back to Unit Tools
                </button>
            </div>

            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span>🖼️</span> Interactive Product Advert Preview
                </h3>
                <span class="text-xs font-bold text-pypRed bg-pink-100 px-3 py-1 rounded-full">
                    Advert ${currentAdIdx + 1} of ${totalAds}
                </span>
            </div>

            <div class="bg-white border-4 border-pypRed rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row max-w-4xl mx-auto">
                <div class="md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-slate-900">
                    <img src="${currentAd.image}" alt="${currentAd.product}" class="w-full h-full object-cover transform hover:scale-105 transition duration-500">
                    <div class="absolute top-3 left-3 bg-pypRed text-white font-extrabold text-xs px-3 py-1 rounded-full shadow">
                        ${currentAd.emotion}
                    </div>
                </div>

                <div class="md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-white to-rose-50/40">
                    <div>
                        <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Featured Product</span>
                        <h4 class="text-2xl md:text-3xl font-bold text-slate-800 font-heading mb-4">
                            ${currentAd.product}
                        </h4>

                        <div class="bg-white border-2 border-rose-200 p-5 rounded-2xl shadow-inner my-2">
                            <span class="text-xs font-bold text-pypRed uppercase tracking-wider mb-1 block">Catchy Pathos Slogan</span>
                            <p class="text-lg md:text-xl font-bold text-slate-800 italic leading-relaxed">
                                "${currentAd.tagline}"
                            </p>
                        </div>
                    </div>

                    <div class="mt-6 flex justify-end">
                        <button onclick="cycleAdverts('${adKey}', ${totalAds})" 
                                class="bg-pypRed hover:bg-rose-700 active:scale-95 text-white font-bold px-6 py-3 rounded-2xl text-sm shadow-md transition flex items-center gap-2">
                            <span>Next Advert 🎲</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        appContent.innerHTML = html;
    }
}

function cycleAdverts(key, total) {
    exampleIndexes[key] = (exampleIndexes[key] + 1) % total;
    renderToolView();
}

// 4. STRATEGY VIEW
function renderStrategyView() {
    const unit = pypData.units.find(u => u.id === currentState.unitId);
    const tool = unit?.tools.find(t => t.id === currentState.toolId);
    const strategy = tool?.strategies?.find(s => s.id === currentState.strategyId);

    if (!strategy) return renderHomeView();

    // INTERACTIVE GENERATOR VIEW (Catchy Title Generator)
    if (strategy.type === 'generator') {
        let html = `
            <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-2xl">${strategy.icon}</span>
                        <h2 class="text-2xl md:text-3xl font-bold text-slate-800">${strategy.title}</h2>
                    </div>
                    <p class="text-sm text-slate-600 bg-amber-50 border border-amber-200 p-3 rounded-2xl max-w-2xl font-medium">
                        💡 <strong>Teacher Tip:</strong> ${strategy.explanation}
                    </p>
                </div>
                <button onclick="navigateTo('tool')" class="self-start md:self-auto bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-2xl text-sm transition">
                    ← Back to Tool
                </button>
            </div>

            <div class="bg-white border-4 border-pypYellow rounded-3xl p-6 md:p-8 shadow-md max-w-3xl mx-auto">
                <label for="product-input" class="block text-slate-800 font-bold text-lg mb-2 font-heading">
                    What product are you selling at the Entrepreneur Fair?
                </label>
                
                <div class="flex flex-col sm:flex-row gap-3 mb-6">
                    <input type="text" id="product-input" placeholder="e.g. ice-cream, stickers, pet rock, homework helper..." 
                           class="flex-grow bg-slate-50 border-2 border-slate-300 focus:border-pypOrange rounded-2xl px-4 py-3 text-base md:text-lg font-semibold text-slate-800 outline-none transition">
                    <button onclick="generateTitles()" 
                            class="bg-pypOrange hover:bg-amber-600 active:scale-95 text-white font-bold px-6 py-3 rounded-2xl text-sm md:text-base shadow transition flex items-center justify-center gap-2">
                        <span>Generate Titles 🪄</span>
                    </button>
                </div>

                <div id="titles-output" class="hidden space-y-4 pt-4 border-t-2 border-slate-100">
                    <h3 class="text-sm font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2">
                        <span>🌟</span> Suggested Catchy Titles:
                    </h3>
                    <div id="titles-list" class="space-y-3"></div>
                </div>
            </div>
        `;
        appContent.innerHTML = html;
        return;
    }

    // STANDARD SENTENCE STARTER VIEW
    let html = `
        <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-2xl">${strategy.icon}</span>
                    <h2 class="text-2xl md:text-3xl font-bold text-slate-800">${strategy.title}</h2>
                </div>
                <p class="text-sm text-slate-600 bg-amber-50 border border-amber-200 p-3 rounded-2xl max-w-2xl font-medium">
                    💡 <strong>Teacher Tip:</strong> ${strategy.explanation}
                </p>
            </div>
            <button onclick="navigateTo('tool')" class="self-start md:self-auto bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-2xl text-sm transition">
                ← Back to Tool
            </button>
        </div>
    `;

    if (strategy.paragraphStarter) {
        html += `
            <div class="mb-6 bg-gradient-to-r from-teal-500 to-pypBlue text-white p-5 md:p-6 rounded-3xl shadow-md flex items-start gap-4 border-2 border-teal-600">
                <span class="text-3xl md:text-4xl bg-white/20 p-2 rounded-2xl">📌</span>
                <div>
                    <span class="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full mb-1 inline-block">Paragraph Opener</span>
                    <h3 class="text-lg md:text-xl font-bold leading-tight">Start your ${strategy.title.split(' ')[0]} paragraph with:</h3>
                    <p class="text-xl md:text-2xl font-extrabold text-amber-200 mt-1 font-heading underline decoration-wavy decoration-amber-300">
                        "${strategy.paragraphStarter}"
                    </p>
                </div>
            </div>
        `;
    }

    html += `
        <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span>💬</span> ${strategy.starters.length} ${strategy.title.split(' ')[0]} Sentence Starters & Examples
        </h3>

        <div class="space-y-6">
    `;

    strategy.starters.forEach((item, index) => {
        const key = `${currentState.strategyId}_${index}`;
        if (exampleIndexes[key] === undefined) {
            exampleIndexes[key] = 0;
        }

        const currentExampleIdx = exampleIndexes[key];
        const currentExampleText = item.examples[currentExampleIdx];
        const totalExamples = item.examples.length;

        html += `
            <div class="bg-white border-2 border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm hover:border-pypBlue transition">
                <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex items-center gap-3">
                        <span class="bg-pypPurple text-white font-bold w-8 h-8 rounded-xl flex items-center justify-center text-sm shadow-sm">
                            ${index + 1}
                        </span>
                        <h4 class="text-lg md:text-xl font-bold text-slate-800 font-heading">
                            "${item.starter}"
                        </h4>
                    </div>
                </div>

                <div class="mt-4 bg-purple-50/60 border border-purple-100 rounded-2xl p-4 md:p-5 relative">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                            <span>🌟</span> Sample Full Sentence Example
                        </span>
                        <span class="text-xs font-bold text-purple-600 bg-purple-100 px-2.5 py-0.5 rounded-full">
                            Example ${currentExampleIdx + 1} of ${totalExamples}
                        </span>
                    </div>

                    <p class="text-base md:text-lg text-slate-800 font-semibold leading-relaxed my-2">
                        "${highlightStarter(currentExampleText, item.starter)}"
                    </p>

                    <div class="mt-4 flex justify-end">
                        <button onclick="cycleExample('${key}', ${totalExamples})" 
                                class="bg-pypPurple hover:bg-purple-800 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs md:text-sm shadow transition flex items-center gap-2">
                            <span>Change Example 🎲</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    appContent.innerHTML = html;
}

// Generate Catchy Titles Logic
// Generate Catchy Titles Logic (Shuffled Selection)
function generateTitles() {
    const input = document.getElementById('product-input').value.trim();
    if (!input) return;

    const raw = input.toUpperCase();
    
    // Singularize plural inputs for natural phrasing
    let singular = raw;
    if (raw.endsWith('IES')) {
        singular = raw.slice(0, -3) + 'Y';
    } else if (raw.endsWith('S') && !raw.endsWith('SS')) {
        singular = raw.slice(0, -1);
    }

    // Expanded Title Templates Pool (25 templates)
    const titleTemplates = [
        `HOMEMADE ${raw} THAT WILL CHANGE YOUR LIFE!`,
        `TOO COOL NOT TO BUY: ${raw}!`,
        `WHY YOU ABSOLUTELY NEED A ${singular}!`,
        `HIRE / BUY A ${singular} TODAY!`,
        `THE ULTIMATE ${raw} YOU'VE BEEN WAITING FOR!`,
        `THE BEST ${raw} IN TOWN!`,
        `SAY HELLO TO YOUR NEW FAVORITE: ${raw}!`,
        `DON'T MISS OUT ON THE COOLEST ${raw}!`,
        `BRIGHTEN YOUR DAY WITH FRESH ${raw}!`,
        `THE NO. 1 REASON YOU NEED ${raw} TODAY!`,
        `UPGRADE YOUR DAY WITH OUR AMAZING ${raw}!`,
        `UNSTOPPABLE FUN: GET YOUR ${singular} NOW!`,
        `THE SECRET TO BETTER CLASS DAYS? ${raw}!`,
        `PREMIUM HANDMADE ${raw} MADE JUST FOR YOU!`,
        `MEET THE ${singular} EVERYONE IS TALKING ABOUT!`,
        `BE THE ENVY OF CLASS WITH ${raw}!`,
        `TREAT YOURSELF TO THE BEST ${singular} AT THE FAIR!`,
        `READY FOR REAL EXCITEMENT? TRY OUR ${raw}!`,
        `YOUR DESK ISN'T COMPLETE WITHOUT A ${singular}!`,
        `EXPERIENCE THE MAGIC OF ${raw}!`,
        `SAY GOODBYE TO BORING DAYS WITH ${raw}!`,
        `THE MOST DELICIOUS & FUN ${raw} EVER MADE!`,
        `GRAB YOUR ${singular} BEFORE THEY'RE ALL GONE!`,
        `HANDCRAFTED PERFECTION: ${raw}!`,
        `THE MUST-HAVE ${singular} OF THE SCHOOL YEAR!`
    ];

    // Fisher-Yates Shuffle Algorithm to randomize templates
    const shuffled = [...titleTemplates];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Take the first 6 random items from the shuffled list
    const selectedTitles = shuffled.slice(0, 6);

    const listElem = document.getElementById('titles-list');
    const outputElem = document.getElementById('titles-output');

    listElem.innerHTML = selectedTitles.map(t => `
        <div class="bg-amber-50 border-2 border-amber-200 text-slate-800 font-extrabold text-base md:text-lg p-4 rounded-2xl font-heading shadow-sm flex items-center justify-between gap-3">
            <span>${t}</span>
            <button onclick="copyTitle('${t.replace(/'/g, "\\'")}', this)" class="bg-pypOrange hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition flex-shrink-0">
                📋 Copy
            </button>
        </div>
    `).join('');

    outputElem.classList.remove('hidden');
}

function copyTitle(text, btn) {
    navigator.clipboard.writeText(text);
    btn.textContent = '✅ Copied!';
    setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
}

function cycleExample(key, maxCount) {
    exampleIndexes[key] = (exampleIndexes[key] + 1) % maxCount;
    renderStrategyView();
}

function highlightStarter(fullSentence, starter) {
    const cleanStarter = starter.replace(/\.\.\.\.\.\./g, '').trim();
    if (fullSentence.toLowerCase().startsWith(cleanStarter.toLowerCase())) {
        const starterPart = fullSentence.substring(0, cleanStarter.length);
        const restPart = fullSentence.substring(cleanStarter.length);
        return `<span class="text-pypPurple font-extrabold underline decoration-wavy decoration-purple-300">${starterPart}</span>${restPart}`;
    }
    return fullSentence;
}

function toggleTeacherModal() {
    const modal = document.getElementById('teacher-modal');
    modal.classList.toggle('hidden');
}

function copyJSON() {
    const textToCopy = JSON.stringify(pypData, null, 2);
    
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        const btn = document.getElementById('copy-btn');
        btn.textContent = '✅ Copied!';
        btn.classList.replace('bg-pypBlue', 'bg-emerald-600');
        setTimeout(() => {
            btn.textContent = '📋 Copy JSON';
            btn.classList.replace('bg-emerald-600', 'bg-pypBlue');
        }, 2000);
    } catch (err) {
        console.error('Copy failed', err);
    }
    document.body.removeChild(textarea);
}