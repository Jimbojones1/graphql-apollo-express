# graphql-apollo-express

**Clone this repo, and npm install in both the server and client folders**


### Why a Graphql-Client 

-  It will allow us to simplify our requests by formatting them for us, and allow us to write more declartivly
-  It Creates a cache on the client which will help ensure the client is properly synced with all the requests
-  Provides easy ways to update the cache, perform pagination, and subscriptions (real time)

- This is a great in depth article of each of those points above [Why Do I need A graphql-Client](https://blog.apollographql.com/why-you-might-want-a-graphql-client-e864050f789c)



### What is Apollo 

- per the docs 

*Apollo Client is a fully-featured caching GraphQL client with integrations for React, Angular, and more. It allows you to easily build UI components that fetch data via GraphQL. To get the most value out of apollo-client, you should use it with one of its view layer integrations.*

- Check it out on github - [Apollo Client](https://github.com/apollographql/apollo-client)

### Setting up Apollo on the Server

**NPM MODULES**

```
 apollo-server-express
 graphql
```

- Refactoring a bit from yesterday we can now get everything we need from `apollo-server-express`

**Settin Up the Schema & and Graphql Server**

```data/schema.js

import { resolvers } from './resolvers';
import { ApolloServer } from 'apollo-server-express';
const typeDefs = `

  same typeDefs as yesterday... 
`;

const GraphqlServer = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  playground: {
    endpoint: `http://localhost:4000/graphql`,
    setting: {
      'editor.theme': 'light'
    }
  }
});

export default GraphqlServer;

```


### Setting up the React-Client





- As you can see here we can just instatiate an instance of `ApolloServer` and pass it some options. Make sure your endpoint is on the same port as your Express Server!

```index.js
import express     from 'express';
import GraphqlServer from './data/schema';
import cors from 'cors';

const app = express();

require('./db')

app.get('/', (req, res) => {
  res.send('app is working')
});

app.use('*', cors({ origin: 'http://localhost:3000'}));

GraphqlServer.applyMiddleware({
  app: app
});

app.listen(4000, () => {
  console.log('server is running on port 4000')
  console.log('graphql server is running on localhost:4000/graphql, check schema file')
});

```

- As you can see here we are just importing that server and usings its `applyMiddleWare` method and adding it to whatever server we want, in our case our `app` variable.  



### Setting Up the React Client

**NPM MODULES**

```
apollo-boost 
react-apollo 
graphql 
graphql-tag
```

1.  apollo-boost: Package containing everything you need to set up Apollo Client
2.  react-apollo: View layer integration for React
3.  graphql: Also parses your GraphQL queries
4.  graphql-tage: (gql) A JavaScript template literal tag that parses GraphQL query strings into the standard GraphQL AST.

### Connecting to the express server


```index.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import * as serviceWorker from './serviceWorker';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  onError: ({ networkError, graphQLErrors }) => {
    console.log('graphQLErrors', graphQLErrors)
    console.log('networkError', networkError)
  }
});
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root'));
```

-  Here we are using initializeing `ApolloClient` in order to connect to our express server, notice the `uri` matches the endpoint of our `GrapqlServer` that we applied as our middleware above.  We also set up error messaging will show up in the `chrome` console if we have any errors on any request or connections to our server. 

- Then much like `BrowserRouter` or the react `Context` API we wrap our entire app in the `ApolloProvider` component which will allow any part of our app to make queries to the `client` that we passed to the provider. 


### Our First Query 

- Lets first fetch all the dogs

```dogs/index.js

import React from 'react';
import { graphql } from 'react-apollo';
import gql from "graphql-tag";


const Dogs = ({data}) => {

  if(data.loading){
    return <p>Loading...</p>
  }

  if(data.error){
    return <p>{data.error.message}</p>
  }

  const dogList = data.getDogs.map((dog) => {
    return <li key={dog.id}>
              {dog.firstName}
              {dog.lastName}
          </li>
  })

  return (
    <ul>
      {dogList}
    </ul>
    )
}

export const dogsListQuery = gql`
  query {
    getDogs {
      id
      firstName
      lastName
    }
  }
`

export default graphql(dogsListQuery)(Dogs);

```

- So first lets take a look at the last line were much like redux we are using a [curried](https://hackernoon.com/currying-in-js-d9ddc64f162e) function graphql that takes in the name of our Componet `Dogs`, and the query (`dogsListQuery`) 

- What this is doing is making the query to the graphql server, and passing the results as props to the `Dogs` component.  All the information you need from graphql is attached to the `data` property of `props`.  We are using destructering here. 

-  We then set up a loading, error, and then final our list of component.  The loading and error is past automatically by graphql to the component, as well as the information you asked for inside a property named after the query, so you'll see our array is called `data.getDogs`. Also we are exporting our query incase we want to use it in another component, for furthering reading on export vs export default read this [export all day everyday](https://medium.com/@etherealm/named-export-vs-default-export-in-es6-affb483a0910)

**Pretty Pretty Prettayyyyyy Cool huh?**


### Mutation CreateDog Query

```addDog/index.js
import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from "graphql-tag";

import { dogsListQuery } from '../Dogs';

class AddDog extends Component {
  state = {
    firstName: '',
    lastName: ''
  }
  handleSave = (e) => {
    e.preventDefault();
    const { firstName, lastName } = this.state;
    this.props.mutate({
      variables: {input: {firstName, lastName}},
       update: (store, { data: { createDog } }) => {
            // Read the data from our cache for this query.
            const data = store.readQuery({ query: dogsListQuery });
            // Add our comment from the mutation to the end.
            data.getDogs.push(createDog);
            // // Write our data back to the cache.
            store.writeQuery({ query: dogsListQuery, data });
          },
    })
  }
  handleInput = (e) => {
    this.setState({[e.currentTarget.name]: e.currentTarget.value});
  }
  render(){
    return (
      <form onSubmit={this.handleSave}>
        <input value={this.state.firstName} placeholder="first name" name='firstName' onChange={this.handleInput}/>
        <input value={this.state.lastName} placeholder="last name" name='lastName' onChange={this.handleInput}/>
        <button type="Submit">Add Dog</button>
      </form>
      )
  }

}

// First line makes sure right value is passed
export const createDog = gql`
  mutation createDog($input: DogInput){
    createDog(input: $input){
      id
      firstName
      lastName
    }
  }
`

const AddDogWithMutation = graphql(createDog)(AddDog);

export default AddDogWithMutation;

```

- Just like above you are using the `graphql` function and passing it the component and the respective mutation. 

- In the query, we are coming across our first example of passing variables to our query.  In the line where we declare our request to graphql `mutation`  we create a variable `$input:DogInput`,  the variable is always denoted with the dollar sign.  Then we are saying the input must look like the `DogInput` that is defined in our server schema 

- our mutation query get passed as the `mutate` function in `this.props`. Here you will see that we are using that method inside of our handleSave method in order to make the mutation.  Mutate takes an options object in which we define the `variables` as one of the properties.  Notice how the variable is an object with the property of `input` just like our query definition.  Also note 
```
  variables: {input: {firstName, lastName}},
```

is shorthand for, 

```
  variables: {input: {firstName: firstName, lastName: lastName}},
```

- We then add the `update` hook property which takes the `store` which is much like the redux store which is a global state which caches the results of all our graphql requests! (AUTOMATIC CACHING, YAYYAY, this means no extra fetch requests) and it takes the response from the query.  So the first thing we are doing is using the store and reading from the last query we made from the `dogsListQuery` which we are importing from our `Dog` component.  Then remember the result of that is what are query is called `getDogs` which will be attached to the `data` object what is passed back from the query, then we simply add the result from the server `createDog` to the end of that array.  We then write that back to cache to keep it in sync with the server. The write query takes two properties, `query` the type of query we want to write too, and `data` which is the data we want to be there, this is written shorthand just as it is above.  Pretty Cool aye!


**Delete a Dog, the *Compose function* !**

```Dogs/index.js
import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

const Dogs = ({data, mutate}) => {
 
  const deleteDog = (id, e) => {
   
    mutate({
       variables: {id: parseInt(id)},
       update: (store, { data: { deleteDog }, error}) => {
            console.log(error, ' this is erroe')
            // Read the data from our cache for this query.
            const data = store.readQuery({ query: dogsListQuery });
            // remove the dog from the cached list and create a new list
            const newDogs = data.getDogs.filter((dog) => dog.id != id);
            
            // // // Write our data back to the cache.
            store.writeQuery({ query: dogsListQuery, data: {getDogs: newDogs}});
          },
    })
  }


  if(data.loading){
    return <p>Loading...</p>
  }

  if(data.error){
    return <p>{data.error.message}</p>
  }

  const dogList = data.getDogs.map((dog) => {
    return <li key={dog.id}>
              {dog.firstName}
              {dog.lastName}
              <button onClick={deleteDog.bind(null, dog.id)}>Delete</button>
          </li>
  })

  return (
    <ul>
      {dogList}
    </ul>
    )
}

export const dogsListQuery = gql`
  query {
    getDogs {
      id
      firstName
      lastName
    }
  }
`
export const deleteDogMutation = gql`
  mutation deleteDog($id: ID!)
  {
    deleteDog(id: $id)
  }
`



export default compose(
  graphql(dogsListQuery),
  graphql(deleteDogMutation),
  )(Dogs);

```

- Okay here at the bottom we are using a new function `compose`!  This just like from redux is a [Higher Order Function](https://medium.com/javascript-scene/higher-order-functions-composing-software-5365cf2cbe99) that allows us to hook both our mutation and our query to our component.  Just as before our `mutation` is passed as `this.props.mutate`.


- Here, we can also just define a function inside our presentational componet, (this is actually fine to do). Here we pretty much do the same as the create method we just did. One thing to take notice is in 

```
store.writeQuery({ query: dogsListQuery, data: {getDogs: newDogs}});
```

we are passing an object that has a property that is from our `dogsListQuery` that is in the data property from the query and we are defining its new value `newDogs`.  This is same thing as we did above, but we just used the shorthand 

```
 store.writeQuery({ query: dogsListQuery, data });

```


### Where to go from here 

- What I showed you is a slightly older way, but I think its relavent since it is what is happening under the hood and looks like redux, But graphql now has new components to write mutations and queries which you can read about in the [Apollo What's new](https://www.apollographql.com/docs/react/essentials/mutations.html)

-  Here is a good comparison of [relay vs Apollo](https://maxrozen.com/2018/08/04/apollo-vs-relay-picking-a-graphql-client/), these are different types of clients you can use with Apollo.  

- Also you can read the apollo section on `subscriptions` which will allow you to have some real time action like you enjoyed with firebase!

- Also pagination, optimal response would be good next steps as well, just check out the apollo docs!












