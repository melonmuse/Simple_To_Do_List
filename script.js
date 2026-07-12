// ============================================================================
// HOW SAVING WORKS (read this first!)
//
// Normally, anything you type on a web page disappears the moment you close
// or reload it, because the page starts fresh from index.html every time.
//
// To fix that, we use something called "localStorage". It's a small storage
// box built into every browser. Each website gets its own box, and whatever
// you put in it stays there even after you close the tab or restart your
// computer.
//
// localStorage can only store TEXT (strings), but our to-do list is made of
// objects and arrays (categories, tasks, checkboxes, dates...). So we:
//   1. Turn our data into a text format called JSON using JSON.stringify()
//   2. Save that text into localStorage
//   3. When the page loads again, read the text back out
//   4. Turn it back into real data using JSON.parse()
//   5. Rebuild the page's HTML from that data
//
// That's the whole trick. Everything below is just building the to-do list
// HTML, and calling "saveState()" every time something changes, and calling
// "loadState()" once when the page first opens.
// ============================================================================

// The "key" (name/label) we use to find our data inside localStorage.
// localStorage is like a dictionary: you save things under a name, and
// look them up later using that same name.
const STORAGE_KEY = 'todoListState';


// ============================================================================
// BUILDING HTML FOR TASKS AND CATEGORIES
// ============================================================================

// Makes text safe to place inside an HTML attribute (like value="...").
// Without this, if someone typed a task like: Say "hi" & bye
// the quote marks would break the HTML we generate. This swaps the risky
// characters for their safe HTML equivalents.
function escapeForHTML(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/'/g, '&#39;');
}

// Builds the HTML for one task row (the checkbox + text box, and optionally
// a date box + priority button).
//
// task                  - an object like { text, completed, date } or null
//                          for a brand new, empty task.
// showDateAndPriority   - true for normal tasks in a category, false for
//                          reminders (which are just text + a checkbox).
// canBeMarkedFinished   - true if clicking the checkbox should move this
//                          task to the "Finished Today" list. Reminders
//                          should NOT move, so this is false for them.
function buildTaskItemHTML(task, showDateAndPriority, canBeMarkedFinished) {
    if (!task) {
        task = {};
    }

    // Fill in defaults for anything missing, so a brand-new task is blank.
    const taskText = task.text || '';
    const isCompleted = task.completed || false;
    const taskDate = task.date || '';

    // Only add the "move to Finished" click behavior if this task is allowed
    // to move (see canBeMarkedFinished above).
    let checkboxClickAttribute = '';
    if (canBeMarkedFinished) {
        checkboxClickAttribute = ' onclick="markFinished(event)"';
    }

    // If this task was already checked off before, keep it checked.
    let checkedAttribute = '';
    if (isCompleted) {
        checkedAttribute = ' checked';
    }

    // The date field + priority ("fire") button only show up on real tasks,
    // not on reminders.
    let metadataHTML = '';
    if (showDateAndPriority) {
        metadataHTML =
            '<div class="task-item-metadata">' +
            '<input type="date" class="task-date" value="' + escapeForHTML(taskDate) + '">' +
            '<input onclick="setPriority(event)" type="button" class="priority-button" value="🔥">' +
            '</div>';
    }

    return (
        '<div class="task-item">' +
            '<div class="task-item-content">' +
                '<label class="custom-checkbox">' +
                    '<input' + checkboxClickAttribute + ' type="checkbox" class="task-item-completed"' + checkedAttribute + '>' +
                    '<span class="checkmark"></span>' +
                '</label>' +
                '<input type="text" class="task-input" value="' + escapeForHTML(taskText) + '">' +
            '</div>' +
            metadataHTML +
        '</div>'
    );
}

// Builds the HTML for a whole category box (title + list of tasks).
// "category" is an object like { title: "Groceries", tasks: [...] },
// or null when creating a brand-new, empty category.
function buildCategoryHTML(category) {
    if (!category) {
        category = {};
    }

    const categoryTitle = category.title || '';
    let tasks = category.tasks;

    // A brand-new category should start with one empty task row.
    if (!tasks || tasks.length === 0) {
        tasks = [null];
    }

    let tasksHTML = '';
    tasks.forEach(function(task) {
        tasksHTML += buildTaskItemHTML(task, true, true);
    });

    return (
        '<div class="category-tasks">' +
            '<input type="text" class="category-title" value="' + escapeForHTML(categoryTitle) + '">' +
            '<hr>' +
            '<div class="tasks-container">' +
                tasksHTML +
                '<div onclick="addTask(event)" class="add-task">' +
                    '<input type="button" value="Add Task">' +
                '</div>' +
            '</div>' +
        '</div>'
    );
}


// ============================================================================
// USER ACTIONS (these run when you click things on the page)
// ============================================================================

// Runs when you click "Add New Category".
function addCategory() {
    const html = buildCategoryHTML(null);
    document.querySelector('.add-category').insertAdjacentHTML('beforebegin', html);
    saveState();
}

// Runs when you click "Add Task" inside a category.
function addTask(event) {
    const addTaskButton = event.target.closest('.add-task');
    const html = buildTaskItemHTML(null, true, true);
    addTaskButton.insertAdjacentHTML('beforebegin', html);
    saveState();
}

// Runs when you click "Add Reminder".
function addReminder(event) {
    const addReminderButton = event.target.closest('.add-reminder');
    const html = buildTaskItemHTML(null, false, false);
    addReminderButton.insertAdjacentHTML('beforebegin', html);
    saveState();
}

// Runs when you click the 🔥 priority button on a task.
// Moves that task into the "Top Priorities" box (max 3 at a time).
function setPriority(event) {
    const taskItem = event.target.closest('.task-item');
    const prioritiesContainer = document.querySelector('.priorities-container');
    const existingPriorityItems = prioritiesContainer.querySelectorAll('.task-item');

    if (existingPriorityItems.length < 3) {
        prioritiesContainer.insertAdjacentElement('beforeend', taskItem);
        saveState();
    } else {
        alert('Maximum number of priorities reached!');
    }
}

// Runs when you check a task's checkbox.
// Moves that task into the "Finished Today" box.
function markFinished(event) {
    const taskItem = event.target.closest('.task-item');
    const finishedContainer = document.querySelector('.finished-container');
    finishedContainer.insertAdjacentElement('beforeend', taskItem);
    saveState();
}

// Re-orders the tasks in one category so the earliest date comes first.
// Tasks with no date get pushed to the bottom.
function sortItems(container) {
    const addTaskButton = container.querySelector('.add-task');
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

    // Put each task back into the page in its new sorted order,
    // right before the "Add Task" button.
    items.forEach(function(item) {
        container.insertBefore(item, addTaskButton);
    });

    saveState();
}

// Whenever a checkbox, date, or text box changes, save + (for dates) re-sort.
document.addEventListener('change', function(event) {
    if (event.target.classList.contains('task-date')) {
        sortItems(event.target.closest('.tasks-container'));
    }

    const isSomethingWeTrack = event.target.matches(
        '.task-date, .task-item-completed, .category-title, .task-input'
    );
    if (isSomethingWeTrack) {
        saveState();
    }
});

// Save while the user is still typing (not just after they click away),
// so text is never lost even if the page closes mid-sentence.
document.addEventListener('input', function(event) {
    if (event.target.matches('.task-input, .category-title')) {
        saveState();
    }
});


// ============================================================================
// SAVING (turning the page into JSON and storing it)
// ============================================================================

// Reads ONE task row from the page and turns it into a plain data object,
// e.g. { text: "Buy milk", completed: false, date: "2026-07-15", hasMetadata: true }
function serializeTaskItem(taskItemElement) {
    const text = taskItemElement.querySelector('.task-input').value;
    const completed = taskItemElement.querySelector('.task-item-completed').checked;
    const metadataElement = taskItemElement.querySelector('.task-item-metadata');

    if (metadataElement) {
        const date = taskItemElement.querySelector('.task-date').value;
        return { text: text, completed: completed, date: date, hasMetadata: true };
    }

    return { text: text, completed: completed, hasMetadata: false };
}

// Reads the ENTIRE page and turns it into one big data object:
// { categories: [...], priorities: [...], finished: [...], reminders: [...] }
function collectState() {
    const categories = [];
    document.querySelectorAll('main > .category-tasks').forEach(function(categoryElement) {
        const title = categoryElement.querySelector('.category-title').value;
        const tasks = [];

        categoryElement.querySelectorAll('.tasks-container > .task-item').forEach(function(taskElement) {
            tasks.push(serializeTaskItem(taskElement));
        });

        categories.push({ title: title, tasks: tasks });
    });

    const priorities = [];
    document.querySelectorAll('.priorities-container > .task-item').forEach(function(taskElement) {
        priorities.push(serializeTaskItem(taskElement));
    });

    const finished = [];
    document.querySelectorAll('.finished-container > .task-item').forEach(function(taskElement) {
        finished.push(serializeTaskItem(taskElement));
    });

    const reminders = [];
    document.querySelectorAll('.reminder-container > .task-item').forEach(function(taskElement) {
        reminders.push(serializeTaskItem(taskElement));
    });

    return {
        categories: categories,
        priorities: priorities,
        finished: finished,
        reminders: reminders
    };
}

// Saves the current state of the whole page into localStorage.
// This is called after every change (adding, typing, checking a box, etc.)
function saveState() {
    const currentState = collectState();           // 1. grab everything as an object
    const jsonText = JSON.stringify(currentState);  // 2. turn it into JSON text
    localStorage.setItem(STORAGE_KEY, jsonText);    // 3. store that text
}


// ============================================================================
// LOADING (turning saved JSON back into HTML when the page opens)
// ============================================================================

function loadState() {
    const savedText = localStorage.getItem(STORAGE_KEY);

    // Nothing saved yet (e.g. first time opening the app) — just keep
    // whatever default HTML is already in index.html.
    if (!savedText) {
        return;
    }

    let state;
    try {
        state = JSON.parse(savedText); // turn the JSON text back into an object
    } catch (error) {
        // If the saved text is ever corrupted/invalid, don't crash the page.
        console.error('Failed to read saved to-do list data', error);
        return;
    }

    // Clear out the default/example content so we can rebuild from scratch.
    document.querySelectorAll('main > .category-tasks').forEach(function(el) {
        el.remove();
    });
    document.querySelector('.priorities-container').innerHTML = '';
    document.querySelector('.finished-container').innerHTML = '';
    document.querySelector('.reminder-container').innerHTML =
        '<div onclick="addReminder(event)" class="add-reminder"><input type="button" value="Add Reminder"></div>';

    // Rebuild each category (or one empty category if none were saved).
    const addCategoryButton = document.querySelector('.add-category');
    let categories = state.categories;
    if (!categories || categories.length === 0) {
        categories = [null];
    }
    categories.forEach(function(category) {
        addCategoryButton.insertAdjacentHTML('beforebegin', buildCategoryHTML(category));
    });

    // Rebuild the "Top Priorities" list.
    const prioritiesContainer = document.querySelector('.priorities-container');
    const priorities = state.priorities || [];
    priorities.forEach(function(task) {
        prioritiesContainer.insertAdjacentHTML('beforeend', buildTaskItemHTML(task, true, true));
    });

    // Rebuild the "Finished Today" list.
    const finishedContainer = document.querySelector('.finished-container');
    const finished = state.finished || [];
    finished.forEach(function(task) {
        finishedContainer.insertAdjacentHTML('beforeend', buildTaskItemHTML(task, true, true));
    });

    // Rebuild the reminders list.
    const addReminderButton = document.querySelector('.reminder-container .add-reminder');
    const reminders = state.reminders || [];
    reminders.forEach(function(task) {
        addReminderButton.insertAdjacentHTML('beforebegin', buildTaskItemHTML(task, false, false));
    });
}

// As soon as the page's HTML is ready, try to load any previously saved data.
document.addEventListener('DOMContentLoaded', loadState);
