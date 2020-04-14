import React, { Component } from 'react';

class AddDog extends Component {
  state = {
    firstName: '',
    lastName: ''
  }
  handleSave = (e) => {

  }
  handleInput = (e) => {
    this.setState({[e.currentTarget.name]: e.currentTarget.value});
  }
  render(){
    return (
      <form onSubmit={this.handleSave}>
        <input value={this.state.firstName} placeholder="first name" name='firstName' onChange={this.handleInput}/>
        <input value={this.state.lastName} placeholder="last name" name='lastName' onChange={this.handleInput}/>
        <button type="Submit">Add Contact</button>
      </form>
      )
  }

}


