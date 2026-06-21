function add_category_button() {
    let new_container = `
    <div class="category-tasks">
        <input type="text" class="category-title">
        <hr>
        <div class="tasks-container">
            <div class="task-item">
                <div class="task-item-content">
                    <label class="custom-checkbox">
                        <input type="checkbox" class="task-item-completed">
                        <span class="checkmark"></span>
                    </label>
                    <input type="text" class="task-input">
                </div>
                <div class="task-item-metadata">
                    <input type="date" class="task-date">
                    <input type="button" class="priority-button" value="🔥">
                </div>
            </div>
            <div class="add-task">
                <input type="button" value="Add Task">
            </div>
        </div>
    </div>
    `
    let add_button = document.querySelector(".add-category");
    add_button.insertAdjacentHTML('beforebegin', new_container);
}