// Константы для целей КБЖУ
const GOALS = {
    PROTEIN: 145,
    FAT: 65,
    CARBS: 408,
    CALORIES: 2799
};

// Класс для управления данными
class NutritionTracker {
    constructor() {
        this.mealNotes = this.loadFromStorage();
        this.init();
    }

    // Инициализация приложения
    init() {
        this.bindEvents();
        this.renderMealNotes();
        this.updateDailyTotals();
    }

    // Привязка событий
    bindEvents() {
        // Кнопка добавления записи
        document.getElementById('newNoteButton').addEventListener('click', () => {
            this.openDrawer();
        });

        // Кнопка добавления записи в модальном окне
        document.getElementById('addNoteButton').addEventListener('click', () => {
            this.addMealNote();
        });

        // Закрытие модального окна при клике вне его
        document.getElementById('newNoteDrawer').addEventListener('click', (e) => {
            if (e.target.id === 'newNoteDrawer') {
                this.closeDrawer();
            }
        });

        // Обработка ввода в полях КБЖУ
        const inputs = ['proteinInput', 'fatInput', 'carbInput'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateCaloriesCalculation();
                this.updateLeftValues();
            });
        });

        // Обработка ввода описания
        document.getElementById('descriptionInput').addEventListener('input', () => {
            this.updateLeftValues();
        });

        // Контекстное меню
        this.setupContextMenu();
        
        // Свайп для удаления на мобильных устройствах
        this.setupSwipeToDelete();
        
        // Закрытие контекстного меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu') && !e.target.closest('.meal_note')) {
                this.hideContextMenu();
            }
        });
    }

    // Открытие модального окна
    openDrawer() {
        document.getElementById('newNoteDrawer').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Сброс значений
        this.resetForm();
        this.updateLeftValues();
        this.updateButtonText();
    }

    // Закрытие модального окна
    closeDrawer() {
        document.getElementById('newNoteDrawer').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // Сброс формы
    resetForm() {
        document.getElementById('proteinInput').value = 0;
        document.getElementById('fatInput').value = 0;
        document.getElementById('carbInput').value = 0;
        document.getElementById('descriptionInput').value = '';
        document.getElementById('calInputDisplay').textContent = '0';
        this.currentEditId = null;
    }

    // Расчет калорий
    calculateCalories(protein, fat, carbs) {
        return (protein * 4) + (fat * 9) + (carbs * 4);
    }

    // Обновление расчета калорий в модальном окне
    updateCaloriesCalculation() {
        const protein = parseFloat(document.getElementById('proteinInput').value) || 0;
        const fat = parseFloat(document.getElementById('fatInput').value) || 0;
        const carbs = parseFloat(document.getElementById('carbInput').value) || 0;
        
        const calories = this.calculateCalories(protein, fat, carbs);
        document.getElementById('calInputDisplay').textContent = calories.toLocaleString();
    }

    // Обновление значений "осталось"
    updateLeftValues() {
        const protein = parseFloat(document.getElementById('proteinInput').value) || 0;
        const fat = parseFloat(document.getElementById('fatInput').value) || 0;
        const carbs = parseFloat(document.getElementById('carbInput').value) || 0;
        const calories = this.calculateCalories(protein, fat, carbs);

        // Получаем текущие дневные значения
        const dailyTotals = this.getDailyTotals();

        // Рассчитываем остаток
        const proteinLeft = GOALS.PROTEIN - dailyTotals.protein - protein;
        const fatLeft = GOALS.FAT - dailyTotals.fat - fat;
        const carbsLeft = GOALS.CARBS - dailyTotals.carbs - carbs;
        const caloriesLeft = GOALS.CALORIES - dailyTotals.calories - calories;

        // Обновляем отображение
        document.getElementById('proteinLeft').textContent = `${proteinLeft > 0 ? '+' : ''}${proteinLeft} г`;
        document.getElementById('fatLeft').textContent = `${fatLeft > 0 ? '+' : ''}${fatLeft} г`;
        document.getElementById('carbLeft').textContent = `${carbsLeft > 0 ? '+' : ''}${carbsLeft} г`;
        document.getElementById('calLeft').textContent = `${caloriesLeft > 0 ? '+' : ''}${caloriesLeft.toLocaleString()}`;
    }

    // Добавление новой записи
    addMealNote() {
        const protein = parseFloat(document.getElementById('proteinInput').value) || 0;
        const fat = parseFloat(document.getElementById('fatInput').value) || 0;
        const carbs = parseFloat(document.getElementById('carbInput').value) || 0;
        const description = document.getElementById('descriptionInput').value.trim();

        if (protein === 0 && fat === 0 && carbs === 0) {
            alert('Пожалуйста, введите хотя бы одно значение КБЖУ');
            return;
        }

        if (this.currentEditId) {
            // Редактирование существующей записи
            const noteIndex = this.mealNotes.findIndex(note => note.id === this.currentEditId);
            if (noteIndex !== -1) {
                this.mealNotes[noteIndex] = {
                    ...this.mealNotes[noteIndex],
                    nutri_values: { protein, fat, carbs },
                    cals_line: this.calculateCalories(protein, fat, carbs),
                    description: description || ''
                };
            }
            this.currentEditId = null;
        } else {
            // Добавление новой записи
            const mealNote = {
                id: Date.now(),
                nutri_values: { protein, fat, carbs },
                cals_line: this.calculateCalories(protein, fat, carbs),
                description: description || '',
                settime: this.getCurrentTime()
            };
            this.mealNotes.push(mealNote);
        }

        this.saveToStorage();
        this.renderMealNotes();
        this.updateDailyTotals();
        this.closeDrawer();
    }

    // Удаление записи
    deleteMealNote(id) {
        this.mealNotes = this.mealNotes.filter(note => note.id !== id);
        this.saveToStorage();
        this.renderMealNotes();
        this.updateDailyTotals();
    }

    // Настройка контекстного меню
    setupContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        const editMenuItem = document.getElementById('editMenuItem');
        const deleteMenuItem = document.getElementById('deleteMenuItem');

        // Обработка правого клика на записях
        document.addEventListener('contextmenu', (e) => {
            const mealNote = e.target.closest('.meal_note');
            if (mealNote) {
                e.preventDefault();
                const noteId = parseInt(mealNote.dataset.noteId);
                this.showContextMenu(e.clientX, e.clientY, noteId);
            }
        });

        // Обработка клика по пунктам меню
        editMenuItem.addEventListener('click', () => {
            this.editMealNote(this.currentContextNoteId);
            this.hideContextMenu();
        });

        deleteMenuItem.addEventListener('click', () => {
            if (confirm('Удалить эту запись?')) {
                this.deleteMealNote(this.currentContextNoteId);
            }
            this.hideContextMenu();
        });
    }

    // Показать контекстное меню
    showContextMenu(x, y, noteId) {
        const contextMenu = document.getElementById('contextMenu');
        this.currentContextNoteId = noteId;
        
        // Позиционирование меню
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.classList.add('show');
    }

    // Скрыть контекстное меню
    hideContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.classList.remove('show');
        this.currentContextNoteId = null;
    }

    // Настройка свайпа для удаления
    setupSwipeToDelete() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let currentElement = null;

        // Обработка касаний
        document.addEventListener('touchstart', (e) => {
            const mealNote = e.target.closest('.meal_note');
            if (mealNote) {
                startX = e.touches[0].clientX;
                currentX = startX;
                isDragging = true;
                currentElement = mealNote;
                mealNote.style.transition = 'none';
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging && currentElement) {
                currentX = e.touches[0].clientX;
                const deltaX = currentX - startX;
                
                if (deltaX < 0) { // Только свайп влево
                    const translateX = Math.max(deltaX, -100);
                    currentElement.style.transform = `translateX(${translateX}px)`;
                }
            }
        });

        document.addEventListener('touchend', (e) => {
            if (isDragging && currentElement) {
                const deltaX = currentX - startX;
                
                if (deltaX < -50) { // Свайп больше 50px влево
                    currentElement.classList.add('swipe-delete');
                    const noteId = parseInt(currentElement.dataset.noteId);
                    
                    // Удаление через 1 секунду
                    setTimeout(() => {
                        this.deleteMealNote(noteId);
                    }, 1000);
                } else {
                    // Возврат в исходное положение
                    currentElement.style.transform = 'translateX(0)';
                }
                
                currentElement.style.transition = 'transform 0.3s ease';
                isDragging = false;
                currentElement = null;
            }
        });
    }

    // Редактирование записи
    editMealNote(id) {
        const note = this.mealNotes.find(n => n.id === id);
        if (note) {
            this.currentEditId = id;
            this.openDrawer();
            this.fillFormWithNote(note);
        }
    }

    // Заполнение формы данными записи
    fillFormWithNote(note) {
        document.getElementById('proteinInput').value = note.nutri_values.protein;
        document.getElementById('fatInput').value = note.nutri_values.fat;
        document.getElementById('carbInput').value = note.nutri_values.carbs;
        document.getElementById('descriptionInput').value = note.description;
        this.updateCaloriesCalculation();
        this.updateLeftValues();
        this.updateButtonText();
    }

    // Обновление текста кнопки
    updateButtonText() {
        const button = document.getElementById('addNoteButton');
        if (this.currentEditId) {
            button.textContent = 'Сохранить изменения';
        } else {
            button.textContent = 'Добавить запись';
        }
    }

    // Получение текущего времени
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Получение дневных итогов
    getDailyTotals() {
        return this.mealNotes.reduce((totals, note) => {
            totals.protein += note.nutri_values.protein;
            totals.fat += note.nutri_values.fat;
            totals.carbs += note.nutri_values.carbs;
            totals.calories += note.cals_line;
            return totals;
        }, { protein: 0, fat: 0, carbs: 0, calories: 0 });
    }

    // Обновление отображения дневных итогов
    updateDailyTotals() {
        const totals = this.getDailyTotals();
        
        document.getElementById('proteinAmount').textContent = Math.round(totals.protein);
        document.getElementById('fatAmount').textContent = Math.round(totals.fat);
        document.getElementById('carbAmount').textContent = Math.round(totals.carbs);
        document.getElementById('calAmount').textContent = totals.calories.toLocaleString();
    }

    // Рендеринг списка записей
    renderMealNotes() {
        const container = document.getElementById('mealNotesList');
        container.innerHTML = '';

        if (this.mealNotes.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: rgba(26, 26, 26, 0.6); padding: 20px;">Нет записей</div>';
            return;
        }

        this.mealNotes.forEach(note => {
            const noteElement = this.createMealNoteElement(note);
            container.appendChild(noteElement);
        });
    }

    // Создание элемента записи
    createMealNoteElement(note) {
        const div = document.createElement('div');
        div.className = 'meal_note';
        div.dataset.noteId = note.id;
        
        // Формируем HTML с условным отображением описания
        let html = `
            <div class="nutri_values_settime">
                <div class="nutri_values">
                    <div class="nutri_tag proteins">
                        <div class="tag_icon proteins">Б</div>
                        ${Math.round(note.nutri_values.protein)}г
                    </div>
                    <div class="nutri_tag fats">
                        <div class="tag_icon fats">Ж</div>
                        ${Math.round(note.nutri_values.fat)}г
                    </div>
                    <div class="nutri_tag carbs">
                        <div class="tag_icon carbs">У</div>
                        ${Math.round(note.nutri_values.carbs)}г
                    </div>
                </div>
                <div class="settime">${note.settime}</div>
            </div>
            <div class="cals_line">
                <div class="kcals_value">${note.cals_line.toLocaleString()} ккал</div>
            </div>
        `;
        
        // Добавляем описание только если оно задано и не равно "Без описания"
        if (note.description && note.description.trim() !== '' && note.description !== 'Без описания') {
            html += `
                <div class="description">
                    <div class="desc_text">${note.description}</div>
                </div>
            `;
        }
        
        div.innerHTML = html;
        
        // Добавляем обработчик клика для редактирования
        div.addEventListener('click', () => {
            this.editMealNote(note.id);
        });
        
        return div;
    }

    // Сохранение в LocalStorage
    saveToStorage() {
        localStorage.setItem('nutritionTrackerData', JSON.stringify(this.mealNotes));
    }

    // Загрузка из LocalStorage
    loadFromStorage() {
        const data = localStorage.getItem('nutritionTrackerData');
        return data ? JSON.parse(data) : [];
    }
}

// Инициализация приложения
let tracker;

document.addEventListener('DOMContentLoaded', () => {
    tracker = new NutritionTracker();
});

// Глобальные функции для доступа из HTML
window.tracker = tracker;
