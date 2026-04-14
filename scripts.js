import jsonData from './items.json' with { type: 'json' };
    // The data you provided
    const items = jsonData
    
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
        const statusFilt = document.getElementById('statusFilter').value;
        const grid = document.getElementById('itemGrid');
        
        grid.innerHTML = '';
        renderStats();

        const filtered = items.filter(i => {
            const name = i["Item Name"];
            const isCollected = collectedItems.includes(name);
            const matchesSearch = name.toLowerCase().includes(search);
            const matchesType = typeFilt === 'all' || i["Item Type"] === typeFilt;
            const matchesStatus = statusFilt === 'all' || 
                                 (statusFilt === 'acquired' && isCollected) || 
                                 (statusFilt === 'missing' && !isCollected);
            
            return matchesSearch && matchesType && matchesStatus;
        });

        filtered.forEach(item => {
            const isChecked = collectedItems.includes(item["Item Name"]);
            const card = document.createElement('div');
            card.className = `item-card ${item["Item Rarity"]} ${isChecked ? 'acquired' : ''}`;
            card.innerHTML = `
                <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleItem('${item["Item Name"].replace(/'/g, "\\'")}')">
                <div class="item-info">
                    <h3>${item["Item Name"]}</h3>
                    <div class="meta">${item["Item Type"]} • Lvl ${item["Item Level Requirement"]}</div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    document.getElementById('searchInput').addEventListener('input', render);
    document.getElementById('typeFilter').addEventListener('change', render);
    document.getElementById('statusFilter').addEventListener('change', render);

    init();