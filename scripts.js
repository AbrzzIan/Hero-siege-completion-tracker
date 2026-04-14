import jsonData from './items.json' with { type: 'json' };
    // The data you provided
    const items = jsonData

    const rarityRank = {
    "Angelic": 1,
    "Unholy": 2,
    "Heroic": 3,
    "Satanic Set": 4,
    "Satanic": 5,
    "Runeword": 6
};
    let collectedItems = JSON.parse(localStorage.getItem('myCollectedItems')) || [];

    function init() {
        const types = [...new Set(items.map(i => i["Item Type"]))].sort();
        const typeSelect = document.getElementById('typeFilter');
        types.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t; opt.textContent = t;
            typeSelect.appendChild(opt);
        });
        render();
    }

    function toggleItem(name) {
        if (collectedItems.includes(name)) {
            collectedItems = collectedItems.filter(i => i !== name);
        } else {
            collectedItems.push(name);
        }
        localStorage.setItem('myCollectedItems', JSON.stringify(collectedItems));
        render(); // Full render to update stats and visibility
    }

    function filterByCategory(type) {
        const typeSelect = document.getElementById('typeFilter');
        // If "Total" is clicked, we show "all"
        typeSelect.value = (type === "Total") ? "all" : type;
        render();
    }

    function renderStats() {
        const dashboard = document.getElementById('progressDashboard');
        dashboard.innerHTML = '';
        
        const types = [...new Set(items.map(i => i["Item Type"]))].sort();
        const displayTypes = ["Total", ...types];

        displayTypes.forEach(type => {
            const itemsInCat = type === "Total" ? items : items.filter(i => i["Item Type"] === type);
            const collectedInCat = itemsInCat.filter(i => collectedItems.includes(i["Item Name"]));
            const percent = Math.round((collectedInCat.length / itemsInCat.length) * 100) || 0;
            console.log(collectedInCat.length)
            // Check if this category is the one currently selected to highlight it
            const isSelected = (type === "Total" && typeFilter.value === "all") || (typeFilter.value === type);

            const statCard = document.createElement('div');
            statCard.className = `category-stat ${isSelected ? 'active' : ''}`;
            statCard.style.cursor = 'pointer'; // Make it look clickable
            statCard.onclick = () => filterByCategory(type);
            
            statCard.innerHTML = `
                <span class="name">${type}</span>
                <span class="percent">${percent}%</span>
                <div class="meta">${collectedInCat.length}/${itemsInCat.length}</div>
            `;
            dashboard.appendChild(statCard);
        });
    }
    
    function render() {
        const search = document.getElementById('searchInput').value.toLowerCase();
        const typeFilt = document.getElementById('typeFilter').value;
        const rarityFilt = document.getElementById('rarityFilter').value;
        const statusFilt = document.getElementById('statusFilter').value;
        const grid = document.getElementById('itemGrid');
        
        grid.innerHTML = '';
        renderStats();

        const filtered = items.filter(i => {
            const name = i["Item Name"];
            const isCollected = collectedItems.includes(name);
            const matchesSearch = name.toLowerCase().includes(search);
            const matchesType = typeFilt === 'all' || i["Item Type"] === typeFilt;
            const matchesRarity = rarityFilt === 'all' || i["Item Rarity"] === rarityFilt;
            const matchesStatus = statusFilt === 'all' || 
                                 (statusFilt === 'acquired' && isCollected) || 
                                 (statusFilt === 'missing' && !isCollected);
            
            return matchesSearch && matchesType && matchesRarity && matchesStatus;
        });

        filtered.sort((a, b) => {
        const rankA = rarityRank[a["Item Rarity"]] || 99; // Default 99 for unknown rarities
        const rankB = rarityRank[b["Item Rarity"]] || 99;
        
        if (rankA !== rankB) {
            return rankA - rankB;
        }
        // If rarities are the same, sort alphabetically by name as a backup
        return a["Item Name"].localeCompare(b["Item Name"]);
        });

        filtered.forEach(item => {
            const isChecked = collectedItems.includes(item["Item Name"]);
            const card = document.createElement('div');
            const rawName = item["Item Name"].replace(/&#039;/g, "'").replace(/&amp;/g, "&");
            const wikiName = rawName.replace(/ /g, "_");
            const wikiUrl = `https://herosiege.wiki.gg/wiki/${encodeURIComponent(wikiName)}`;

            card.className = `item-card ${item["Item Rarity"]} ${isChecked ? 'acquired' : ''}`;
            if(item["Item Rarity"].includes("Set")) {card.className = 'item-card Set'};
            if(item["Item Rarity"].includes("Angelic")) {card.className = 'item-card Angelic'};
            if(item["Item Rarity"].includes("Unholy")) {card.className = 'item-card Unholy'};
            if(item["Item Rarity"].includes("Runeword")) {card.className = 'item-card Runeword'};
            
            // 1. Create the checkbox element properly
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isChecked;
            
            // 2. Attach the event listener directly (no quote escaping needed!)
            checkbox.addEventListener('change', () => toggleItem(item["Item Name"]));

            // 3. Create the text content
            const info = document.createElement('div');
            info.className = 'item-info';
            info.innerHTML = `
                <h3>
                    <a href="${wikiUrl}" target="_blank" style="color: inherit; text-decoration: none;">
                    ${rawName}
                    </a>
                </h3>
                <div class="meta">${item["Item Type"]} • Lvl ${item["Item Level Requirement"]}</div>
            `;

            // 4. Put it all together
            card.appendChild(checkbox);
            card.appendChild(info);
            grid.appendChild(card);
        });
    }

    document.getElementById('searchInput').addEventListener('input', render);
    document.getElementById('typeFilter').addEventListener('change', render);
    document.getElementById('statusFilter').addEventListener('change', render);
    document.getElementById('rarityFilter').addEventListener('change', render);

    init();