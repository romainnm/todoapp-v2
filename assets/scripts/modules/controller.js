import { Model } from "./model.js";
import { View } from "./view.js";

/* ~~~~~~~~~ Controller Module ~~~~~~~~~ */
export const Controller = ((model, view) => {
  const state = new model.State();

  const init = () => {
    model.getTodos().then((data) => {
      const pendingTasks = data.filter((task) => task.isCompleted !== true);
      const completedTasks = data.filter((task) => task.isCompleted === true);
      state.todolistPending = pendingTasks;
      state.todolistCompleted = completedTasks;
    });
  };
  const deleteTodo = () => {
    const todolist = document.querySelectorAll(view.domstr.tasklist);
    todolist.forEach((todo) => {
      todo.addEventListener("click", (event) => {
        const [className, id] = event.target.className.split(" ");
        if (className === "delete-task") {
          const [_, todoType] = todo.className.split(" ");
          if (todoType === "tasks-pending__container") {
            state.todolistPending = state.todolistPending.filter(
              (todo) => +todo.id !== +id
            );
          }
          if (todoType === "tasks-completed__container") {
            state.todolistCompleted = state.todolistCompleted.filter(
              (todo) => +todo.id !== +id
            );
          }
          model.deleteTodo(id);
        }
      });
    });
  };
  const addTodo = () => {
    const taskForm = document.getElementById(view.domstr.taskForm);
    taskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const inputbox = document.getElementById(view.domstr.inputbox);
      const newTask = new model.Todo(inputbox.value);
      state.todolistPending = [newTask, ...state.todolistPending];
      model.addTodo(newTask);
      event.target.value = "";
    });
  };

  const moveTodo = () => {
    const todolist = document.querySelectorAll(view.domstr.tasklist);
    todolist.forEach((todo) => {
      todo.addEventListener("click", (event) => {
        event.preventDefault();
        const [__, tasklist] = todo.className.split(" ");
        const [_, className, id] = event.target.className.split(" ");

        if (className === "move-right" || className === "move-left") {
          let currentList =
            tasklist === "tasks-pending__container"
              ? state.todolistPending
              : state.todolistCompleted;
          let opositeList =
            currentList === "tasks-pending__container"
              ? state.todolistCompleted
              : state.todolistPending;
          const findTask = currentList.find((task) => +task.id == +id);
          const updateTask = {
            ...findTask,
            isCompleted: !findTask.isCompleted,
          };
          currentList = currentList.filter((todo) => +todo.id !== +id);
          opositeList = [updateTask, ...opositeList];
          model.editTodo(id, updateTask);
        }
      });
    });
  };

  const editTodo = () => {
    const todolist = document.querySelectorAll(view.domstr.tasklist);
    let isEditing = false;

    function editing(input, text, event) {
      if (isEditing) {
        input.value = text.innerText;
        input.style.display = "block";
        text.style.display = "none";
      }
      if (!isEditing) {
        text.innerText = event.target.value;
        input.style.display = "none";
        text.style.display = "block";
      }
    }

    todolist.forEach((todo) => {
      todo.addEventListener("click", (event) => {
        const [className, id] = event.target.className.split(" ");
        const [__, tasklist] = todo.className.split(" ");
        isEditing = true

        let currentList =
          tasklist === "tasks-pending__container"
            ? state.todolistPending
            : state.todolistCompleted;

        if (className === "edit-task") {
          currentList.map((task) => {
            if (+task.id === +id) {
              const tasktext = document.querySelector(`.text${id}`);
              const taskinput = document.querySelector(`.input${id}`);
              editing(taskinput, tasktext);
              taskinput.addEventListener("keyup", (event) => {
                if (event.key === "Enter") {
                  const updateTask = { ...task, content: event.target.value };
                  currentList = [...currentList, updateTask];
                  editing(taskinput, tasktext, event);
                  model.editTodo(id, updateTask);
                  isEditing = false;
                }
              });
            }
          });  }
      });
    });
  };

  const bootstrap = () => {
    init();
    deleteTodo();
    addTodo();
    editTodo();
    moveTodo();
  };
  return { bootstrap };
})(Model, View);
