// 1. Required elements
const inputField = document.querySelector(".input-field textarea"),
    todoLists = document.querySelector(".todoLists"),
    clearButton = document.querySelector(".clear-button"),
    filterTodo = document.querySelector(".filter-todo"),
    notification = document.querySelector('.notification'),
    noteIcon = document.querySelector(".note-icon");

// 2. local storage
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

// 3.  task counts
function updateTaskCounts() {
  const allTasksCount = document.querySelectorAll('.list').length;
  const completedTasksCount = document.querySelectorAll('.list.completed').length;
  const uncompletedTasksCount = allTasksCount - completedTasksCount;

  // filter todo options with task counts
  document.querySelector('option[value="all"]').textContent = `All (${allTasksCount})`;
  document.querySelector('option[value="completed"]').textContent = `Completed (${completedTasksCount})`;
  document.querySelector('option[value="uncompleted"]').textContent = `In-Progress (${uncompletedTasksCount})`;

}

// 4. calling function while adding, deleting, and checking-unchecking the task
function allTasks() {
    let tasks = document.querySelectorAll(".list");
    let allLists = document.querySelectorAll(".list");
    
    // Update clearButton (Clear All) based on the number of tasks
    if (allLists.length > 0) {
        todoLists.style.marginTop = "20px";
        clearButton.style.visibility = "visible"; // Make the button visible
        clearButton.style.pointerEvents = "auto";
    } else {
        todoLists.style.marginTop = "0px";
        clearButton.style.visibility = "hidden"; // Make the button invisible
        clearButton.style.pointerEvents = "none";
    }
    updateTaskCounts();

   


// 5. Saving all tasks to local storage
    const taskObjects = Array.from(tasks).reverse().map((task) => ({
        text: task.querySelector('.task').textContent,
        completed: task.classList.contains('completed')
    }));
    localStorage.setItem("tasks", JSON.stringify(taskObjects));

// 6. Saving filter option to local storage
    const selectedFilterOption = filterTodo.value;
    localStorage.setItem("filterOption", selectedFilterOption);
}

// 7. Alpha numeric 
inputField.addEventListener("keydown", (e) => {
    let inputVal = inputField.value.trim();
  
    // Regular expression to allow only alphanumeric characters and space
    const alphanumericRegex = /^[a-zA-Z0-9 ]*$/;
  
    if (inputVal.length >= 100 && e.key !== "Backspace") {
      e.preventDefault(); // Prevent input when character limit is reached
      showNotification("Max 100 characters is allowed)", "danger");
    } else if (e.key === "Enter" && inputVal.trim().length > 0) {
      e.preventDefault(); // Prevent the default Enter key behavior (new line)
  
      if (!isDuplicateTask(inputVal)) {
        addTaskToList(inputVal, false); // Pass false to indicate an uncompleted task
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
      e.preventDefault(); // Prevent input of special characters
      showNotification("Special characters are not allowed", "danger");
    }
});

// Add a 'paste' event listener to filter out special characters
inputField.addEventListener("paste", (e) => {
    e.preventDefault(); // Prevent the default paste behavior
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    const filteredText = pastedText.replace(/[^a-zA-Z0-9 ]/g, ''); // Remove special characters
    inputField.setRangeText(filteredText, inputField.selectionStart, inputField.selectionEnd, 'end'); // Insert the filtered text
});

// Update paste event listener for editable area (span with contentEditable)
document.addEventListener("paste", (e) => {
    const activeElement = document.activeElement;
    if (activeElement.tagName === "SPAN" && activeElement.contentEditable === "true") {
        e.preventDefault(); // Prevent the default paste behavior
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const filteredText = pastedText.replace(/[^a-zA-Z0-9 ]/g, ''); // Remove special characters
        document.execCommand("insertHTML", false, filteredText); // Insert the filtered text
    }
});



// 8. Note icon
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

//  event listener
noteIcon.addEventListener('click', () => {
    // Toggle the "clicked" class on the note-icon
    noteIcon.classList.toggle('clicked');
    setTimeout(() => {
        noteIcon.classList.remove('clicked');
    }, 300);
});

// 9. Function to check character length and activate scrolling
function checkAndEnableScroll() {
    const inputVal = inputField.value.trim();
    const maxCharacterLimit = 100; // Maximum character limit
    if (inputVal.length > maxCharacterLimit) {
        inputField.style.overflowY = "auto";
        showNotification("Character limit exceeded (max 100 characters)", "danger");
    } else {
        inputField.style.overflowY = "hidden";
    }
}

// 10. Single task Deletion
function deleteTask(e) {
    const listItem = e.parentElement;
    const taskText = listItem.querySelector('.task').textContent;
    // Show a confirmation dialog before deleting the task
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
}

// 11. Confirmation Dialog
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

// 12. All task deletion - Clear all Button
clearButton.addEventListener("click", () => {
    const tasks = document.querySelectorAll(".list");

    if (tasks.length > 0) {
        showConfirmationDialog("Are you sure you want to clear all tasks?", () => {
            tasks.forEach((task) => {
                task.remove();
            });
            allTasks();
            filterTasks();
            showNotification("Your list is cleared", "danger");
            updateLocalStorage();
        });
    } else {
        showNotification("No tasks to clear", "danger");
    }
});



 // 13. Enable Edit Mode
function enableEditMode(listItem) {
    const isCompleted = listItem.classList.contains('completed');
    const span = listItem.querySelector('.task');
    const originalText = span.textContent;

    // Check if the click target is the text span
    const isTextSpanClicked = event.target === span;

    if (!isCompleted && isTextSpanClicked) {
        span.contentEditable = true;
        span.maxLength = 100; // Set maximum length for the editable task
        span.focus();

        span.addEventListener("keydown", (e) => {
            const newText = span.textContent.trim();
            const alphanumericRegex = /^[a-zA-Z0-9 ]*$/;

            if (e.key === "Enter") {
                e.preventDefault();
                saveEditedTask(listItem, span, originalText, newText);
            } else if (!(alphanumericRegex.test(e.key) || e.key === "Backspace" || e.key === "Enter")) {
                e.preventDefault(); // Prevent input of special characters
                showNotification("Special characters are not allowed", "danger");
            } else if (newText.length >= 100 && e.key.length === 1 && span.selectionStart === span.selectionEnd) {
                e.preventDefault();
                showNotification("Maximum character limit reached (max 100 characters)", "danger");
            }
        });

        span.addEventListener("input", () => {
            let newText = span.textContent.trim();
            newText = newText.replace(/\s+/g, ' '); // Replace multiple consecutive spaces with a single space

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
                    listItem.remove();   // Remove the original task

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

        // Remove "selected" class from all tasks
        const allTasks = document.querySelectorAll('.list');
        allTasks.forEach(task => {
            if (task !== listItem) {
                task.classList.remove('selected');
            }
        });

        // Add "selected" class to the clicked task
        listItem.classList.add('selected');
    }
}



// 28. Modify the event listener for the text
document.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains('task')) {
        enableEditMode(target);
    }
});



// 16. Function to save the edited task
function saveEditedTask(listItem, span, originalText, newText) {
    if (newText.length !== originalText.length || newText !== originalText) {
        if (newText.length > 0) {
            // Check if the edited task is a duplicate
            const isDuplicate = isDuplicateTask(newText);
            if (!isDuplicate) {
                // Remove the original task
                listItem.remove();
                // Add the edited task as a new task using the modified addTaskToList
                addTaskToList(newText, listItem.classList.contains('completed'));
                showNotification("Your Task Updated", "success");
                // Update local storage after editing task
                updateLocalStorage();
            } else {
                // Show notification when the edited task already exists
                showNotification("Edited task already exists and has been deleted", "danger");
                // Remove the edited task
                listItem.remove();
                // Update local storage after deleting the edited task
                updateLocalStorage();
                updateTaskCounts();
            }
        } else {
            // If edited task is empty, delete the list item
            listItem.remove();
            showNotification("Task cannot be empty", "danger");
            // Update local storage after deleting task
            updateLocalStorage();
            updateTaskCounts();
        }
    }
    span.contentEditable = false;
}


  
  
// 17. Highlight the list while hovering
function highlightOnHover(listItem) {
  listItem.classList.add('hovered');

}

 

// 18. Remove highlight when not hovering
function removeHighlightOnHover(listItem) {
  listItem.classList.remove('hovered');
}

// 19. Helper function to check for duplicate tasks
function isDuplicateTask(taskText) {
    const tasks = document.querySelectorAll(".list");
    return Array.from(tasks).some((task) => task.querySelector('.task').textContent.trim() === taskText);
}


// 20. Helper function to add a task to the list
function addTaskToList(taskText, isCompleted) {
    const isDuplicate = isDuplicateTask(taskText);
    if (!isDuplicate) {
        let liTag = `
          <li class="list ${isCompleted ? 'completed' : 'pending'}"
              onclick="enableEditMode(this)"
              onmouseover="highlightOnHover(this)"
              onmouseout="removeHighlightOnHover(this)">
            <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="updateTaskStatus(this)" />
            <span class="task">${taskText}</span>
            <i class="uil uil-trash" onclick="deleteTask(this)"></i>
          </li>`;

        todoLists.insertAdjacentHTML("afterbegin", liTag);

        filterTodo.value = "all";
        updateLocalStorage();
        allTasks();
        filterTasks();
        showNotification();
    } else {
        showNotification("Task already exists", "danger");
    }

}

function updateTaskStatus(checkbox) {
    const listItem = checkbox.closest('.list');
    const isCompleted = checkbox.checked;

    // Function to handle the completion of the task
    const handleCompletion = () => {
        listItem.classList.toggle('completed', isCompleted);
        showNotification(`Task is marked as ${isCompleted ? 'completed' : 'in-progress'}`, "success");

        // Update local storage immediately
        updateLocalStorage();

        // Update task counts
        updateTaskCounts();

        // Filter tasks based on the selected option
        filterTasks();
    };

    // If the task is empty, don't mark it as completed
    const newText = listItem.querySelector('.task').textContent.trim();
    if (isCompleted && newText.length === 0) {
        checkbox.checked = false;
        showNotification("Task cannot be empty", "danger");
        return;
    }

    // If unchecking the checkbox, show a confirmation dialog
    if (!isCompleted) {
        showConfirmationDialog(
            "Are you sure you want to mark this task as in-progress?",
            handleCompletion,
            () => {
                // Restore the original state if the user cancels the confirmation
                checkbox.checked = true;
            }
        );
    } else {
        // For checking the checkbox, update the UI and local storage immediately
        handleCompletion();
    }
}


// Function to disable edit mode
function disableEditMode(listItem) {
    const span = listItem.querySelector('.task');
    span.contentEditable = false;

    // Remove the "selected" class
    listItem.classList.remove('selected');

    // Disable interaction for the completed task
    listItem.style.pointerEvents = 'auto';
}







// // // 21. Helper function to handle task status update
// function handleTaskStatusUpdate(listItem, isCompleted) {
//     const span = listItem.querySelector('.task');
//     const newText = span.textContent.trim();
    
//     if (isCompleted) {
//         if (newText.length > 0) {
//             listItem.classList.add('completed');
//             showNotification("Your task is completed", "success");
//         } else {
//             // If the task is empty, don't mark it as completed
//             checkbox.checked = false;
//             showNotification("Task cannot be empty", "danger");
//             return;
//         }
//     } else {
//         if (newText.length > 0) {
//             listItem.classList.remove('completed');
//             showNotification("Task status is Modified", "success");
//         } else {       
//             // If the task is empty, remove it from the list
//             listItem.remove();
//             showNotification("Task cannot be empty", "danger");
//             updateLocalStorage();
//             allTasks();
//             filterTasks();
//             updateTaskCounts();
//             return;
//         }
//     }

//     updateLocalStorage();
//     allTasks();
//     filterTasks();
//     updateTaskCounts();
// }


// 22. Filter tasks based on the selected option
filterTodo.addEventListener("change", () => {
    allTasks();
    filterTasks();
});

// 23. Filter tasks based on the selected option
function filterTasks() {
    const selectedOption = localStorage.getItem("filterOption") || "all";
    const tasks = document.querySelectorAll(".list");
    let noTasksMessage = document.querySelector('.no-tasks-message');

    // 24. Check if the message element exists, if not, create it
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

                updateTaskCounts();
        }
    });

    // 25. Show/hide the "no tasks" message based on tasksExist
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

 
// 27 . Helper function to update local storage with the current tasks
function updateLocalStorage() {
    const tasks = document.querySelectorAll(".list");
    const taskObjects = Array.from(tasks).map((task) => ({
        text: task.querySelector('.task').textContent,
        completed: task.classList.contains('completed')
    }));
    localStorage.setItem("tasks", JSON.stringify(taskObjects.reverse()));
}


// Function to update task status with confirmation for unchecking
function updateTaskStatus(checkbox) {
    const listItem = checkbox.closest('.list');
    const isCompleted = checkbox.checked;

    // Function to handle the completion of the task
    const handleCompletion = () => {
        listItem.classList.toggle('completed', isCompleted);
        showNotification(`Task is marked as ${isCompleted ? 'completed' : 'in-progress'}`, "success");

        // Update local storage immediately
        updateLocalStorage();

        // Update task counts
        updateTaskCounts();

        // Filter tasks based on the selected option
        filterTasks();
    };

    // If the task is empty, don't mark it as completed
    const newText = listItem.querySelector('.task').textContent.trim();
    if (isCompleted && newText.length === 0) {
        checkbox.checked = false;
        showNotification("Task cannot be empty", "danger");
        return;
    }

    // If unchecking the checkbox, show a confirmation dialog
    if (!isCompleted) {
        showConfirmationDialog(
            "Are you sure you want to mark this task as in-progress?",
            handleCompletion,
            () => {
                // Restore the original state if the user cancels the confirmation
                checkbox.checked = true;
            }
        );
    } else {
        // For checking the checkbox, update the UI and local storage immediately
        handleCompletion();
    }
}