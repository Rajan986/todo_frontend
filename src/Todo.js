import React, {useState, useEffect} from "react";
import axios from "axios";
import "./TodoApp.css";

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [filterCompleted, setFilterCompleted] = useState("all");
  const [newTodo, setNewTodo] = useState({name: "", short_description: ""});
  const [isEditing, setIsEditing] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchTodos();
  }, [filterCompleted]);

  const fetchTodos = async () => {
    try {
      let url = "http://localhost:8080/api/v1/todos";
      if (filterCompleted === "completed") {
        url += "?completed=true";
      } else if (filterCompleted === "not-completed") {
        url += "?completed=false";
      }
      const response = await axios.get(url);
      setTodos(response.data.todos);
    } catch (error) {
      setErrorMessage(error.response.data.error);
      alert(errorMessage);
    }
  };

  const handleFilterChange = (event) => {
    setFilterCompleted(event.target.value);
  };

  const handleInputChange = (event) => {
    setNewTodo({
      ...newTodo,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateOrUpdateTodo = async () => {
    try {
      if (isEditing && editingTodoId) {
        await axios.patch(
          `http://localhost:8080/api/v1/todos/${editingTodoId}`,
          newTodo
        );
      } else {
        await axios.post("http://localhost:8080/api/v1/todos", newTodo);
      }
      fetchTodos();
      setNewTodo({name: "", short_description: ""});
      setIsEditing(false);
      setEditingTodoId(null);
    } catch (error) {
      setErrorMessage(error.response.data.error);
      alert(errorMessage);
    }
  };

  const handleEditTodo = (todo) => {
    setNewTodo({
      name: todo.name,
      short_description: todo.short_description,
    });
    setIsEditing(true);
    setEditingTodoId(todo._id);
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/todos/${id}`);
      fetchTodos();
    } catch (error) {
      setErrorMessage(error.response.data.error);
      alert(errorMessage);
    }
  };

  const handleUpdateTodo = async (id, updatedTodo) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/v1/todos/${id}`,
        updatedTodo
      );
      fetchTodos();
    } catch (error) {
      setErrorMessage(error.response.data.error);
      alert(errorMessage);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleCreateOrUpdateTodo();
    }
  };

  return (
    <div className="container">
      <h1>Todo App</h1>
      <div className="todo-form">
        <input
          type="text"
          placeholder="Todo Name"
          name="name"
          value={newTodo.name}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <input
          type="text"
          placeholder="Short Description"
          name="short_description"
          value={newTodo.short_description}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleCreateOrUpdateTodo}>
          {isEditing ? "Update Todo" : "Add Todo"}
        </button>
      </div>
      <div>
        <label>
          Filter:
          <select value={filterCompleted} onChange={handleFilterChange}>
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="not-completed">Not Completed</option>
          </select>
        </label>
      </div>
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo._id} className="todo-item">
            {todo.name} - {todo.short_description}
            <button onClick={() => handleDeleteTodo(todo._id)}>Delete</button>
            <button onClick={() => handleEditTodo(todo)}>Edit</button>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(event) =>
                handleUpdateTodo(todo._id, {completed: event.target.checked})
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoApp;
