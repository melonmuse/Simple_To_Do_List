function addCategory() {
    const html = `
    <div class="category-tasks">
        <input type="text" class="category-title">
        <hr>
        <div class="tasks-container">
            <div class="task-item">
                <div class="task-item-content">
                    <label class="custom-checkbox">
                        <input onclick="markFinished(event)" type="checkbox" class="task-item-completed">
                        <span class="checkmark"></span>
                    </label>
                    <input type="text" class="task-input">
                </div>
                <div class="task-item-metadata">
                    <input type="date" class="task-date">
                    <input onclick="setPriority(event)" type="button" class="priority-button" value="🔥">
                </div>
            </div>
            <div onclick="addTask(event)" class="add-task">
                <input type="button" value="Add Task">
            </div>
        </div>
    </div>
    `;
    document.querySelector('.add-category').insertAdjacentHTML('beforebegin', html);
}

function addTask(event) {
    const addTaskBtn = event.target.closest('.add-task');
    const html = `
    <div class="task-item">
        <div class="task-item-content">
            <label class="custom-checkbox">
                <input onclick="markFinished(event)" type="checkbox" class="task-item-completed">
                <span class="checkmark"></span>
            </label>
            <input type="text" class="task-input">
        </div>
        <div class="task-item-metadata">
            <input type="date" class="task-date">
            <input onclick="setPriority(event)" type="button" class="priority-button" value="🔥">
        </div>
    </div>
    `;
    addTaskBtn.insertAdjacentHTML('beforebegin', html);
}

function addReminder(event) {
    const addReminderBtn = event.target.closest('.add-reminder');
    const html = `
    <div class="task-item">
        <div class="task-item-content">
            <label class="custom-checkbox">
                <input onclick="markFinished(event)" type="checkbox" class="task-item-completed">
                <span class="checkmark"></span>
            </label>
            <input type="text" class="task-input">
        </div>
    </div>
    `;
    addReminderBtn.insertAdjacentHTML('beforebegin', html);
}

function setPriority(event) {
    const taskItem = event.target.closest('.task-item');
    const prioritiesContainer = document.querySelector('.priorities-container');
    const priorityItems = prioritiesContainer.querySelectorAll('.task-item');

    if (priorityItems.length < 3) {
        prioritiesContainer.insertAdjacentElement('beforeend', taskItem);
    } else {
        alert('Maximum number of priorities reached!');
    }
}

function markFinished(event) {
    const taskItem = event.target.closest('.task-item');
    const finishedContainer = document.querySelector('.finished-container');
    finishedContainer.insertAdjacentElement('beforeend', taskItem);
}

document.addEventListener('change', function(event) {
    if (event.target.classList.contains('task-date')) {
        sortItems(event.target.closest('.tasks-container'));
    }
});

function sortItems(container) {
    const addTaskBtn = container.querySelector('.add-task');
    const items = Array.from(container.querySelectorAll('.task-item'));

    items.sort(function(taskA, taskB) {
        const dateA = taskA.querySelector('.task-date').value;
        const dateB = taskB.querySelector('.task-date').value;

        if (dateA === '') return 1;
        if (dateB === '') return -1;

        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
    });

    for (let i = 0; i < items.length; i++) {
        container.insertBefore(items[i], addTaskBtn);
    }
}
