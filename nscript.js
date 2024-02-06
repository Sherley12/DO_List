// 1. Define a global variable for the action queue
const actionQueue = [];

// 2. Function to process the next action in the queue
function processNextAction() {
    if (actionQueue.length > 0) {
        const action = actionQueue.shift();
        action();
    }
}

// 3. Function to add an action to the queue
function queueAction(action) {
    actionQueue.push(action);
    processNextAction();
}

// 4. Required elements
const inputField = document.querySelector(".input-field textarea"),
    todoLists = document.querySelector(".todoLists"),
    clearButton = document.querySelector(".clear-button"),
    filterTodo = document.querySelector(".filter-todo"),
    notification = document.querySelector('.notification'),
    noteIcon = document.querySelector(".note-icon");

// 5. local storage
document.addEventListener("DOMContentLoaded", () => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const savedFilterOption = localStorage.getItem("filterOption") || "all";
    filterTodo.value = savedFilterOption;
    savedTasks.forEach((task) => {
        addTaskToList(task.text, task.completed);
    });
    allTasks();
    filterTasks();
});

// 6. task counts
function updateTaskCounts() {
    const allTasksCount = document.querySelectorAll('.list').length;
    const completedTasksCount = document.querySelectorAll('.list.completed').length;
    const uncompletedTasksCount = allTasksCount - completedTasksCount;

    document.querySelector('option[value="all"]').textContent = `All (${allTasksCount})`;
    document.querySelector('option[value="completed"]').textContent = `Completed (${completedTasksCount})`;
    document.querySelector('option[value="uncompleted"]').textContent = `In-Progress (${uncompletedTasksCount})`;
}

// 7. calling function while adding, deleting, and checking-unchecking the task
function allTasks() {
    let tasks = document.querySelectorAll(".list");
    let allLists = document.querySelectorAll(".list");
    if (allLists.length > 0) {
        todoLists.style.marginTop = "20px";
        clearButton.style.pointerEvents = "auto";
    } else {
        todoLists.style.marginTop = "0px";
        clearButton.style.pointerEvents = "none";
    }
    updateTaskCounts();

    // 8. Saving all tasks to local storage
    const taskObjects = Array.from(tasks).reverse().map((task) => ({
        text: task.querySelector('.task').textContent,
        completed: task.classList.contains('completed')
    }));
    localStorage.setItem("tasks", JSON.stringify(taskObjects));

    // 9. Saving filter option to local storage
    const selectedFilterOption = filterTodo.value;
    localStorage.setItem("filterOption", selectedFilterOption);
}

// 10. Alpha numeric 
inputField.addEventListener("keydown", (e) => {
    let inputVal = inputField.value.trim();

    const alphanumericRegex = /^[a-zA-Z0-9 ]*$/;

    if (inputVal.length >= 100 && e.key !== "Backspace") {
        e.preventDefault();
        showNotification("Max 100 characters is allowed)", "danger");
    } else if (e.key === "Enter" && inputVal.trim().length > 0) {
        e.preventDefault();

        if (!isDuplicateTask(inputVal)) {
            addTaskToList(inputVal, false);
            inputField.value = "";
            allTasks();
            filterTasks();
            showNotification(" Your Task is added ", "success");
        } else {
            showNotification("Task already exists", "danger");
        }
    } else if (
        e.key !== "Backspace" &&
        !alphanumericRegex.test(e.key)
    ) {
        e.preventDefault();
        showNotification("Special characters are not allowed", "danger");
    }
});

inputField.addEventListener("paste", (e) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const filteredText = pastedText.replace(/[^a-zA-Z0-9 ]/g, '');
    inputField.setRangeText(filteredText, inputField.selectionStart, inputField.selectionEnd, 'end');
});

document.addEventListener("paste", (e) => {
    const activeElement = document.activeElement;
    if (activeElement.tagName === "SPAN" && activeElement.contentEditable === "true") {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const filteredText = pastedText.replace(/[^a-zA-Z0-9 ]/g, '');
        document.execCommand("insertHTML", false, filteredText);
    }
});

// 11. Note icon
noteIcon.addEventListener("click", () => {
    const inputVal = inputField.value.trim();
    if (inputVal.length > 0) {
        if (!isDuplicateTask(inputVal)) {
            addTaskToList(inputVal, false);
            inputField.value = "";
            allTasks();
            filterTasks();
            showNotification(" Your Task is added ", "success");
        } else {
            showNotification("Task already exists", "danger");
        }
    }
});

noteIcon.addEventListener('click', () => {
    noteIcon.classList.toggle('clicked');
    setTimeout(() => {
        noteIcon.classList.remove('clicked');
    }, 300);
});

// 12. Function to check character length and activate scrolling
function checkAndEnableScroll() {
    const inputVal = inputField.value.trim();
    const maxCharacterLimit = 100;
    if (inputVal.length > maxCharacterLimit) {
        inputField.style.overflowY = "auto";
        showNotification("Character limit exceeded (max 100 characters)", "danger");
    } else {
        inputField.style.overflowY = "hidden";
    }
}

// 13. Single task Deletion
function deleteTask(e) {
    const listItem = e.parentElement;
    const taskText = listItem.querySelector('.task').textContent;

    queueAction(() => {
        showConfirmationDialog(
            `Are you sure you want to delete the task? <br>\n\n <b>"${taskText}"`,
            () => {
                listItem.remove();
                allTasks();
                filterTasks();
                showNotification(`Task has been deleted`, "danger");
                updateLocalStorage();
            }
        );
    });
}

// 14. Confirmation Dialog
function showConfirmationDialog(message, onConfirm, onCancel) {
    const confirmationDialog = document.getElementById("confirmationDialog");
    const confirmationMessage = document.getElementById("confirmationMessage");
    confirmationMessage.innerHTML = message;
    const confirmButton = document.getElementById("confirmButton");
    const cancelButton = document.getElementById("cancelButton");
    confirmButton.addEventListener("click", () => {
        confirmationDialog.style.display = "none";
        if (onConfirm && typeof onConfirm === "function") {
            onConfirm();
        }
    });
    cancelButton.addEventListener("click", () => {
        confirmationDialog.style.display = "none";
        if (onCancel && typeof onCancel === "function") {
            onCancel();
        }
    });
    confirmationDialog.style.display = "flex";
}

// 15. All task deletion - Clear all Button
clearButton.addEventListener("click", () => {
    const tasks = document.querySelectorAll(".list");

    if (tasks.length > 0) {
        queueAction(() => {
            showConfirmationDialog("Are you sure you want to clear all tasks?", () => {
                tasks.forEach((task) => {
                    task.remove();
                });
                allTasks();
                filterTasks();
                showNotification("Your list is cleared", "danger");
                updateLocalStorage();
            });
        });
    } else {
        showNotification("No tasks to clear", "danger");
    }
});

// 16. Enable Edit Mode
function enableEditMode(listItem) {
    const isCompleted = listItem.classList.contains('completed');
    const span = listItem.querySelector('.task');
    const originalText = span.textContent;

    if (!isCompleted) {
        span.contentEditable = true;
        span.maxLength = 100;
        span.focus();

        span.addEventListener("keydown", (e) => {
            const newText = span.textContent.trim();
            const alphanumericRegex = /^[a-zA-Z0-9 ]*$/;

            if (e.key === "Enter") {
                e.preventDefault();
                saveEditedTask(listItem, span, originalText, newText);
            }
            if (!(alphanumericRegex.test(e.key) || e.key === "Backspace" || e.key === "Enter")) {
                e.preventDefault();
                showNotification("Special characters are not allowed", "danger");
            }
            if (newText.length >= 100 && e.key.length === 1) {
                e.preventDefault();
                showNotification("Maximum character limit reached (max 100 characters)", "danger");
            }
        });

        span.addEventListener("input", () => {
            let newText = span.textContent.trim();
            newText = newText.replace(/\s+/g, ' ');

            const validWordRegex = /^[a-zA-Z0-9]+( [a-zA-Z0-9]+)*$/;
            const validLetterRegex = /^[a-zA-Z ]*$/;

            if (validWordRegex.test(newText) && validLetterRegex.test(newText)) {
                checkAndEnableScroll();
            }
        });

        span.addEventListener("blur", () => {
            let newText = span.textContent.trim();
            if (newText.length > 100) {
                newText = newText.slice(0, 100);
                span.textContent = newText;
                showNotification("Maximum character limit reached (max 100 characters)", "danger");
            }
            newText = newText.replace(/\s+/g, ' ');
            if (newText.length !== originalText.length) {
                if (newText.length > 0) {
                    listItem.remove();

                    if (!isDuplicateTask(newText)) {
                        addTaskToList(newText, listItem.classList.contains('completed'));
                        showNotification("Your Task Updated", "success");
                        updateLocalStorage();
                    } else {
                        showNotification("Task already exists", "danger");
                    }
                } else {
                    listItem.remove();
                    showNotification("Task cannot be empty", "danger");
                    updateLocalStorage();
                }
            }
            span.contentEditable = false;
        });

        const allTasks = document.querySelectorAll('.list');
        allTasks.forEach(task => {
            if (task !== listItem) {
                task.classList.remove('selected');
            }
        });

        listItem.classList.add('selected');
    }
}

// 17. Function to save the edited task
function saveEditedTask(listItem, span, originalText, newText) {
    if (newText.length !== originalText.length) {
        if (newText.length > 0) {
            const isDuplicate = isDuplicateTask(newText, listItem);
            if (!isDuplicate) {
                listItem.remove();
                addTaskToList(newText, listItem.classList.contains('completed'));
                showNotification("Your Task Updated", "success");
                updateLocalStorage();
            } else {
                showNotification("Task already exists", "danger");
            }
        } else {
            listItem.remove();
            showNotification("Task cannot be empty", "danger");
            updateLocalStorage();
            updateTaskCounts();
        }
    }
    span.contentEditable = false;
}

// 18. Highlight the list while hovering
function highlightOnHover(listItem) {
    listItem.classList.add('hovered');
}

// 19. Remove highlight when not hovering
function removeHighlightOnHover(listItem) {
    listItem.classList.remove('hovered');
}

// 20. Helper function to check for duplicate tasks
function isDuplicateTask(taskText) {
    const tasks = document.querySelectorAll(".list");
    return Array.from(tasks).some((task) => task.querySelector('.task').textContent.trim() === taskText);
}

// 21. Helper function to add a task to the list
function addTaskToList(taskText, isCompleted) {
    const isDuplicate = isDuplicateTask(taskText);
    if (!isDuplicate) {
        const liTag = `
          <li class="list ${isCompleted ? 'completed' : 'pending'}"
              onclick="enableEditMode(this)"
              onmouseover="highlightOnHover(this)"
              onmouseout="removeHighlightOnHover(this)">
            <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="updateTaskStatus(this)" />
            <span class="task">${taskText}</span>
            <i class="uil uil-trash" onclick="deleteTask(this)"></i>
          </li>`;

        queueAction(() => {
            todoLists.insertAdjacentHTML("afterbegin", liTag);
            filterTodo.value = "all";
            updateLocalStorage();
            allTasks();
            filterTasks();
            showNotification();
        });
    } else {
        showNotification("Task already exists", "danger");
    }
}

// 22. Function to update task status
function updateTaskStatus(checkbox) {
    const listItem = checkbox.closest('.list');
    const isCompleted = checkbox.checked;

    const originalState = listItem.classList.contains('completed');

    queueAction(() => {
        showConfirmationDialog("Are you sure you want to complete this task?", () => {
            handleTaskStatusUpdate(listItem, isCompleted, true);
            updateLocalStorage();
        }, () => {
            checkbox.checked = originalState;
            updateLocalStorage();
        });
    });
}

// 23. Helper function to handle task status update
function handleTaskStatusUpdate(listItem, isCompleted, checkbox) {
    const span = listItem.querySelector('.task');
    const newText = span.textContent.trim();

    if (isCompleted) {
        if (newText.length > 0) {
            listItem.classList.add('completed');
            showNotification("Your task is completed", "success");
        } else {
            if (checkbox) {
                checkbox.checked = false;
            }
            showNotification("Task cannot be empty", "danger");
            return;
        }
    } else {
        if (newText.length > 0) {
            listItem.classList.remove('completed');
            showNotification("Task status is Modified", "success");
        } else {
            listItem.remove();
            showNotification("Task cannot be empty", "danger");
            updateLocalStorage();
            allTasks();
            filterTasks();
            updateTaskCounts();
            return;
        }
    }

    updateLocalStorage();
    allTasks();
    filterTasks();
    updateTaskCounts();
}

// 24. Filter tasks based on the selected option
filterTodo.addEventListener("change", () => {
    allTasks();
    filterTasks();
});

// 25. Filter tasks based on the selected option
function filterTasks() {
    const selectedOption = localStorage.getItem("filterOption") || "all";
    const tasks = document.querySelectorAll(".list");
    let noTasksMessage = document.querySelector('.no-tasks-message');

    if (!noTasksMessage) {
        noTasksMessage = document.createElement('p');
        noTasksMessage.className = 'no-tasks-message';
        todoLists.appendChild(noTasksMessage);
    }

    let tasksExist = false;
    tasks.forEach((task) => {
        const isCompleted = task.classList.contains('completed');
        switch (selectedOption) {
            case "all":
                task.style.display = "flex";
                tasksExist = true;
                break;

            case "completed":
                task.style.display = isCompleted ? "flex" : "none";
                tasksExist = tasksExist || isCompleted;
                break;

            case "uncompleted":
                task.style.display = isCompleted ? "none" : "flex";
                tasksExist = tasksExist || !isCompleted;
                break;

            default:
                updateTaskCounts();
        }
    });

    if (!tasksExist) {
        noTasksMessage.textContent = "    You don't have any tasks here.";
    } else {
        noTasksMessage.textContent = "";
    }
}

function showNotification(text, id) {
    notification.textContent = text;
    notification.classList.add(`${id}`);
    setTimeout(() => {
        notification.textContent = "";
        notification.classList.remove(`${id}`);
        processNextAction(); // Process next action in the queue after notification timeout
    }, 1500);
}

// 26. Add click event listener
noteIcon.addEventListener('click', () => {
    const inputVal = inputField.value.trim();
    if (inputVal.length > 0) {
        if (!isDuplicateTask(inputVal)) {
            addTaskToList(inputVal, false);
            inputField.value = "";
            allTasks();
            filterTasks();
            showNotification(" Your Task is added ", "success");
            updateLocalStorage();
        } else {
            showNotification("Task already exists", "danger");
        }
    }
});

// 27. Helper function to update local storage with the current tasks
function updateLocalStorage() {
    const tasks = document.querySelectorAll(".list");
    const taskObjects = Array.from(tasks).map((task) => ({
        text: task.querySelector('.task').textContent,
        completed: task.classList.contains('completed')
    }));
    localStorage.setItem("tasks", JSON.stringify(taskObjects.reverse()));
}
