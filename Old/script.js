const gridContainer = document.getElementById('grid-container');
const addBox = document.getElementById('add-box');
const topPrioritiesBox = document.getElementById('top-priorities-box');
const remindersBox = document.getElementById('reminders-box');

// Create a new category box when user clicks "Add New Category"
addBox.addEventListener('click', function() {
    let categoryName = prompt("Enter a title for your new category:", "New Category");
    if (!categoryName) return;
    
    const newCategory = document.createElement('div');
    newCategory.innerHTML = `
        <h2>${categoryName}</h2>
        <hr>
        <div class="tasks-container"></div>
        <hr>
        <div class="task-form">
            <input type="button" class="add-task-btn" value="Add Task">
        </div>
    `;
    gridContainer.insertBefore(newCategory, addBox);
});

// Add a task when user clicks "Add Task" button (regular categories)
gridContainer.addEventListener('click', function(event) {
    if (event.target.classList.contains('add-task-btn')) {
        let taskDescription = prompt("Enter your task:");
        if (!taskDescription) return;

        // Find the parent category box and its tasks container
        const categoryBox = event.target.closest('div');
        const tasksContainer = categoryBox.querySelector('.tasks-container');

        if (!tasksContainer) return;

        // Create the task item
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="task-left-group">
                <input type="button" class='completed' value="Done">
                <label>${taskDescription}</label>
            </div>
            <div class="information">
                <input type="date" class="due-date">
                <input type="checkbox" class='priority' title="Add to Top 3 Priorities">
            </div>
        `;

        tasksContainer.appendChild(taskItem);
    }
});

// Add a reminder as a bullet point
gridContainer.addEventListener('click', function(event) {
    if (event.target.classList.contains('add-reminder-btn')) {
        let reminderText = prompt("Enter your reminder:");
        if (!reminderText) return;

        const remindersList = remindersBox.querySelector('.reminders-list');
        
        const reminderItem = document.createElement('li');
        reminderItem.textContent = reminderText;
        remindersList.appendChild(reminderItem);
    }
});

// Handle priority checkbox - add to Top 3 Priorities (max 3)
gridContainer.addEventListener('change', function(event) {
    if (event.target.classList.contains('priority')) {
        const checkbox = event.target;
        const taskItem = checkbox.closest('.task-item');
        const taskLabel = taskItem.querySelector('label').textContent;
        const prioritiesContainer = topPrioritiesBox.querySelector('.tasks-container');
        
        if (checkbox.checked) {
            // Check if we already have 3 priorities
            const currentPriorities = prioritiesContainer.querySelectorAll('.task-item').length;
            
            if (currentPriorities >= 3) {
                alert("You can only have 3 priorities maximum!");
                checkbox.checked = false;
                return;
            }

            // Create a copy of the task for the priorities box (without the Done button)
            const priorityItem = document.createElement('div');
            priorityItem.className = 'task-item priority-item';
            priorityItem.dataset.originalTask = taskLabel;
            priorityItem.innerHTML = `
                <div class="task-left-group">
                    <label>${taskLabel}</label>
                </div>
                <div class="information">
                    <input type="date" class="due-date">
                </div>
            `;

            prioritiesContainer.appendChild(priorityItem);
        } else {
            // Remove from priorities when unchecked
            const prioritiesContainer = topPrioritiesBox.querySelector('.tasks-container');
            const priorityItems = prioritiesContainer.querySelectorAll('.task-item');
            
            priorityItems.forEach(item => {
                if (item.querySelector('label').textContent === taskLabel) {
                    item.remove();
                }
            });
        }
    }
});

// Move task to "Finished Today" when user clicks "Done"
gridContainer.addEventListener('click', function(event) {
    if (event.target.classList.contains('completed')) {
        const taskItem = event.target.closest('.task-item');
        const finishedContainer = document.querySelector('.finished-container');
        
        if (finishedContainer && taskItem) {
            // Uncheck priority if it was checked
            const priorityCheckbox = taskItem.querySelector('.priority');
            if (priorityCheckbox && priorityCheckbox.checked) {
                priorityCheckbox.checked = false;
                priorityCheckbox.dispatchEvent(new Event('change'));
            }

            // Remove the Done button and date/priority info
            taskItem.querySelector('.completed').remove();
            taskItem.querySelector('.information').remove();
            
            // Move task to finished box
            finishedContainer.appendChild(taskItem);
        }
    }
});