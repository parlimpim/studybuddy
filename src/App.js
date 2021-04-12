import React, { useEffect, useState, useMemo } from 'react'
import Amplify, { API, graphqlOperation, Auth, AWSPinpointProvider } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { AmplifySignOut,withAuthenticator } from '@aws-amplify/ui-react'
import Analytics from '@aws-amplify/analytics';

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])
  const [email, setEmail] = useState('')
  const [user,setUser] = useState()

  useEffect(() => {
    fetchTodos()
    test()
    //pinpoint()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  async function test() {
    try {
      await Auth.currentUserInfo().then((d) => {
        setUser(d)
        setEmail(d.attributes.email)
      })
    }
    catch (e) {
      console.log(e)
    }
  }
  
  async function pinpoint() {
    try {
      await Auth.currentUserCredentials().then((credentials) => {
        console.log(credentials)
        console.log(credentials.identityId)
        const pinpoint = {
          region: awsExports.aws_mobile_analytics_app_region,
          credentials
        }
        console.log(pinpoint)
        // Analytics.record({
        //   name: "testevent",
        //   attributes: { title: user.username }
        // })
        Analytics.updateEndpoint({
          address: email,
          channelType: 'EMAIL',
          optOut: 'NONE',
          userId: user.attributes.sub,
          userAttributes: {
            username: [user.username]
          }
        }).then((d) => {
          console.log(d)
        })
      })
    }
    catch (e) {
      console.log(e)
    }
  } 
  return (
    <div style={styles.container}>
      <h2>Amplify Todos</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <button style={styles.button} onClick={addTodo}>Create Todo</button>
      {
        todos.map((todo, index) => (
          <div key={todo.id ? todo.id : index} style={styles.todo}>
            <p style={styles.todoName}>{todo.name}</p>
            <p style={styles.todoDescription}>{todo.description}</p>
          </div>
        ))
      }
      {console.log(email)}
      {console.log(user)}
      <button onClick={test}>get userinfo</button>
      <button onClick={pinpoint}>test pinpoint</button>
      <AmplifySignOut />
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default withAuthenticator(App)