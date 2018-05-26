function getTodos(options) {
    $.ajax({
        type: 'GET',
        url: '/todos',
        data: options,
        dataType: 'json',
        success: function(data) {
            loadTodoTable(data, options);
        }
    });
}

function updateTodo(todo) {
    $.ajax({
        type: 'PUT',
        url: '/todos/' + todo.id,
        data: JSON.stringify(todo),
        contentType: 'application/json',
        dataType: 'json',
        success: function() {
            getTodos({completed: todo.completed})
        }
    });
}

function addNewTodo() {
    let todo = {
        description: document.getElementById("form-description").value,
        dueDate: document.getElementById("form-duedate").value
    };

    // Validation
    if (!todo.description ) {
        console.log("Invalid description");
        return;
    }
    if (!todo.dueDate || new Date(todo.dueDate) < new Date()){
        console.log("Invalid date");
        return;
    }
    $.ajax({
        type: 'POST',
        url: '/todos',
        contentType: 'application/json',
        data: JSON.stringify(todo),
        success: function(data) {
            hideAddNewTodoModal();
            getTodos({completed: false});
        }
    });
}

function deleteTodo(id, view) {
    $.ajax({
        type: 'DELETE',
        url: '/todos/' + id,
        success: function() {
            getTodos({completed: view})
        }
    });
}

function getStarted() {
    document.getElementById("main").innerHTML +=
        `<div id="buttons">
            <div id="switch-todos">
            </div>
            <div id="new-todo">
                <button onclick='showAddNewTodoModal()' class="btn btn">New Todo item</button>
            </div>
        </div>`;
    getTodos({completed: false});
}

function showAddNewTodoModal() {
    document.getElementById("form-description").value = "";
    document.getElementById("form-duedate").valueAsDate = new Date((new Date()).getTime() + 7*24*60*60*1000);
    document.getElementById("new-todo-modal").style.display = "block";
}

function hideAddNewTodoModal() {
    document.getElementById("new-todo-modal").style.display = "none";
}

function loadTodoTable(data, options) {
    mainContainer = document.getElementById("todo-container");
    if (data.length < 1) {
        mainContainer.innerHTML =
            `<div class="no-items">
                There are no Todo items of this type yet.
            </div>`;
    } else {
        mainContainer.innerHTML =
            `<table id="todo-table" class="table">
                <tr>
                    <th>Description</th>
                    <th>Due date</th>
                    <th></th>
                </tr>
            </table>`;
    }

    for (todo of data) {
        if (options.completed && todo.completed || !options.completed && !todo.completed)
            addTodoToTable(todo);
    }

    if (options.completed) {
        document.getElementById("switch-todos").innerHTML =
            `<button onclick='let opt = { completed: false }; getTodos(opt);' class="btn btn">Show active todos</button>`;
    } else {
        document.getElementById("switch-todos").innerHTML =
            `<button onclick='let opt = { completed: true }; getTodos(opt);' class="btn btn">Show completed todos</button>`;
    }
}


function markTodoAsComplete(id) {
    updateTodo({id: id, completed: true});
}

function addTodoToTable(todo) {
    let table = document.getElementById("todo-table");
    let dueDate = todo.dueDate.split("T")[0];
    let daysLeft = Math.floor((new Date(dueDate).getTime() - new Date().getTime()) / (24*60*60*1000));
    dueDate = dueDate.split("-");
    let formattedDate = dueDate[1] + "-" + dueDate[2] + "-" + dueDate[0];
    let newRow = table.insertRow();
    newRow.insertCell().appendChild(document.createTextNode(todo.description));
    newRow.insertCell().innerHTML = `${formattedDate} <span class="date-alert">(in ${daysLeft} days)</span>`
    if (!todo.completed) {
        newRow.insertCell().innerHTML = `
            <button onclick="markTodoAsComplete(${todo.id});" class="btn btn-success">
                <i class="fas fa-check-circle"></i>
            </button> 
            <button onclick="deleteTodo(${todo.id}, ${todo.completed});" class="btn btn-danger">
                <i class="fas fa-times-circle"></i>
            </button>`;
    } else {
        newRow.insertCell().innerHTML = `
            <button onclick="deleteTodo(${todo.id}, ${todo.completed});" class="btn btn-danger">
                <i class="fas fa-times-circle"></i>
            </button>`;
    }
}
