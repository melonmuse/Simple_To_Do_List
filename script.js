add_task_btn.addEventListener("click", function() {
    // 1. Get the task container safely using querySelector
    const task_container = document.querySelector('.task-container');
    
    // Check if the container exists before proceeding to avoid console errors
    if (!task_container) return;

    // 2. Create the wrapper div
    const new_task = document.createElement("div");
    new_task.className = "task-item";
    
    // 3. The HTML template string
    const task_item_html = `
    <div class="task-item-content">
        <label class="custom-checkbox">
            <input type="checkbox" class="task-item-completed">
            <span class="checkmark"></span>
        </label>
        <input type="text">
    </div>
    <div class="task-item-metadata">
        <input type="date" class="task-date">
    </div>`;
    
    // 4. Insert the HTML string inside the new div
    new_task.innerHTML = task_item_html;
    
    // 5. Append the element to the container
    task_container.appendChild(new_task);
}); 