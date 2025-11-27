// Todo List Application

// DOM Elements
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const deleteAllBtn = document.getElementById('deleteAllBtn');

// Local Storage Key
const STORAGE_KEY = 'todoTasks';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setupEventListeners();
    updateDeleteAllButton();
});

// Setup Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    deleteAllBtn.addEventListener('click', deleteAllTasks);
}

// Add Task Function
function addTask() {
    // Validate input
    if (taskInput.value.trim() === '') {
        alert('please complete the data');
        taskInput.focus();
        return;
    }

    // Get input values
    const taskText = taskInput.value.trim();
    const taskDate = dateInput.value;

    // Validate date
    if (taskDate === '') {
        alert('Please select a date');
        dateInput.focus();
        return;
    }

    // Create task object
    const task = {
        id: Date.now(),
        text: taskText,
        date: taskDate,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    // Save to local storage
    saveTasks([task, ...getTasks()]);

    // Reset input fields
    taskInput.value = '';
    dateInput.value = '';
    taskInput.focus();

    // Reload tasks
    loadTasks();
    updateDeleteAllButton();
}

// Load Tasks from Local Storage
function loadTasks() {
    const tasks = getTasks();

    taskList.innerHTML = '';

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="no-task">No task found</div>';
        return;
    }

    tasks.forEach((task) => {
        const taskRow = createTaskRow(task);
        taskList.appendChild(taskRow);
    });
}

// Create Task Row Element
function createTaskRow(task) {
    const taskRow = document.createElement('div');
    taskRow.className = `task-row ${task.status === 'completed' ? 'completed' : ''}`;
    taskRow.setAttribute('data-id', task.id);

    // Format date
    const formattedDate = formatDate(task.date);

    taskRow.innerHTML = `
        <div class="task-text">${escapeHtml(task.text)}</div>
        <div class="task-date">${formattedDate}</div>
        <div class="task-status ${task.status}" data-id="${task.id}">
            ${task.status}
        </div>
        <div class="task-actions">
            <button class="btn-small btn-edit" data-id="${task.id}">Edit</button>
            <button class="btn-small btn-delete" data-id="${task.id}">Delete</button>
        </div>
    `;

    // Status toggle
    const statusBtn = taskRow.querySelector('.task-status');
    statusBtn.addEventListener('click', () => toggleTaskStatus(task.id));

    // Edit button
    const editBtn = taskRow.querySelector('.btn-edit');
    editBtn.addEventListener('click', () => editTask(task.id));

    // Delete button
    const deleteBtn = taskRow.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    return taskRow;
}

// Toggle Task Status
function toggleTaskStatus(taskId) {
    const tasks = getTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
        task.status = task.status === 'pending' ? 'completed' : 'pending';
        saveTasks(tasks);
        loadTasks();
    }
}

// Edit Task
function editTask(taskId) {
    const tasks = getTasks();
    const task = tasks.find((t) => t.id === taskId);

    if (task) {
        const newText = prompt('Edit task:', task.text);
        if (newText !== null && newText.trim() !== '') {
            task.text = newText.trim();
            
            const newDate = prompt('Edit date (YYYY-MM-DD):', task.date);
            if (newDate !== null && newDate.trim() !== '') {
                task.date = newDate.trim();
                saveTasks(tasks);
                loadTasks();
            }
        }
    }
}

// Delete Task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const tasks = getTasks().filter((t) => t.id !== taskId);
        saveTasks(tasks);
        loadTasks();
        updateDeleteAllButton();
    }
}

// Delete All Tasks
function deleteAllTasks() {
    if (getTasks().length === 0) {
        alert('No tasks to delete');
        return;
    }

    if (confirm('Are you sure you want to delete all tasks? This cannot be undone.')) {
        saveTasks([]);
        loadTasks();
        updateDeleteAllButton();
    }
}

// Update Delete All Button State
function updateDeleteAllButton() {
    deleteAllBtn.disabled = getTasks().length === 0;
}

// Get Tasks from Local Storage
function getTasks() {
    try {
        const tasks = localStorage.getItem(STORAGE_KEY);
        return tasks ? JSON.parse(tasks) : [];
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
}

// Save Tasks to Local Storage
function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Format Date Function
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', options);
}

// Escape HTML Function (Security)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
