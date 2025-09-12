// Unified script for index.html + add.html
// Preserves original data structure and features from your original script.js

const STORAGE_KEY = 'nutritionTrackerData';
const EDIT_KEY = 'edit_note_id';

const GOALS = {
    PROTEIN: 145,
    FAT: 65,
    CARBS: 408,
    CALORIES: 2799
};

document.addEventListener('DOMContentLoaded', () => {
    // detect which page we are on
    if (document.getElementById('addNoteButton')) {
        setupAddPage();
    } else {
        setupMainPage();
    }
});

/* ---------------- shared helpers ---------------- */
function loadNotes() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
}

function saveNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function calculateCalories(protein, fat, carbs) {
    return (protein * 4) + (fat * 9) + (carbs * 4);
}

function getCurrentTime() {
    return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function getDailyTotalsExcluding(editId = null) {
    const notes = loadNotes();
    const totals = { protein: 0, fat: 0, carbs: 0, calories: 0 };
    notes.forEach(n => {
        totals.protein += (n.nutri_values && n.nutri_values.protein) ? n.nutri_values.protein : 0;
        totals.fat += (n.nutri_values && n.nutri_values.fat) ? n.nutri_values.fat : 0;
        totals.carbs += (n.nutri_values && n.nutri_values.carbs) ? n.nutri_values.carbs : 0;
        totals.calories += n.cals_line || 0;
    });

    if (editId != null) {
        const editing = notes.find(n => String(n.id) === String(editId));
        if (editing) {
            totals.protein -= editing.nutri_values.protein || 0;
            totals.fat -= editing.nutri_values.fat || 0;
            totals.carbs -= editing.nutri_values.carbs || 0;
            totals.calories -= editing.cals_line || 0;
        }
    }

    return totals;
}

function getDailyTotals() {
    return getDailyTotalsExcluding(null);
}

/* ---------------- add.html ---------------- */
function setupAddPage() {
    const proteinInput = document.getElementById('proteinInput');
    const fatInput = document.getElementById('fatInput');
    const carbInput = document.getElementById('carbInput');
    const descriptionInput = document.getElementById('descriptionInput');
    const calDisplay = document.getElementById('calInputDisplay');
    const addNoteButton = document.getElementById('addNoteButton');

    let editId = localStorage.getItem(EDIT_KEY);

    // If we came here to edit — preload
    if (editId) {
        const notes = loadNotes();
        const note = notes.find(n => String(n.id) === String(editId));
        if (note) {
            proteinInput.value = note.nutri_values.protein || 0;
            fatInput.value = note.nutri_values.fat || 0;
            carbInput.value = note.nutri_values.carbs || 0;
            descriptionInput.value = note.description || '';
            calDisplay.textContent = (note.cals_line || 0).toLocaleString();
        }
    } else {
        // defaults
        calDisplay.textContent = '0';
    }

    function updateButtonText() {
        addNoteButton.textContent = editId ? 'Сохранить запись' : 'Добавить запись';
    }

    function updateLeftValues() {
        const protein = parseFloat(proteinInput.value) || 0;
        const fat = parseFloat(fatInput.value) || 0;
        const carbs = parseFloat(carbInput.value) || 0;
        const calories = calculateCalories(protein, fat, carbs);

        const adjusted = getDailyTotalsExcluding(editId);

        const proteinLeft = GOALS.PROTEIN - adjusted.protein - protein;
        const fatLeft = GOALS.FAT - adjusted.fat - fat;
        const carbsLeft = GOALS.CARBS - adjusted.carbs - carbs;
        const caloriesLeft = GOALS.CALORIES - adjusted.calories - calories;

        const proteinLeftEl = document.getElementById('proteinLeft');
        const fatLeftEl = document.getElementById('fatLeft');
        const carbLeftEl = document.getElementById('carbLeft');
        const calLeftEl = document.getElementById('calLeft');

        if (proteinLeftEl) proteinLeftEl.textContent = `${proteinLeft > 0 ? '+' : ''}${proteinLeft} г`;
        if (fatLeftEl) fatLeftEl.textContent = `${fatLeft > 0 ? '+' : ''}${fatLeft} г`;
        if (carbLeftEl) carbLeftEl.textContent = `${carbsLeft > 0 ? '+' : ''}${carbsLeft} г`;
        if (calLeftEl) calLeftEl.textContent = `${caloriesLeft > 0 ? '+' : ''}${caloriesLeft.toLocaleString()}`;
    }

    function recalcCalories() {
        const protein = parseFloat(proteinInput.value) || 0;
        const fat = parseFloat(fatInput.value) || 0;
        const carbs = parseFloat(carbInput.value) || 0;
        const calories = calculateCalories(protein, fat, carbs);
        calDisplay.textContent = calories.toLocaleString();
        updateLeftValues();
    }

    [proteinInput, fatInput, carbInput].forEach((el, idx) => {
        if (!el) return;
        el.addEventListener('input', () => {
            recalcCalories();
            // автопереход вправо (если надо) — поведение оставлено из оригинала
            if ((el.id === 'proteinInput' || el.id === 'fatInput') && el.value.length >= 2) {
                const inputs = ['proteinInput','fatInput','carbInput'];
                const next = document.getElementById(inputs[idx + 1]);
                if (next) next.focus();
            }
        });

        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const inputs = ['proteinInput','fatInput','carbInput'];
                if (idx < inputs.length - 1) {
                    const next = document.getElementById(inputs[idx + 1]);
                    if (next) next.focus();
                } else {
                    addNoteButton.click();
                }
            }
        });
    });

    descriptionInput && descriptionInput.addEventListener('input', updateLeftValues);

    updateButtonText();
    updateLeftValues();

    addNoteButton.addEventListener('click', () => {
        const protein = parseFloat(proteinInput.value) || 0;
        const fat = parseFloat(fatInput.value) || 0;
        const carbs = parseFloat(carbInput.value) || 0;
        const description = (descriptionInput.value || '').trim();
        const cals = calculateCalories(protein, fat, carbs);

        let notes = loadNotes();

        if (editId) {
            notes = notes.map(n => {
                if (String(n.id) === String(editId)) {
                    return {
                        ...n,
                        nutri_values: { protein, fat, carbs },
                        cals_line: cals,
                        description: description || '',
                        settime: getCurrentTime()
                    };
                }
                return n;
            });
            localStorage.removeItem(EDIT_KEY);
        } else {
            const note = {
                id: Date.now(),
                nutri_values: { protein, fat, carbs },
                cals_line: cals,
                description: description || '',
                settime: getCurrentTime()
            };
            notes.push(note);
        }

        saveNotes(notes);
        // после сохранения возвращаемся на главную
        window.location.href = 'index.html';
    });

    // фокус на первое поле
    if (proteinInput) proteinInput.focus();
}

/* ---------------- index.html (главная) ---------------- */
function setupMainPage() {
    const mealNotesList = document.getElementById('mealNotesList');
    const proteinAmount = document.getElementById('proteinAmount');
    const fatAmount = document.getElementById('fatAmount');
    const carbAmount = document.getElementById('carbAmount');
    const calAmount = document.getElementById('calAmount');

    const contextMenu = document.getElementById('contextMenu');
    const editMenuItem = document.getElementById('editMenuItem');
    const deleteMenuItem = document.getElementById('deleteMenuItem');
    const newNoteButton = document.getElementById('newNoteButton');

    let currentContextNoteId = null;

    function renderMealNotes() {
        const notes = loadNotes();
        mealNotesList && (mealNotesList.innerHTML = '');

        if (!mealNotesList) return;

        if (notes.length === 0) {
            mealNotesList.innerHTML = '<div style="text-align: center; color: rgba(26, 26, 26, 0.6); padding: 20px;">Нет записей</div>';
            updateDailyTotals();
            return;
        }

        notes.forEach(note => {
            const el = createMealNoteElement(note);

            // клик по карточке — переход в режим редактирования на отдельной странице
            el.addEventListener('click', () => {
                localStorage.setItem(EDIT_KEY, note.id);
                window.location.href = 'add.html';
            });

            // правый клик — контекстное меню
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e.clientX, e.clientY, note.id);
            });

            mealNotesList.appendChild(el);
        });

        updateDailyTotals();
    }

    function createMealNoteElement(note) {
        const div = document.createElement('div');
        div.className = 'meal_note';
        div.dataset.noteId = note.id;

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
                <div class="kcals_value">${(note.cals_line || 0).toLocaleString()} ккал</div>
            </div>
        `;

        if (note.description && note.description.trim() !== '' && note.description !== 'Без описания') {
            html += `
                <div class="description">
                    <div class="desc_text">${note.description}</div>
                </div>
            `;
        }

        div.innerHTML = html;
        return div;
    }

    function showContextMenu(x, y, noteId) {
        if (!contextMenu) return;
        currentContextNoteId = noteId;
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.classList.add('show');
    }

    function hideContextMenu() {
        if (!contextMenu) return;
        contextMenu.classList.remove('show');
        currentContextNoteId = null;
    }

    function deleteMealNote(id) {
        let notes = loadNotes();
        notes = notes.filter(n => String(n.id) !== String(id));
        saveNotes(notes);
        renderMealNotes();
    }

    // контекстное меню — действия
    if (editMenuItem) {
        editMenuItem.addEventListener('click', () => {
            if (!currentContextNoteId) return;
            localStorage.setItem(EDIT_KEY, currentContextNoteId);
            hideContextMenu();
            window.location.href = 'add.html';
        });
    }

    if (deleteMenuItem) {
        deleteMenuItem.addEventListener('click', () => {
            if (!currentContextNoteId) return;
            if (confirm('Удалить эту запись?')) {
                deleteMealNote(currentContextNoteId);
            }
            hideContextMenu();
        });
    }

    // закрывать меню при клике вне
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu')) {
            hideContextMenu();
        }
    });

    // свайп для удаления (на мобилке)
    function setupSwipeToDelete() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let currentElement = null;

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
                if (deltaX < 0) {
                    const translateX = Math.max(deltaX, -100);
                    currentElement.style.transform = `translateX(${translateX}px)`;
                }
            }
        });

        document.addEventListener('touchend', (e) => {
            if (isDragging && currentElement) {
                const deltaX = currentX - startX;
                if (deltaX < -50) {
                    currentElement.classList.add('swipe-delete');
                    const noteId = currentElement.dataset.noteId;
                    setTimeout(() => {
                        deleteMealNote(noteId);
                    }, 800);
                } else {
                    currentElement.style.transform = 'translateX(0)';
                }

                currentElement.style.transition = 'transform 0.3s ease';
                isDragging = false;
                currentElement = null;
            }
        });
    }

    function updateDailyTotals() {
        const totals = getDailyTotals();
        if (proteinAmount) proteinAmount.textContent = Math.round(totals.protein);
        if (fatAmount) fatAmount.textContent = Math.round(totals.fat);
        if (carbAmount) carbAmount.textContent = Math.round(totals.carbs);
        if (calAmount) calAmount.textContent = (totals.calories || 0).toLocaleString();
    }

    // кнопка создания новой записи — теперь переходим на add.html
    if (newNoteButton) {
        newNoteButton.addEventListener('click', () => {
            // очистим возможный флаг редактирования
            localStorage.removeItem(EDIT_KEY);
            window.location.href = 'add.html';
        });
    }

    // инициализация
    renderMealNotes();
    setupSwipeToDelete();
}

// end of script



// // Класс для управления данными
// class NutritionTracker {
//     constructor() {
//         this.mealNotes = this.loadFromStorage();
//         this.init();
//     }

//     // Инициализация приложения
//     init() {
//         this.bindEvents();
//         this.renderMealNotes();
//         this.updateDailyTotals();
//     }

//         // Привязка событий
//     bindEvents() {
//         // Кнопка открытия drawer
//         document.getElementById('newNoteButton').addEventListener('click', () => {
//             this.openDrawer();
//         });

//         // Кнопка добавления/сохранения записи
//         document.getElementById('addNoteButton').addEventListener('click', () => {
//             if (this.currentEditId) {
//                 this.saveEditedNote();
//             } else {
//                 this.addMealNote();
//             }
//         });

//         // Закрытие drawer при клике вне содержимого
//         document.getElementById('newNoteDrawer').addEventListener('click', (e) => {
//             if (e.target.id === 'newNoteDrawer') {
//                 this.closeDrawer();
//             }
//         });

//         // Поля для ввода БЖУ
//         const inputs = ['proteinInput', 'fatInput', 'carbInput'];
//         inputs.forEach((id, index) => {
//             const inputEl = document.getElementById(id);

//             // Ввод и автопереход
//             inputEl.addEventListener('input', () => {
//                 this.updateCaloriesCalculation();
//                 this.updateLeftValues();

//                 // Автопереход вправо (для белков и жиров)
//                 if ((id === 'proteinInput' || id === 'fatInput') && inputEl.value.length >= 2) {
//                     const nextInput = document.getElementById(inputs[index + 1]);
//                     if (nextInput) nextInput.focus();
//                 }
//             });

//             // Навигация по стрелкам и Enter
//             inputEl.addEventListener('keydown', (e) => {
//                 if (e.key === 'Enter') {
//                     e.preventDefault(); // чтобы не срабатывал submit на мобилке
//                     if (index < inputs.length - 1) {
//                         // Enter → следующее поле
//                         document.getElementById(inputs[index + 1]).focus();
//                     } else {
//                         // Enter на углеводах → сохранить
//                         document.getElementById('addNoteButton').click();
//                     }
//                 }
//             });
//         });

//         // Поле описания
//         document.getElementById('descriptionInput').addEventListener('input', () => {
//             this.updateLeftValues();
//         });

//         // Контекстное меню
//         this.setupContextMenu();

//         // Свайп для удаления на мобилке
//         this.setupSwipeToDelete();

//         // Закрытие контекстного меню при клике вне его
//         document.addEventListener('click', (e) => {
//             if (!e.target.closest('.context-menu') && !e.target.closest('.meal_note')) {
//                 this.hideContextMenu();
//             }
//         });
//     }

//     saveEditedNote() {
//         if (!this.currentEditId) return;
    
//         const protein = parseInt(document.getElementById('proteinInput').value) || 0;
//         const fat = parseInt(document.getElementById('fatInput').value) || 0;
//         const carbs = parseInt(document.getElementById('carbInput').value) || 0;
//         const description = document.getElementById('descriptionInput').value || '';
    
//         const cals_line = this.calculateCalories(protein, fat, carbs);
    
//         // обновляем нужную запись
//         this.mealNotes = this.mealNotes.map(note => {
//             if (note.id === this.currentEditId) {
//                 return {
//                     ...note,
//                     nutri_values: { protein, fat, carbs },
//                     cals_line,
//                     description,
//                     settime: new Date().toLocaleTimeString([], { 
//                         hour: '2-digit', 
//                         minute: '2-digit' 
//                     })
//                 };
//             }
//             return note;
//         });
    
//         this.saveToStorage();
//         this.renderMealNotes();
//         this.updateDailyTotals();
//         this.closeDrawer();
    
//         this.currentEditId = null; // сброс контекста
//     }
    
    

//     // Открытие модального окна
//     openDrawer(isEdit = false) {
//         const drawer = document.getElementById('newNoteDrawer');
//         drawer.classList.add('active');
//         document.body.style.overflow = 'hidden';
    
//         if (!isEdit) {
//             // Новый контекст → очистка формы и сброс id
//             this.resetForm();
//             this.currentEditId = null;
//         }
    
//         this.updateLeftValues();
//         this.updateButtonText();
    
//         // Автофокус на белки
//         const proteinInput = document.getElementById('proteinInput');
//         if (proteinInput) proteinInput.focus();
//     }

//     // Закрытие модального окна
//     closeDrawer() {
//         const drawer = document.getElementById('newNoteDrawer');
//         drawer.classList.remove('active');
//         document.body.style.overflow = '';
    
//         // Если мы закрыли drawer в режиме "новой записи" — очистим форму
//         if (!this.currentEditId) {
//             this.resetForm();
//         }
//     }

//     // Сброс формы
//     resetForm() {
//         document.getElementById('proteinInput').value = '';
//         document.getElementById('fatInput').value = '';
//         document.getElementById('carbInput').value = '';
//         document.getElementById('descriptionInput').value = '';
//         document.getElementById('calInputDisplay').textContent = '0';
//         this.currentEditId = null;
//     }

//     // Расчет калорий
//     calculateCalories(protein, fat, carbs) {
//         return (protein * 4) + (fat * 9) + (carbs * 4);
//     }

//     // Обновление расчета калорий в модальном окне
//     updateCaloriesCalculation() {
//         const protein = parseFloat(document.getElementById('proteinInput').value) || 0;
//         const fat = parseFloat(document.getElementById('fatInput').value) || 0;
//         const carbs = parseFloat(document.getElementById('carbInput').value) || 0;
        
//         const calories = this.calculateCalories(protein, fat, carbs);
//         document.getElementById('calInputDisplay').textContent = calories.toLocaleString();
//     }

//     // Обновление значений "осталось"
//     updateLeftValues() {
//         const protein = parseFloat(document.getElementById('proteinInput').value) || 0;
//         const fat = parseFloat(document.getElementById('fatInput').value) || 0;
//         const carbs = parseFloat(document.getElementById('carbInput').value) || 0;
//         const calories = this.calculateCalories(protein, fat, carbs);

//         // Получаем текущие дневные значения
//         const dailyTotals = this.getDailyTotals();

//         // При редактировании нужно исключить значения редактируемой записи из дневных итогов
//         let adjustedTotals = { ...dailyTotals };
//         if (this.currentEditId) {
//             const editingNote = this.mealNotes.find(note => note.id === this.currentEditId);
//             if (editingNote) {
//                 adjustedTotals.protein -= editingNote.nutri_values.protein;
//                 adjustedTotals.fat -= editingNote.nutri_values.fat;
//                 adjustedTotals.carbs -= editingNote.nutri_values.carbs;
//                 adjustedTotals.calories -= editingNote.cals_line;
//             }
//         }

//         // Рассчитываем остаток
//         const proteinLeft = GOALS.PROTEIN - adjustedTotals.protein - protein;
//         const fatLeft = GOALS.FAT - adjustedTotals.fat - fat;
//         const carbsLeft = GOALS.CARBS - adjustedTotals.carbs - carbs;
//         const caloriesLeft = GOALS.CALORIES - adjustedTotals.calories - calories;

//         // Обновляем отображение
//         document.getElementById('proteinLeft').textContent = `${proteinLeft > 0 ? '+' : ''}${proteinLeft} г`;
//         document.getElementById('fatLeft').textContent = `${fatLeft > 0 ? '+' : ''}${fatLeft} г`;
//         document.getElementById('carbLeft').textContent = `${carbsLeft > 0 ? '+' : ''}${carbsLeft} г`;
//         document.getElementById('calLeft').textContent = `${caloriesLeft > 0 ? '+' : ''}${caloriesLeft.toLocaleString()}`;
//     }

//     // Добавление новой записи
//     addMealNote() {
//         const protein = parseFloat(document.getElementById('proteinInput').value) || 0;
//         const fat = parseFloat(document.getElementById('fatInput').value) || 0;
//         const carbs = parseFloat(document.getElementById('carbInput').value) || 0;
//         const description = document.getElementById('descriptionInput').value.trim();

//         if (protein === 0 && fat === 0 && carbs === 0) {
//             alert('Пожалуйста, введите хотя бы одно значение КБЖУ');
//             return;
//         }

//         const mealNote = {
//             id: Date.now(),
//             nutri_values: { protein, fat, carbs },
//             cals_line: this.calculateCalories(protein, fat, carbs),
//             description: description || '',
//             settime: this.getCurrentTime()
//         };
        
//         this.mealNotes.push(mealNote);
        

//         this.saveToStorage();
//         this.renderMealNotes();
//         this.updateDailyTotals();
//         this.closeDrawer();
//     }

//     // Удаление записи
//     deleteMealNote(id) {
//         this.mealNotes = this.mealNotes.filter(note => note.id !== id);
//         this.saveToStorage();
//         this.renderMealNotes();
//         this.updateDailyTotals();
//     }

//     // Настройка контекстного меню
//     setupContextMenu() {
//         const contextMenu = document.getElementById('contextMenu');
//         const editMenuItem = document.getElementById('editMenuItem');
//         const deleteMenuItem = document.getElementById('deleteMenuItem');

//         // Обработка правого клика на записях
//         document.addEventListener('contextmenu', (e) => {
//             const mealNote = e.target.closest('.meal_note');
//             if (mealNote) {
//                 e.preventDefault();
//                 const noteId = parseInt(mealNote.dataset.noteId);
//                 this.showContextMenu(e.clientX, e.clientY, noteId);
//             }
//         });

//         // Обработка клика по пунктам меню
//         editMenuItem.addEventListener('click', () => {
//             this.editMealNote(this.currentContextNoteId);
//             this.hideContextMenu();
//         });

//         deleteMenuItem.addEventListener('click', () => {
//             if (confirm('Удалить эту запись?')) {
//                 this.deleteMealNote(this.currentContextNoteId);
//             }
//             this.hideContextMenu();
//         });
//     }

//     // Показать контекстное меню
//     showContextMenu(x, y, noteId) {
//         const contextMenu = document.getElementById('contextMenu');
//         this.currentContextNoteId = noteId;
        
//         // Позиционирование меню
//         contextMenu.style.left = x + 'px';
//         contextMenu.style.top = y + 'px';
//         contextMenu.classList.add('show');
//     }

//     // Скрыть контекстное меню
//     hideContextMenu() {
//         const contextMenu = document.getElementById('contextMenu');
//         contextMenu.classList.remove('show');
//         this.currentContextNoteId = null;
//     }

//     // Настройка свайпа для удаления
//     setupSwipeToDelete() {
//         let startX = 0;
//         let currentX = 0;
//         let isDragging = false;
//         let currentElement = null;

//         // Обработка касаний
//         document.addEventListener('touchstart', (e) => {
//             const mealNote = e.target.closest('.meal_note');
//             if (mealNote) {
//                 startX = e.touches[0].clientX;
//                 currentX = startX;
//                 isDragging = true;
//                 currentElement = mealNote;
//                 mealNote.style.transition = 'none';
//             }
//         });

//         document.addEventListener('touchmove', (e) => {
//             if (isDragging && currentElement) {
//                 currentX = e.touches[0].clientX;
//                 const deltaX = currentX - startX;
                
//                 if (deltaX < 0) { // Только свайп влево
//                     const translateX = Math.max(deltaX, -100);
//                     currentElement.style.transform = `translateX(${translateX}px)`;
//                 }
//             }
//         });

//         document.addEventListener('touchend', (e) => {
//             if (isDragging && currentElement) {
//                 const deltaX = currentX - startX;
                
//                 if (deltaX < -50) { // Свайп больше 50px влево
//                     currentElement.classList.add('swipe-delete');
//                     const noteId = parseInt(currentElement.dataset.noteId);
                    
//                     // Удаление через 1 секунду
//                     setTimeout(() => {
//                         this.deleteMealNote(noteId);
//                     }, 1000);
//                 } else {
//                     // Возврат в исходное положение
//                     currentElement.style.transform = 'translateX(0)';
//                 }
                
//                 currentElement.style.transition = 'transform 0.3s ease';
//                 isDragging = false;
//                 currentElement = null;
//             }
//         });
//     }

//     // Редактирование записи
//     editMealNote(id) {
//         const note = this.mealNotes.find(n => n.id === id);
//         if (note) {
//             this.currentEditId = id;
//             this.openDrawer();
//             this.fillFormWithNote(note);
//         }
//     }

//     // Заполнение формы данными записи
//     fillFormWithNote(note) {
//         document.getElementById('proteinInput').value = note.nutri_values.protein;
//         document.getElementById('fatInput').value = note.nutri_values.fat;
//         document.getElementById('carbInput').value = note.nutri_values.carbs;
//         document.getElementById('descriptionInput').value = note.description || '';
//         this.updateCaloriesCalculation();
//         this.updateLeftValues();
//         this.updateButtonText();
//     }
    

//     // Обновление текста кнопки
//     updateButtonText() {
//         const btn = document.getElementById('addNoteButton');
//         if (this.currentEditId) {
//             btn.textContent = 'Сохранить запись';
//         } else {
//             btn.textContent = 'Добавить запись';
//         }
//     }

//     // Получение текущего времени
//     getCurrentTime() {
//         const now = new Date();
//         return now.toLocaleTimeString('ru-RU', { 
//             hour: '2-digit', 
//             minute: '2-digit' 
//         });
//     }

//     // Получение дневных итогов
//     getDailyTotals() {
//         return this.mealNotes.reduce((totals, note) => {
//             totals.protein += note.nutri_values.protein;
//             totals.fat += note.nutri_values.fat;
//             totals.carbs += note.nutri_values.carbs;
//             totals.calories += note.cals_line;
//             return totals;
//         }, { protein: 0, fat: 0, carbs: 0, calories: 0 });
//     }

//     // Обновление отображения дневных итогов
//     updateDailyTotals() {
//         const totals = this.getDailyTotals();
        
//         document.getElementById('proteinAmount').textContent = Math.round(totals.protein);
//         document.getElementById('fatAmount').textContent = Math.round(totals.fat);
//         document.getElementById('carbAmount').textContent = Math.round(totals.carbs);
//         document.getElementById('calAmount').textContent = totals.calories.toLocaleString();
//     }

//     // Рендеринг списка записей
//     renderMealNotes() {
//         const container = document.getElementById('mealNotesList');
//         container.innerHTML = '';
    
//         if (this.mealNotes.length === 0) {
//             container.innerHTML = '<div style="text-align: center; color: rgba(26, 26, 26, 0.6); padding: 20px;">Нет записей</div>';
//             return;
//         }
    
//         this.mealNotes.forEach(note => {
//             const noteElement = this.createMealNoteElement(note);
        
//             // Клик по карточке → редактирование
//             noteElement.addEventListener('click', () => {
//                 this.currentEditId = note.id;     // сохраняем id
//                 this.fillFormWithNote(note);      // правильная функция
//                 this.openDrawer(true);            // редактирование
//             });
        
//             container.appendChild(noteElement);
//         });
//     }

//     // Создание элемента записи
//     createMealNoteElement(note) {
//         const div = document.createElement('div');
//         div.className = 'meal_note';
//         div.dataset.noteId = note.id;
        
//         // Формируем HTML с условным отображением описания
//         let html = `
//             <div class="nutri_values_settime">
//                 <div class="nutri_values">
//                     <div class="nutri_tag proteins">
//                         <div class="tag_icon proteins">Б</div>
//                         ${Math.round(note.nutri_values.protein)}г
//                     </div>
//                     <div class="nutri_tag fats">
//                         <div class="tag_icon fats">Ж</div>
//                         ${Math.round(note.nutri_values.fat)}г
//                     </div>
//                     <div class="nutri_tag carbs">
//                         <div class="tag_icon carbs">У</div>
//                         ${Math.round(note.nutri_values.carbs)}г
//                     </div>
//                 </div>
//                 <div class="settime">${note.settime}</div>
//             </div>
//             <div class="cals_line">
//                 <div class="kcals_value">${note.cals_line.toLocaleString()} ккал</div>
//             </div>
//         `;
        
//         // Добавляем описание только если оно задано и не равно "Без описания"
//         if (note.description && note.description.trim() !== '' && note.description !== 'Без описания') {
//             html += `
//                 <div class="description">
//                     <div class="desc_text">${note.description}</div>
//                 </div>
//             `;
//         }
        
//         div.innerHTML = html;
        
//         // Добавляем обработчик клика для редактирования
//         div.addEventListener('click', () => {
//             this.editMealNote(note.id);
//         });
        
//         return div;
//     }

//     // Сохранение в LocalStorage
//     saveToStorage() {
//         localStorage.setItem('nutritionTrackerData', JSON.stringify(this.mealNotes));
//     }

//     // Загрузка из LocalStorage
//     loadFromStorage() {
//         const data = localStorage.getItem('nutritionTrackerData');
//         return data ? JSON.parse(data) : [];
//     }
// }

// // Инициализация приложения
// let tracker;

// document.addEventListener('DOMContentLoaded', () => {
//     tracker = new NutritionTracker();
// });

// // Глобальные функции для доступа из HTML
// window.tracker = tracker;
