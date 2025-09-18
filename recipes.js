/* ---------------- recipes.html ---------------- */
function setupRecipesPage() {
    const tabBtns = document.querySelectorAll('.tab_btn');
    const tabContents = {
      dishes: document.getElementById('tabDishes'),
      ingredients: document.getElementById('tabIngredients')
    };

    function renderSavedIngredients() {
        const container = document.getElementById('tabIngredients');
        container.innerHTML = ''; // очистка

        const raw = localStorage.getItem('SAVED_INGREDIENTS');
        const list = raw ? JSON.parse(raw) : [];

        if (list.length === 0) {
            container.innerHTML = '<div class="empty_placeholder">Тут пока пусто</div>';
            return;
        }

        list.forEach(ing => {
            const div = document.createElement('div');
            div.className = 'ingredient_saved_item';
            div.innerHTML = `
            <strong>${ing.name}</strong>
            ${ing.desc ? `<div>${ing.desc}</div>` : ''}
            <div>Б:${ing.protein} Ж:${ing.fat} У:${ing.carbs} Кал:${ing.calories}</div>
            `;
            container.appendChild(div);
        });
    }
  
    if (!tabBtns.length) return; // не на той странице
  
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // убрать active со всех кнопок
        tabBtns.forEach(b => b.classList.remove('active'));
        // скрыть весь контент
        Object.values(tabContents).forEach(c => c.classList.add('hidden'));
  
        // активируем выбранный таб
        btn.classList.add('active');
        tabContents[btn.dataset.tab].classList.remove('hidden');
      });
    });

    document.addEventListener('DOMContentLoaded', () => {
        setupRecipesPage();
        renderSavedIngredients();
      });
  }
  