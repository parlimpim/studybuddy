import React, { useEffect, useState } from "react";
import Amplify, { API, graphqlOperation, Auth } from "aws-amplify";
import {
  createTodo,
  createUser,
  deleteUser,
  updateUser,
} from "./graphql/mutations";
import * as mutations from "./graphql/mutations";
import { listTodos, listUsers } from "./graphql/queries";
import { AmplifySignOut, withAuthenticator } from "@aws-amplify/ui-react";
import "./App.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import awsExports from "./aws-exports";
import { event } from "jquery";
Amplify.configure(awsExports);

const initialState = {
  uid: "",
  email: "",
  task: "",
  due_date: "",
  description: "",
  type: "Task",
  // disable: true,
};

const App = () => {
  const [formState, setFormState] = useState(initialState);
  const [current, setCurrent] = useState({ uid: "" });
  const [todos, setTodos] = useState([]);
  const [currentTab, setCurrentTab] = useState("Task");
  const [show, setShow] = useState(false);
  const [forPopup, setForPopup] = useState(initialState);
  // const [totalTask, settotalTask] = useState(0);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    getUsername();
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listUsers));
      const todos = todoData.data.listUsers.items;
      setTodos(todos);
      console.log("FetchTodo", todos);
    } catch (err) {
      console.log("error fetching todos");
    }
  }

  async function addTask() {
    try {
      if (!formState.task || !formState.description || !formState.due_date)
        return;
      const todo = { ...formState };
      // setTodos([...todos, todo]);
      setFormState({ ...formState, task: "", description: "", due_date: "" });
      await API.graphql(graphqlOperation(createUser, { input: todo }));
      // alert("Success!");
      await fetchTodos();
      alert("Success!");
      console.log("ADDtodo", todos);
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  async function deleteTask(cid) {
    try {
      const detail = { id: cid };
      await API.graphql(graphqlOperation(deleteUser, { input: detail }));
      await fetchTodos();
      alert("Success!");
      console.log(detail);
    } catch (err) {
      console.log("error deleting todo:", err);
    }
  }

  async function editTask() {
    console.log("EditFunction", forPopup);
    try {
      const temp = {
        id: forPopup.id,
        uid: forPopup.uid,
        email: forPopup.email,
        task: forPopup.task,
        description: forPopup.description,
        due_date: forPopup.due_date,
        type: forPopup.type,
      };
      await API.graphql({
        query: mutations.updateUser,
        variables: { input: temp },
      });
      await fetchTodos();
      alert("Success!");
    } catch (err) {
      console.log("error editing todo:", err);
    }
  }

  async function addClip() {
    try {
      if (!formState.task || !formState.description || !formState.due_date)
        return;
      const todo = { ...formState, type: "Clip" };
      // setTodos([...todos, todo]);
      setFormState({ ...formState, task: "", description: "", due_date: "" });
      await API.graphql(graphqlOperation(createUser, { input: todo }));
      await fetchTodos();
      alert("Success!");
      console.log("ADDtodo", todos);
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  async function addExam() {
    try {
      if (!formState.task || !formState.description || !formState.due_date)
        return;
      const todo = { ...formState, type: "Exam" };
      // setTodos([...todos, todo]);
      setFormState({ ...formState, task: "", description: "", due_date: "" });
      await API.graphql(graphqlOperation(createUser, { input: todo }));
      await fetchTodos();
      alert("Success!");
      console.log("ADDtodo", todos);
    } catch (err) {
      console.log("error creating todo:", err);
    }
  }

  async function getUsername() {
    try {
      await Auth.currentUserInfo().then((d) => {
        console.log(d.username);
        console.log(d.attributes.email);
        setFormState({
          ...formState,
          uid: d.username,
          email: d.attributes.email,
        });
        setCurrent({ uid: d.username });
      });
    } catch (e) {
      console.log(e);
    }
  }

  const display = () => {
    switch (currentTab) {
      case "Task":
        return (
          <div style={styles.mgt}>
            <input
              onChange={(event) => setInput("task", event.target.value)}
              style={styles.input}
              value={formState.task}
              placeholder="Task"
            />
            <input
              type="text"
              onFocus={(event) => (event.currentTarget.type = "date")}
              onBlur={(event) => (event.currentTarget.type = "text")}
              onChange={(event) => setInput("due_date", event.target.value)}
              style={styles.input}
              value={formState.due_date}
              placeholder="Due-Date"
            />
            <input
              onChange={(event) => setInput("description", event.target.value)}
              style={styles.input}
              value={formState.description}
              placeholder="Description"
            />
            <button style={styles.button} onClick={addTask}>
              Create Todo
            </button>
            {todos.map((todo, index) =>
              todo.uid == current.uid && todo.type == "Task" ? (
                <div
                  key={todo.id ? todo.id : index}
                  style={styles.todo}
                  className="d-flex p-4 justify-content-between"
                >
                  <p style={styles.todoName} className = "">{todo.task}</p>
                  <div>
                    <div className="d-flex flex-row">
                      <p style={styles.todoDescription} className="font-bold">
                        Due Date :
                      </p>
                      <p style={styles.todoDescription} className = "pl-1">{todo.due_date}</p>
                    </div>
                    <div className="d-flex flex-row">
                      <p style={styles.todoDescription} className="font-bold">
                        Description :
                      </p>
                      <p style={styles.todoDescription} className = "pl-1">{todo.description}</p>
                    </div>
                  </div>

                  {console.log(todo.id)}
                  <div className="d-flex flex-row ">
                  <div className = "pr-1">
                  <button
                    class="btn btn-success margin-2 fixed-size"
                    onClick={() => {
                      setForPopup(todo);
                      handleShow();
                      console.log(forPopup);
                    }}
                  >
                    Edit
                  </button>
                  </div>
                  <button
                    class="btn btn-danger fixed-size"
                    onClick={() => {
                      deleteTask(todo.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
                </div>
              ) : (
                <></>
              )
            )}{" "}
          </div>
        );

      case "Clip":
        return (
          <div style={styles.mgt}>
            {" "}
            <input
              onChange={(event) => setInput("task", event.target.value)}
              style={styles.input}
              value={formState.task}
              placeholder="Clip"
            />
            <input
              type="text"
              onFocus={(event) => (event.currentTarget.type = "date")}
              onBlur={(event) => (event.currentTarget.type = "text")}
              onChange={(event) => setInput("due_date", event.target.value)}
              style={styles.input}
              value={formState.due_date}
              placeholder="Due-Date"
            />
            <input
              onChange={(event) => setInput("description", event.target.value)}
              style={styles.input}
              value={formState.description}
              placeholder="link"
            />
            <button style={styles.button} onClick={addClip}>
              Create Todo
            </button>
            {todos.map((todo, index) =>
              todo.uid == current.uid && todo.type == "Clip" ? (
                <div key={todo.id ? todo.id : index} style={styles.todo}>
                  <p style={styles.todoName}>{todo.task}</p>
                  <p style={styles.todoDescription}>{todo.due_date}</p>
                  <p style={styles.todoDescription}>{todo.description}</p>
                  <button
                    class="btn btn-success margin-2"
                    onClick={() => {
                      setForPopup(todo);
                      handleShow();
                      console.log(forPopup);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    class="btn btn-danger"
                    onClick={() => {
                      deleteTask(todo.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <></>
              )
            )}
          </div>
        );

      case "Exam":
        return (
          <div style={styles.mgt}>
            {" "}
            <input
              onChange={(event) => setInput("task", event.target.value)}
              style={styles.input}
              value={formState.task}
              placeholder="Exam"
            />
            <input
              type="text"
              onFocus={(event) => (event.currentTarget.type = "date")}
              onBlur={(event) => (event.currentTarget.type = "text")}
              onChange={(event) => setInput("due_date", event.target.value)}
              style={styles.input}
              value={formState.due_date}
              placeholder="Exam-Date"
            />
            <input
              onChange={(event) => setInput("description", event.target.value)}
              style={styles.input}
              value={formState.description}
              placeholder="Description"
            />
            <button style={styles.button} onClick={addExam}>
              Create Todo
            </button>
            {todos.map((todo, index) =>
              todo.uid == current.uid && todo.type == "Exam" ? (
                <div key={todo.id ? todo.id : index} style={styles.todo}>
                  <p style={styles.todoName}>{todo.task}</p>
                  <p style={styles.todoDescription}>{todo.due_date}</p>
                  <p style={styles.todoDescription}>{todo.description}</p>
                  <button
                    class="btn btn-success margin-2"
                    onClick={() => {
                      setForPopup(todo);
                      handleShow();
                      console.log(forPopup);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    class="btn btn-danger"
                    onClick={() => {
                      deleteTask(todo.id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              ) : (
                <></>
              )
            )}
          </div>
        );
    }
  };

  const popup = () => {
    return (
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title> Edit detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            onChange={(event) =>
              setForPopup({ ...forPopup, task: event.target.value })
            }
            value={forPopup.task}
            style={styles.input}
          />
          <input
            type="text"
            onFocus={(event) => (event.currentTarget.type = "date")}
            onBlur={(event) => (event.currentTarget.type = "text")}
            onChange={(event) =>
              setForPopup({ ...forPopup, due_date: event.target.value })
            }
            value={forPopup.due_date}
            style={styles.input}
          />
          <input
            onChange={(event) =>
              setForPopup({ ...forPopup, description: event.target.value })
            }
            value={forPopup.description}
            style={styles.input}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              editTask();
              handleClose();
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <div style={styles.container}>
      <h2>Welcome {current.uid} !</h2>
      <ul className="nav nav-pills nav-fill">
        <li className="nav-item">
          <a
            className={`nav-link ${
              currentTab == "Task" ? "active font-login" : "font-login"
            }`}
            onClick={(e) => {
              setCurrentTab("Task");
              setFormState({
                ...formState,
                task: "",
                description: "",
                due_date: "",
                type: "Task",
              });
              console.log(formState);
            }}
          >
            Task
          </a>
        </li>
        <li className="nav-item">
          <a
            className={`nav-link ${
              currentTab == "Clip" ? "active font-login" : "font-login"
            }`}
            onClick={(e) => {
              setCurrentTab("Clip");
              setFormState({
                ...formState,
                task: "",
                description: "",
                due_date: "",
                type: "Clip",
              });
              console.log(formState);
            }}
          >
            Clip
          </a>
        </li>
        <li className="nav-item ">
          <a
            className={`nav-link ${
              currentTab == "Exam" ? "active font-login" : "font-login"
            }`}
            onClick={(e) => {
              setCurrentTab("Exam");
              setFormState({
                ...formState,
                task: "",
                description: "",
                due_date: "",
                type: "Exam",
              });
              console.log(formState);
            }}
          >
            Exam
          </a>
        </li>
      </ul>
      {/* <button onClick={getUsername}>pim</button> */}
      <div className="pane-area-container "> {display()} </div>
      <div> {popup()} </div>
      <AmplifySignOut />
    </div>
  );
};

const styles = {
  container: {
    width: 600,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: 20,
  },
  todo: { border: "solid", marginTop: 5, marginBottom: 5 },
  input: {
    border: "none",
    backgroundColor: "#ddd",
    marginBottom: 5,
    padding: 8,
    fontSize: 18,
    width: 560,
    // color: "transparent"
  },
  todoName: { fontSize: 20, fontWeight: "bold" },
  todoDescription: { marginBottom: 0 },
  button: {
    backgroundColor: "black",
    color: "white",
    outline: "none",
    fontSize: 18,
    padding: "12px 0px",
    width: 560,
  },
  list_item: {
    border: "solid",
  },
  font_color: {
    color: "black",
  },
  mgt: {
    marginTop: 10,
  },
};

export default withAuthenticator(App);
