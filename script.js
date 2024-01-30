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

// 3. calling function while adding, deleting, and checking-unchecking the task
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

  // 4. Saving all tasks to local storage
  const taskObjects = Array.from(tasks).reverse().map((task) => ({
    text: task.querySelector('.task').textContent,
    completed: task.classList.contains('completed')
  }));
  localStorage.setItem("tasks", JSON.stringify(taskObjects));

  // 5. Saving filter option to local storage
  const selectedFilterOption = filterTodo.value;
  localStorage.setItem("filterOption", selectedFilterOption);
}

// 6. Enter button
inputField.addEventListener("keyup", (e) => {
  let inputVal = inputField.value.trim();

  if (e.key === "Enter" && inputVal.length > 0) {
    if (!isDuplicateTask(inputVal)) {
      addTaskToList(inputVal, false); // Pass false to indicate an uncompleted task
      inputField.value = "";
      allTasks();
      filterTasks();
      showNotification(" Your Task is added ", "success");
    } else {
      showNotification("Task already exists", "danger");
    }
  }
});

// 7. Note icon
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


// 8. Single task Deletion
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
      }
    );
  }
  
  // 9. Confirmation Dialog
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
  

  // 10. All task deletion - Clear all Button
  clearButton.addEventListener("click", () => {
    showConfirmationDialog("Are you sure you want to clear all tasks?", () => {
      todoLists.innerHTML = "";
      allTasks();
      filterTasks();
      showNotification("Your list is cleared", "danger");
  
      // Update local storage after clearing all tasks
      updateLocalStorage();
    });
  });
  

  function enableEditMode(listItem) {
    const isCompleted = listItem.classList.contains('completed');
    const span = listItem.querySelector('.task');
    const originalText = span.textContent;

    if (!isCompleted) {
        span.contentEditable = true;
        span.focus();

        span.addEventListener("blur", () => {
            const newText = span.textContent.trim();

            if (newText !== originalText) {
                if (newText.length > 0) {
                    // Remove the original task
                    listItem.remove();

                    if (!isDuplicateTask(newText)) {
                        // Add the edited task as a new task using the modified addTaskToList
                        addTaskToList(newText, listItem.classList.contains('completed'));
                        showNotification(" Your Task Updated", "success");

                        // Update local storage after editing task
                        updateLocalStorage();
                    } else {
                        // Show notification when the task already exists
                        showNotification("Task already exists", "danger");
                    }
                } else {
                    // If edited task is empty, delete the list item
                    listItem.remove();
                    showNotification("Task cannot be empty", "danger");

                    // Update local storage after deleting task
                    updateLocalStorage();
                }
            }

            span.contentEditable = false;
        });

        // 11. Remove "selected" class from all tasks
        const allTasks = document.querySelectorAll('.list');
        allTasks.forEach(task => {
            if (task !== listItem) {
                task.classList.remove('selected');
            }
        });

        // 12. Add "selected" class to the clicked task
        listItem.classList.add('selected');
    }
}


// 13. Highlight the list while hovering
function highlightOnHover(listItem) {
  listItem.classList.add('hovered');
}

// 14. Remove highlight when not hovering
function removeHighlightOnHover(listItem) {
  listItem.classList.remove('hovered');
}

// 15. Helper function to check for duplicate tasks
function isDuplicateTask(taskText) {
  const tasks = document.querySelectorAll(".list");
  return Array.from(tasks).some((task) => task.querySelector('.task').textContent.trim() === taskText);
}

// 16. Helper function to add a task to the list
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

        // Insert the task at the beginning of the list
        todoLists.insertAdjacentHTML("afterbegin", liTag);

        // Update local storage after adding a new task
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

  // 17. Check if the task is being unchecked
  if (!isCompleted) {
      showConfirmationDialog("Are you sure you want to update this task?", () => {
          handleTaskStatusUpdate(listItem, isCompleted);
      }, () => {
          // Restore the original state if the user cancels the confirmation
          checkbox.checked = !isCompleted;
      });
  } else {
      // If checking the task, directly update the status without confirmation
      handleTaskStatusUpdate(listItem, isCompleted);
  }
}

// 18. Helper function to handle task status update
function handleTaskStatusUpdate(listItem, isCompleted) {
    const span = listItem.querySelector('.task');
    const newText = span.textContent.trim();
  
    if (isCompleted) {
      if (newText.length > 0) {
        listItem.classList.add('completed');
        showNotification("Your task is completed", "success");
      } else {
        // If completed task becomes empty, delete the list item
        listItem.remove();
        showNotification("Task cannot be empty", "danger");
      }
    } else {
      if (newText.length > 0) {
        listItem.classList.remove('completed');
        showNotification(" Task status is Modified ", "success");
      } else {
        // If uncompleted task becomes empty, delete the list item
        listItem.remove();
        showNotification("Task cannot be empty", "danger");
      }
    }
  
    // Update local storage after updating task status
    updateLocalStorage();
  
    allTasks();
    filterTasks();
  }
  
  

// 19. Filter tasks based on the selected option
filterTodo.addEventListener("change", () => {
  allTasks();
  filterTasks();
});

// 20. Filter tasks based on the selected option
function filterTasks() {
  const selectedOption = localStorage.getItem("filterOption") || "all";
  const tasks = document.querySelectorAll(".list");

  let noTasksMessage = document.querySelector('.no-tasks-message');

  // 21. Check if the message element exists, if not, create it
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
    }
  });

  // 22. Show/hide the "no tasks" message based on tasksExist
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



  
// 23. Add click event listener
noteIcon.addEventListener('click', () => {
    const inputVal = inputField.value.trim();
  
    if (inputVal.length > 0) {
      if (!isDuplicateTask(inputVal)) {
        addTaskToList(inputVal, false);
        inputField.value = "";
        allTasks();
        filterTasks();
        showNotification(" Your Task is added ", "success");
  
        // Update local storage after adding a new task
        updateLocalStorage();
      } else {
        showNotification("Task already exists", "danger");
      }
    }
  });
  
  // Helper function to update local storage with the current tasks
  function updateLocalStorage() {
    const tasks = document.querySelectorAll(".list");
    const taskObjects = Array.from(tasks).reverse().map((task) => ({
      text: task.querySelector('.task').textContent,
      completed: task.classList.contains('completed')
    }));
    localStorage.setItem("tasks", JSON.stringify(taskObjects));
  }


