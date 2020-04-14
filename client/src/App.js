import React, { Component } from 'react';
import Dogs from './Dogs';

import './App.css';
import addDog from './AddDog';





class App extends Component {
  render() {
    return (

        <div className="App">
          <Dogs />
          <AddDog />
        </div>

    );
  }
}

export default App;
