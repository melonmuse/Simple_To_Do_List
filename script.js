/* ==========================================================================
   1. GLOBAL STATE & LOGIC FOR PRIORITIES
   ========================================================================== */

// This function counts how many tasks are currently inside the Top Priorities box
function getPriorityCount() {
    const prioritiesContainer = document.querySelector('.priorities-container');
    if (!prioritiesContainer) return 0;
    // Count only actual task items
    return prioritiesContainer.querySelectorAll('.task-item').length;
}

// This function checks if ALL tasks in the Top Priorities box are checked
function areAllPrioritiesCompleted() {
    const prioritiesContainer = document.querySelector('.priorities-container');
    if (!prioritiesContainer) return false;
    
    const allPriorityTasks = prioritiesContainer.querySelectorAll('.task-item');
    if (allPriorityTasks.length === 0) return false;

    let completedCount = 0;
    allPriorityTasks.forEach(task => {
        const checkbox = task.querySelector('.task-item-completed');
        if (checkbox && checkbox.checked) {
            completedCount++;
        }
    });

    return completedCount === allPriorityTasks.length;
}


/* ==========================================================================
   2. AUTOMATIC DUE DATE SORTING
   ========================================================================== */

// A reusable function to sort tasks inside any container by their due date
function sortTasksByDate(container) {
    // 1. Grab all the task items inside this specific container and turn them into an Array
    const tasks = Array.from(container.querySelectorAll('.task-item'));

    // 2. Sort them based on the value of their date input box
    tasks.sort((taskA, taskB) => {
        const dateA = taskA.querySelector('.task-date')?.value || '';
        const dateB = taskB.querySelector('.task-date')?.value || '';

        // If a task doesn't have a date picked, push it to the very bottom
        if (!dateA) return 1;
        if (!dateB) return -1;

        // Compare the dates (earliest date goes to the top)
        return new Date(dateA) - new Date(dateB);
    });

    // 3. Put them back into the box in the brand new sorted order
    tasks.forEach(task => {
        const buttonWrapper = container.querySelector('.add-task');
        // If it's a standard list, make sure tasks stay ABOVE the "Add Task" button box
        if (buttonWrapper) {
            container.insertBefore(task, buttonWrapper);
        } else {
            container.appendChild(task);
        }
    });
}


/* ==========================================================================
   3. GLOBAL CLICK EVENT HANDLING
   ========================================================================== */

document.addEventListener("click", function(event) {
    const clickedElement = event.target;

    // --- A. CLICKED AN "ADD TASK" BUTTON ---
    if (clickedElement.value === "Add Task") {
        const buttonWrapper = clickedElement.parentElement;
        const tasksContainer = buttonWrapper.parentElement;
        
        // Create the new task element
        const newTask = document.createElement("div");
        newTask.className = "task-item";
        
        newTask.innerHTML = `
        <div class="task-item-content">
            <label class="custom-checkbox">
                <input type="checkbox" class="task-item-completed">
                <span class="checkmark"></span>
            </label>
            <input type="text">
        </div>
        <div class="task-item-metadata">
            <input type="date" class="task-date">
            <input type="button" class="priority-button" value="🔥">
        </div>`;
        
        // Insert it right above the Add Task button block
        tasksContainer.insertBefore(newTask, buttonWrapper);
        
        // Run the sort right away (blank date falls to bottom)
        sortTasksByDate(tasksContainer);
    }

    // --- B. CLICKED A PRIORITY BUTTON (🔥) ---
    if (clickedElement.classList.contains("priority-button")) {
        const currentCount = getPriorityCount();

        // Check if the Top Priorities container is already full
        if (currentCount >= 3) {
            alert("Your Top Priorities box is full! You can only have a maximum of 3 tasks.");
            return; // Stop running the code right here
        }

        const taskItem = clickedElement.closest('.task-item');
        const prioritiesContainer = document.querySelector('.priorities-container');

        if (taskItem && prioritiesContainer) {
            // Duplicate the task item to safely move it over
            const taskCopy = taskItem.cloneNode(true);
            
            // Put it into the Top Priorities container
            prioritiesContainer.appendChild(taskCopy);
            
            // Remove the original version from its old category box
            taskItem.remove();
            
            // Auto-sort the priority box by date
            sortTasksByDate(prioritiesContainer);
        }
    }

    // --- C. CLICKED A CHECKBOX ---
    if (clickedElement.classList.contains("task-item-completed")) {
        const taskItem = clickedElement.closest('.task-item');
        const isInPriorityBox = clickedElement.closest('.priorities-container');

        // Case 1: The checkbox was ticked inside the TOP PRIORITIES box
        if (isInPriorityBox) {
            const currentCount = getPriorityCount();

            // If there are exactly 3 items and they are now ALL checked
            if (currentCount === 3 && areAllPrioritiesCompleted()) {
                const prioritiesContainer = document.querySelector('.priorities-container');
                const finishedContainer = document.querySelector('.finished-container');
                const allPriorityTasks = prioritiesContainer.querySelectorAll('.task-item');

                // Move all 3 items together to the Finished Today list
                allPriorityTasks.forEach(task => {
                    const checkbox = task.querySelector('.task-item-completed');
                    if (checkbox) checkbox.checked = true; // Keep visually checked
                    finishedContainer.appendChild(task);
                });

                alert("Amazing work! All 3 priorities completed. Clear to add new ones!");
            }
        } 
        // Case 2: Standard behavior for any regular task outside of priorities
        else if (clickedElement.checked) {
            const finishedContainer = document.querySelector('.finished-container');
            if (taskItem && finishedContainer) {
                finishedContainer.appendChild(taskItem);
            }
        }
    }
});


/* ==========================================================================
   4. GLOBAL CHANGE EVENT HANDLING (FOR DATE CALENDARS)
   ========================================================================== */

// This watches for whenever a calendar input is edited or selected
document.addEventListener("change", function(event) {
    if (event.target.classList.contains("task-date")) {
        const taskItem = event.target.closest('.task-item');
        if (taskItem) {
            const container = taskItem.parentElement;
            // Instantly resort the container list the exact second the date is changed
            sortTasksByDate(container);
        }
    }
});


/* ==========================================================================
   5. ADDING A NEW CATEGORY CARD
   ========================================================================== */

const addCategoryBtn = document.querySelector('.add-category');
const gridContainer = document.querySelector('.grid-container');

if (addCategoryBtn && gridContainer) {
    addCategoryBtn.addEventListener("click", function() {
        const newCategoryName = window.prompt("Enter the name of the new category:");
        
        // If the user leaves it blank or clicks cancel, stop here
        if (!newCategoryName) return;
        
        // Create the new container block
        const newCategory = document.createElement("div");
        newCategory.className = "category-tasks";
        
        newCategory.innerHTML = `
        <h2>${newCategoryName}</h2>
        <hr>
        <div class="tasks-container">
            <div class="task-item">
                <div class="task-item-content">
                    <label class="custom-checkbox">
                        <input type="checkbox" class="task-item-completed">
                        <span class="checkmark"></span>
                    </label>
                    <input type="text">
                </div>
                <div class="task-item-metadata">
                    <input type="date" class="task-date">
                    <input type="button" class="priority-button" value="🔥">
                </div>
            </div>
            <div class="add-task">
                <input type="button" value="Add Task">
            </div>
        </div>`;
        
        // Pin the new card neatly right BEFORE the "Add New Category" box
        gridContainer.insertBefore(newCategory, addCategoryBtn);
    });
}