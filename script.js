document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const newListBtn = document.getElementById('newListBtn');
    const listSelector = document.getElementById('listSelector');
    const todoInput = document.getElementById('todoInput');
    const addTodoBtn = document.getElementById('addTodoBtn');
    const todoList = document.getElementById('todoList');
    const listTitle = document.getElementById('listTitle'); // Get the title element

    let lists = {}; // Store lists as objects
    let currentList = "default"; // Default list name

    // Toggle Sidebar Function
    hamburgerMenu.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Function to create a new list
    function createNewList() {
        const listName = prompt("Enter a name for the new list:");
        if (listName) {
            if (lists[listName]) {
                alert("List name already exists!");
                return;
            }
            lists[listName] = []; // Initialize new list
            addListToSelector(listName);
            switchList(listName);
        }
    }

    // Function to add a list to the list selector
    function addListToSelector(listName) {
        const li = document.createElement('li');
        li.dataset.listName = listName; // Store the list name as a data attribute
        li.innerHTML = `
            <span class="list-name">${listName}</span>
            <button class="delete-list-btn"><i class="fas fa-trash-alt"></i></button>
            <input type="text" class="edit-list-name" value="${listName}" style="display:none;">
        `;

        const listNameSpan = li.querySelector('.list-name');
        const editListNameInput = li.querySelector('.edit-list-name');
        const deleteListBtn = li.querySelector('.delete-list-btn');

        listNameSpan.addEventListener('dblclick', () => {
            listNameSpan.style.display = 'none';
            editListNameInput.style.display = 'inline-block';
            editListNameInput.focus();
        });

        editListNameInput.addEventListener('blur', () => {
            const newListName = editListNameInput.value.trim();
            if (newListName && newListName !== listName) {
                if (lists[newListName]) {
                    alert("List name already exists!");
                    // Revert to original name
                    editListNameInput.value = listName;
                    listNameSpan.textContent = listName;
                } else {
                    // Update the list in the lists object
                    lists[newListName] = lists[listName];
                    delete lists[listName];

                    // Update currentList if necessary
                    if (currentList === listName) {
                        currentList = newListName;
                    }

                    // Update the UI
                    listNameSpan.textContent = newListName;
                    listTitle.textContent = newListName;
                    li.dataset.listName = newListName;
                    switchList(newListName);
                }
            }
            listNameSpan.style.display = 'inline-block';
            editListNameInput.style.display = 'none';
        });

        li.addEventListener('click', (event) => {
            switchList(li.dataset.listName);
        });

        deleteListBtn.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent list switching
            const listToDelete = li.dataset.listName;
            if (confirm(`Are you sure you want to delete the list "${listToDelete}"? This action cannot be undone.`)) {
                deleteList(listToDelete);
            }
        });

        listSelector.appendChild(li);
    }

    // Function to switch the current list
    function switchList(listName) {
        currentList = listName;
        updateTodoList();
        updateActiveList(); // call to update active list
        listTitle.textContent = listName; // Update the list title
    }

    function updateActiveList() {
        document.querySelectorAll('#listSelector li').forEach(item => {
            item.classList.remove('active');
        });
        const selectedList = Array.from(listSelector.children).find(item => item.dataset.listName === currentList);
        if (selectedList) {
            selectedList.classList.add('active');
        }
    }

    // Function to add a todo to the current list
    function addTodo() {
        const todoText = todoInput.value.trim();
        if (todoText !== "") {
            const todo = {
                text: todoText,
                details: "",
                editingDetails: false
            };
            if (!lists[currentList]) {
                lists[currentList] = []; // Initialize the current list if it doesn't exist
            }
            lists[currentList].push(todo);
            updateTodoList();
            todoInput.value = "";
        }
    }

    // Function to update the todo list display
    function updateTodoList() {
        todoList.innerHTML = ""; // Clear existing todos
        if (lists[currentList]) {
            lists[currentList].forEach((todo, index) => {
                const li = document.createElement('li');
                li.dataset.index = index;  // Store the index
                li.innerHTML = `
                    <span>${todo.text}</span>
                    <div class="todo-buttons">
                        <button class="details-btn">${todo.editingDetails ? 'Save Details' : (todo.details ? 'Edit Details' : 'Add Details')}</button>
                        <button class="move-up-btn">Move Up</button>
                        <button class="move-down-btn">Move Down</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                    ${todo.editingDetails ? `<div class="details"><textarea>${todo.details}</textarea></div>` : (todo.details ? `<div class="details-display">${todo.details}</div>` : '')}
                `;

                // Event listeners for buttons
                const detailsBtn = li.querySelector('.details-btn');
                detailsBtn.addEventListener('click', () => toggleDetails(index));
                const moveUpBtn = li.querySelector('.move-up-btn');
                moveUpBtn.addEventListener('click', () => moveTodoUp(index));
                const moveDownBtn = li.querySelector('.move-down-btn');
                moveDownBtn.addEventListener('click', () => moveTodoDown(index));
                const deleteBtn = li.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => deleteTodo(index));

                todoList.appendChild(li);

                // Add event listener for textarea blur to save automatically
                if (todo.editingDetails) {
                    const textarea = li.querySelector('.details textarea');
                    textarea.addEventListener('blur', () => saveDetails(index, textarea.value));
                }
            });
        }
    }

    function toggleDetails(index) {
        if (!lists[currentList][index]) return; // Check if the todo exists

        lists[currentList][index].editingDetails = !lists[currentList][index].editingDetails;
        updateTodoList();
    }

    function saveDetails(index, details) {
         if (!lists[currentList][index]) return; // Check if the todo exists

        lists[currentList][index].details = details;
        lists[currentList][index].editingDetails = false; // Switch to display mode
        updateTodoList();
    }

    function moveTodoUp(index) {
        if (index > 0 && lists[currentList]) {
            const temp = lists[currentList][index];
            lists[currentList][index] = lists[currentList][index - 1];
            lists[currentList][index - 1] = temp;
            updateTodoList();
        }
    }

    function moveTodoDown(index) {
        if (index < lists[currentList].length - 1 && lists[currentList]) {
            const temp = lists[currentList][index];
            lists[currentList][index] = lists[currentList][index + 1];
            lists[currentList][index + 1] = temp;
            updateTodoList();
        }
    }

    function deleteList(listToDelete) {
        if (lists[listToDelete]) {
            delete lists[listToDelete];
            if (currentList === listToDelete) {
                currentList = "default"; // Switch to default if deleting the current list
            }

            // Remove from list selector
            const liToDelete = document.querySelector(`#listSelector li[data-list-name="${listToDelete}"]`);
            if (liToDelete) {
                listSelector.removeChild(liToDelete);
            }
            updateTodoList();
            updateActiveList();
            listTitle.textContent = currentList;
        }
    }

    // Function to delete a todo from the current list
    function deleteTodo(index) {
        if (lists[currentList]) {
             lists[currentList].splice(index, 1);
             updateTodoList();
        }
    }

    // Event Listeners
    newListBtn.addEventListener('click', createNewList);
    addTodoBtn.addEventListener('click', addTodo);

    // Initialize default list
    lists["default"] = [];
    addListToSelector("default");
    switchList("default"); // Set "default" as the initial active list
});