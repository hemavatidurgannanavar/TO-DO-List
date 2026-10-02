// ==========================================
// GET HTML ELEMENTS
// ==========================================

const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");

const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const filterButtons = document.querySelectorAll(".filter");


// ==========================================
// LOAD TASKS FROM LOCAL STORAGE
// ==========================================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

let currentFilter = "all";


// ==========================================
// ADD TASK
// ==========================================

addBtn.addEventListener("click", addTask);


// Allow Enter key to add a task

taskInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {
        addTask();
    }

});


function addTask() {

    const taskText = taskInput.value.trim();

    // Check if task is empty

    if (taskText === "") {

        alert("Please enter a task!");

        return;
    }


    // Create a new task

    const task = {

        id: Date.now(),

        text: taskText,

        date: taskDate.value,

        time: taskTime.value,

        completed: false,

        reminded: false

    };


    // Add task to array

    tasks.push(task);


    // Save tasks

    saveTasks();


    // Clear input fields

    taskInput.value = "";

    taskDate.value = "";

    taskTime.value = "";


    // Display tasks

    displayTasks();

}


// ==========================================
// DISPLAY TASKS
// ==========================================

function displayTasks() {

    // Clear existing tasks

    taskList.innerHTML = "";


    // Select tasks according to filter

    let filteredTasks = tasks;


    if (currentFilter === "active") {

        filteredTasks = tasks.filter(function (task) {

            return !task.completed;

        });

    }


    if (currentFilter === "completed") {

        filteredTasks = tasks.filter(function (task) {

            return task.completed;

        });

    }


    // Show or hide empty message

    if (filteredTasks.length === 0) {

        emptyMessage.style.display = "block";

    } else {

        emptyMessage.style.display = "none";

    }


    // Create each task

    filteredTasks.forEach(function (task) {

        const li = document.createElement("li");

        li.className = "task";


        // Add completed class

        if (task.completed) {

            li.classList.add("completed");

        }


        // Create date/time text

        let dateTimeText = "";


        if (task.date && task.time) {

            dateTimeText =
                `📅 ${task.date}  ⏰ ${task.time}`;

        } else if (task.date) {

            dateTimeText =
                `📅 ${task.date}`;

        } else if (task.time) {

            dateTimeText =
                `⏰ ${task.time}`;

        }


        // Create task HTML

        li.innerHTML = `

            <div class="task-left">

                <input
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id})"
                >

                <div class="task-details">

                    <span class="task-text">
                        ${escapeHTML(task.text)}
                    </span>

                    ${
                        dateTimeText
                        ? `
                            <span class="task-date">
                                ${dateTimeText}
                            </span>
                          `
                        : ""
                    }

                </div>

            </div>


            <div class="task-actions">

                <button
                    class="edit-btn"
                    onclick="editTask(${task.id})"
                >
                    Edit
                </button>


                <button
                    class="delete-btn"
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>

            </div>

        `;


        taskList.appendChild(li);

    });

}


// ==========================================
// COMPLETE / UNCOMPLETE TASK
// ==========================================

function toggleTask(id) {

    tasks = tasks.map(function (task) {

        if (task.id === id) {

            task.completed = !task.completed;

        }

        return task;

    });


    saveTasks();

    displayTasks();

}


// ==========================================
// EDIT TASK
// ==========================================

function editTask(id) {

    const task = tasks.find(function (task) {

        return task.id === id;

    });


    if (!task) {

        return;

    }


    const newText = prompt(
        "Edit your task:",
        task.text
    );


    // Cancel button

    if (newText === null) {

        return;

    }


    // Empty task

    if (newText.trim() === "") {

        alert("Task cannot be empty!");

        return;

    }


    // Update task

    task.text = newText.trim();


    // Allow reminder again

    task.reminded = false;


    // Save changes

    saveTasks();

    displayTasks();

}


// ==========================================
// DELETE TASK
// ==========================================

function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );


    if (!confirmDelete) {

        return;

    }


    tasks = tasks.filter(function (task) {

        return task.id !== id;

    });


    saveTasks();

    displayTasks();

}


// ==========================================
// FILTER TASKS
// ==========================================

filterButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        // Remove active class from all buttons

        filterButtons.forEach(function (btn) {

            btn.classList.remove("active");

        });


        // Add active class to selected button

        this.classList.add("active");


        // Get selected filter

        currentFilter = this.dataset.filter;


        // Display filtered tasks

        displayTasks();

    });

});


// ==========================================
// SAVE TASKS
// ==========================================

function saveTasks() {

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ==========================================
// BROWSER NOTIFICATION PERMISSION
// ==========================================

function requestNotificationPermission() {

    // Check if browser supports notifications

    if (!("Notification" in window)) {

        console.log(
            "Browser notifications are not supported."
        );

        return;

    }


    // Ask user for permission

    if (Notification.permission === "default") {

        Notification.requestPermission();

    }

}


// Request permission

requestNotificationPermission();


// ==========================================
// CHECK REMINDERS
// ==========================================

// Check every 10 seconds

setInterval(checkReminders, 10000);


function checkReminders() {

    const now = new Date();


    tasks.forEach(function (task) {

        // Don't remind completed tasks

        if (task.completed) {

            return;

        }


        // Don't remind tasks without date/time

        if (!task.date || !task.time) {

            return;

        }


        // Don't show reminder twice

        if (task.reminded) {

            return;

        }


        // Create reminder date and time

        const reminderTime = new Date(
            `${task.date}T${task.time}`
        );


        // Check whether reminder time has arrived

        if (now >= reminderTime) {

            showNotification(task);


            // Mark reminder as shown

            task.reminded = true;


            // Save updated task

            saveTasks();

        }

    });

}


// ==========================================
// SHOW NOTIFICATION
// ==========================================

function showNotification(task) {

    const message =
        `🔔 Reminder: ${task.text}`;


    // If browser notifications are allowed

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            "To-Do List Reminder",
            {
                body: message
            }
        );

    } else {

        // Fallback

        alert(message);

    }

}


// ==========================================
// INITIAL DISPLAY
// ==========================================

displayTasks();
