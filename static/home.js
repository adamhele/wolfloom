const engines = {
    google: { url: 'https://www.google.com/search?q=', icon: 'search' },
	ecosia: { url: 'https://www.ecosia.org/search?q=', icon: 'leaf' },
	bing: { url: 'https://www.bing.com/search?q=', icon: 'search' },
	duckduckgo: { url: 'https://duckduckgo.com/?q=', icon: 'search' },
	yahoo: { url: 'https://search.yahoo.com/search?p=', icon: 'search' },
    youtube: { url: 'https://www.youtube.com/results?search_query=', icon: 'youtube' },
    spotify: { url: 'https://open.spotify.com/search/', icon: 'music' },
    amazon: { url: 'https://www.amazon.com/s?k=', icon: 'shopping-cart' },
    chatgpt: { url: 'https://chat.openai.com/?q=', icon: 'cpu' },
    copilot: { url: 'https://www.bing.com/search?mturn=1&q=', icon: 'cpu' },
    claude: { url: 'https://claude.ai/new?q=', icon: 'cpu' },
    perplexity: { url: 'https://www.perplexity.ai/search?q=', icon: 'cpu' },
    gemini: { url: 'https://www.google.com/search?udm=50&source=searchlabs&q=', icon: 'cpu' }
};

const aiEngines = ['chatgpt','copilot','claude','perplexity', 'gemini'];
const searchEngines = ['google','ecosia','bing','duckduckgo', 'yahoo'];
const engineDropdown = document.getElementById('engineDropdown');

function renderEngineDropdown(){
    if(!engineDropdown) return;
    engineDropdown.innerHTML = '';
    
    const selectedSearch = localStorage.getItem('selectedSearch') || 'google';
    if(searchEngines.includes(selectedSearch)){
        const div = document.createElement('div');
        div.classList.add('engine-option');
        div.innerHTML = `<i data-lucide="${engines[selectedSearch].icon}"></i> ${selectedSearch.charAt(0).toUpperCase() + selectedSearch.slice(1)}`;
        div.addEventListener('click',()=>setEngine(selectedSearch));
        engineDropdown.appendChild(div);
    }

    ['youtube','spotify','amazon'].forEach(key => {
        const div = document.createElement('div');
        div.classList.add('engine-option');
        div.innerHTML = `<i data-lucide="${engines[key].icon}"></i> ${key.charAt(0).toUpperCase() + key.slice(1)}`;
        div.addEventListener('click',()=>setEngine(key));
        engineDropdown.appendChild(div);
    });

    const selectedAI = localStorage.getItem('selectedAI') || 'chatgpt';
    if(aiEngines.includes(selectedAI)){
        const div = document.createElement('div');
        div.classList.add('engine-option');
        div.innerHTML = `<i data-lucide="${engines[selectedAI].icon}"></i> ${selectedAI.charAt(0).toUpperCase() + selectedAI.slice(1)}`;
        div.addEventListener('click',()=>setEngine(selectedAI));
        engineDropdown.appendChild(div);
    }

    if(window.lucide) lucide.createIcons();
}

const aiSelect = document.getElementById('aiSelect');

let currentAI = localStorage.getItem('selectedAI') || 'chatgpt';
if(aiSelect) aiSelect.value = currentAI;

if(aiSelect){
    aiSelect.addEventListener('change', () => {
        currentAI = aiSelect.value;
        localStorage.setItem('selectedAI', currentAI);
        console.log("Selected AI:", currentAI);

        renderEngineDropdown();

        setEngine(currentAI);
    });
}

const searchSelect = document.getElementById('searchSelect');

let currentSearch = localStorage.getItem('selectedSearch') || 'google';
if(searchSelect) searchSelect.value = currentSearch;

if(searchSelect){
    searchSelect.addEventListener('change', () => {
        currentSearch = searchSelect.value;
        localStorage.setItem('selectedSearch', currentSearch);
        console.log("Selected search:", currentSearch);

        renderEngineDropdown();

        setEngine(currentSearch);
    });
}

let currentEngine = localStorage.getItem('lastEngine');
if (!engines[currentEngine]) currentEngine = 'google';

if(aiSelect) aiSelect.value = currentAI;

if(aiSelect){
    aiSelect.addEventListener('change', () => {
        currentAI = aiSelect.value;
        localStorage.setItem('selectedAI', currentAI);
        console.log("Selected AI:", currentAI);
    });
}

if(searchSelect) searchSelect.value = currentSearch;

if(searchSelect){
    searchSelect.addEventListener('change', () => {
        currentSearch = searchSelect.value;
        localStorage.setItem('selectedSearch', currentSearch);
        console.log("Selected search:", currentSearch);
    });
}


(function forceCaret() {
    const searchBox = document.getElementById("mainSearch");
    if (searchBox) {
        [50, 100, 200].forEach(ms => setTimeout(() => {
            searchBox.focus();
            searchBox.select();
        }, ms));
    }
})();
function setEngine(choice) {
    if (!engines[choice]) return;
    currentEngine = choice;
    localStorage.setItem('lastEngine', choice);
    const icon = document.getElementById('activeEngineIcon');
    if (icon) {
        icon.setAttribute('data-lucide', engines[choice].icon);
        lucide.createIcons();
    }
    if (engineDropdown) engineDropdown.style.display = 'none';
}


(function() {
    const container=document.getElementById('shortcutContainer');
    if(!container) return;

    let shortcuts=JSON.parse(localStorage.getItem('shortcuts'))||[
        {name:'Google', url:'https://www.google.com', icon:'https://www.google.com/s2/favicons?domain=google.com&sz=256'},
        {name:'YouTube', url:'https://www.youtube.com', icon:'https://www.google.com/s2/favicons?domain=youtube.com&sz=256'}
    ];

    function renderShortcuts(){
        container.innerHTML='';
        shortcuts.forEach((sc,idx)=>{
            const div=document.createElement('div');
            div.classList.add('shortcut');
            div.dataset.idx=idx;
            div.dataset.url=sc.url;
            div.dataset.name=sc.name;
            div.innerHTML=`<img class="shortcut-icon" src="${sc.icon}" alt="${sc.name}"><span>${sc.name}</span>`;
            div.addEventListener('click',()=>window.open(sc.url,'_blank'));
            div.addEventListener('contextmenu',e=>{
                e.preventDefault();
                if(confirm(`Delete shortcut "${sc.name}"?`)){
                    shortcuts.splice(idx,1);
                    localStorage.setItem('shortcuts',JSON.stringify(shortcuts));
                    renderShortcuts();
                }
            });
            container.appendChild(div);
        });

        const addBtn=document.createElement('div');
        addBtn.classList.add('shortcut','shortcut-add');
        addBtn.innerHTML=`<i data-lucide="plus"></i><span>Add</span>`;
        addBtn.addEventListener('click',()=>{
            const name=prompt('Shortcut name:');
            const url=prompt('Shortcut URL (https://...)');
            if(name && url){
                const icon=`https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=256`;
                shortcuts.push({name,url,icon});
                localStorage.setItem('shortcuts',JSON.stringify(shortcuts));
                renderShortcuts();
                if(window.lucide) lucide.createIcons();
            }
        });
        container.appendChild(addBtn);
        if(window.lucide) lucide.createIcons();
    }

    renderShortcuts();
})();

document.addEventListener('DOMContentLoaded', () => {
    if(aiSelect) aiSelect.value = currentAI;
    if(aiSelect){
        aiSelect.addEventListener('change', () => {
            currentAI = aiSelect.value;
            localStorage.setItem('selectedAI', currentAI);
            renderEngineDropdown();
            setEngine(currentAI);
        });
    }

    renderEngineDropdown();
});