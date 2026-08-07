// ==========================================================================
//   1. LOCAL STORAGE FUNCTIONS (SAVE & LOAD)
// ==========================================================================

function saveData() {
    const appState = {
        priorities: [],
        reminders: [],
        categories: []
    };

    // 2. Read all Reminders
    const reminderTasks = document.querySelectorAll('.reminder-container .task-item');
    for (let i = 0; i < reminderTasks.length; i++) {
        const task = reminderTasks[i];
        appState.reminders.push({
            text: task.querySelector('.task-input').value,
            completed: task.querySelector('.task-item-completed').checked,
            date: task.querySelector('.task-date').value
        });
    }

    // 3. Read all Priorities
    const priorityTasks = document.querySelectorAll('.priorities-container .task-item');
    for (let i = 0; i < priorityTasks.length; i++) {
        const task = priorityTasks[i];
        appState.priorities.push({
            text: task.querySelector('.task-input').value,
            completed: task.querySelector('.task-item-completed').checked,
            date: task.querySelector('.task-date').value
        });
    }

    // 4. Read all Categories and their internal tasks
    const categories = document.querySelectorAll('.category-tasks');
    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const catTitle = category.querySelector('.category-title').value;
        const tasksList = [];

        const categoryTasks = category.querySelectorAll('.tasks-container .task-item');
        for (let j = 0; j < categoryTasks.length; j++) {
            const task = categoryTasks[j];
            tasksList.push({
                text: task.querySelector('.task-input').value,
                completed: task.querySelector('.task-item-completed').checked,
                date: task.querySelector('.task-date').value
            });
        }

        appState.categories.push({ title: catTitle, tasks: tasksList });
    }

    // 5. Convert the object to a string and save it to the browser!
    localStorage.setItem('myLifeTasksData', JSON.stringify(appState));
}

function loadData() {
    const savedString = localStorage.getItem('myLifeTasksData');
    
    // If there is no saved data (first time user), just stop and do nothing.
    if (!savedString) return;

    // Convert the string back into our JavaScript object
    const appState = JSON.parse(savedString);

    const prioritiesContainer = document.querySelector('.priorities-container');
    const reminderContainer = document.querySelector('.reminder-container');
    const addCategoryButton = document.querySelector('.add-category');

    // Grab the add reminder button so we know where to place loaded tasks
    const addReminderBtn = document.querySelector('.add-reminder');

    // Restore Reminders
    for (let i = 0; i < appState.reminders.length; i++) {
        const rem = appState.reminders[i];
        const html = `
        <div class="task-item">
            <div class="task-item-content">
                <label class="custom-checkbox">
                    <input onclick="markFinished(event); saveData()" type="checkbox" class="task-item-completed" ${rem.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <textarea oninput="saveData()" class="task-input" rows="1">${rem.text}</textarea>
            </div>
            <div class="task-item-metadata">
                <input onchange="sortTaskOnDateChange(event); saveData()" type="date" class="task-date" value="${rem.date || ''}">
                <input onclick="setPriority(event); saveData()" type="button" class="priority-button" value="🔥">
                <input onclick="deleteTaskItem(event); saveData()" type="button" class="delete-task-button" value="✖️">
            </div>
        </div>`;
        
        // Insert saved reminders ABOVE the add reminder button
        addReminderBtn.insertAdjacentHTML('beforebegin', html);
    }

    // Restore Priorities
    for (let i = 0; i < appState.priorities.length; i++) {
        const pri = appState.priorities[i];
        const html = `
        <div class="task-item">
            <div class="task-item-content">
                <label class="custom-checkbox">
                    <input onclick="markFinished(event); saveData()" type="checkbox" class="task-item-completed" ${pri.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <textarea oninput="saveData()" class="task-input" rows="1">${pri.text}</textarea>
            </div>
            <div class="task-item-metadata">
                <input onchange="sortTaskOnDateChange(event); saveData()" type="date" class="task-date" value="${pri.date || ''}">
                <input onclick="setPriority(event); saveData()" type="button" class="priority-button" value="🔥">
                <input onclick="deleteTaskItem(event); saveData()" type="button" class="delete-task-button" value="✖️">
            </div>
        </div>`;
        prioritiesContainer.insertAdjacentHTML('beforeend', html);
    }

    // Restore Categories
    for (let i = 0; i < appState.categories.length; i++) {
        const cat = appState.categories[i];
        let tasksHtml = '';
        for (let j = 0; j < cat.tasks.length; j++) {
            const task = cat.tasks[j];
            tasksHtml += `
            <div class="task-item">
                <div class="task-item-content">
                    <label class="custom-checkbox">
                        <input onclick="markFinished(event); saveData()" type="checkbox" class="task-item-completed" ${task.completed ? 'checked' : ''}>
                        <span class="checkmark"></span>
                    </label>
                    <textarea oninput="saveData()" class="task-input" rows="1">${task.text}</textarea>
                </div>
                <div class="task-item-metadata">
                    <input onchange="sortTaskOnDateChange(event); saveData()" type="date" class="task-date" value="${task.date || ''}">
                    <input onclick="setPriority(event); saveData()" type="button" class="priority-button" value="🔥">
                    <input onclick="deleteTaskItem(event); saveData()" type="button" class="delete-task-button" value="✖️">
                </div>
            </div>`;
        }

        const categoryHtml = `
        <div class="category-tasks">
            <div class="category-header">
                <textarea oninput="saveData()" class="category-title" rows="1">${cat.title}</textarea>
                <input onclick="deleteCategory(event); saveData()" type="button" class="delete-category-button" value="✖️">
            </div>
            <hr>
            <div class="tasks-container">
                ${tasksHtml}
                <div onclick="addTask(event); saveData()" class="add-task">
                    <input type="button" value="Add Task">
                </div>
            </div>
        </div>`;
        addCategoryButton.insertAdjacentHTML('beforebegin', categoryHtml);
    }
}

// Automatically load data when the page opens
window.addEventListener('DOMContentLoaded', loadData);

// ==========================================================================
//   2. CORE APP FUNCTIONS (Modified to auto-save)
// ==========================================================================

function addCategory(event) {
    const addCategoryButton = document.querySelector('.add-category');
    const newCategory = `
    <div class="category-tasks">
        <div class="category-header">
            <textarea oninput="saveData()" class="category-title" rows="1"></textarea>
            <input onclick="deleteCategory(event)" type="button" class="delete-category-button" value="✖️">
        </div>
        <hr>
        <div class="tasks-container">
            <div class="task-item">
                <div class="task-item-content">
                    <label class="custom-checkbox">
                        <input onclick="markFinished(event); saveData()" type="checkbox" class="task-item-completed">
                        <span class="checkmark"></span>
                    </label>
                    <textarea oninput="saveData()" class="task-input" rows="1"></textarea>
                </div>
                <div class="task-item-metadata">
                    <input onchange="sortTaskOnDateChange(event); saveData()" type="date" class="task-date">
                    <input onclick="setPriority(event); saveData()" type="button" class="priority-button" value="🔥">
                    <input onclick="deleteTaskItem(event); saveData()" type="button" class="delete-task-button" value="✖️">
                </div>
            </div>
            <div onclick="addTask(event); saveData()" class="add-task">
                <input type="button" value="Add Task">
            </div>
        </div>
    </div>
    `;
    addCategoryButton.insertAdjacentHTML('beforebegin', newCategory);
    saveData(); // Save the new setup immediately
}

function deleteCategory(event) {
    const deleteCategoryButton = event.target.closest('.delete-category-button');
    if (deleteCategoryButton) {
        const categoryToDelete = deleteCategoryButton.closest('.category-tasks');
        categoryToDelete.remove();
        saveData();
    }
}

function addTask(event) {
    const addTaskButton = event.target.closest('.add-task');
    const newTaskItem = 
    `<div class="task-item">
        <div class="task-item-content">
            <label class="custom-checkbox">
                <input onclick="markFinished(event); saveData()" type="checkbox" class="task-item-completed">
                <span class="checkmark"></span>
            </label>
            <textarea oninput="saveData()" class="task-input" rows="1"></textarea>
        </div>
        <div class="task-item-metadata">
            <input onchange="sortTaskOnDateChange(event); saveData()" type="date" class="task-date">
            <input onclick="setPriority(event); saveData()" type="button" class="priority-button" value="🔥">
            <input onclick="deleteTaskItem(event); saveData()" type="button" class="delete-task-button" value="✖️">
        </div>
    </div>`;
    addTaskButton.insertAdjacentHTML('beforebegin', newTaskItem);
    saveData(); 
}

function deleteTaskItem(event) {
    const deleteTaskButton = event.target.closest('.delete-task-button');
    if (deleteTaskButton) {
        const taskItemToDelete = deleteTaskButton.closest('.task-item');
        taskItemToDelete.remove();   
        saveData(); // Save after deletion
    }
}

function setPriority(event) {
    const priorityButton = event.target.closest('.priority-button');
    const prioritiesContainer = document.querySelector('.priorities-container');

    if (priorityButton && prioritiesContainer.children.length < 3) {
        const taskItem = priorityButton.closest('.task-item');
        prioritiesContainer.appendChild(taskItem);
        saveData(); // Save after moving to priorities
    }
    else {
        alert("You can only have a maximum of 3 priority tasks.");
    }
}

function addReminder(event) {
    const addReminderButton = event.target.closest('.add-reminder');
    
    const newReminderItem = 
    `<div class="task-item">
        <div class="task-item-content">
            <label class="custom-checkbox">
                <input onclick="markFinished(event); saveData()" type="checkbox" class="task-item-completed">
                <span class="checkmark"></span>
            </label>
            <textarea oninput="saveData()" class="task-input" rows="1"></textarea>
        </div>
        <div class="task-item-metadata">
            <input onchange="sortTaskOnDateChange(event); saveData()" type="date" class="task-date">
            <input onclick="setPriority(event); saveData()" type="button" class="priority-button" value="🔥">
            <input onclick="deleteTaskItem(event); saveData()" type="button" class="delete-task-button" value="✖️">
        </div>
    </div>`;

    addReminderButton.insertAdjacentHTML('beforebegin', newReminderItem);
    
    saveData();
}