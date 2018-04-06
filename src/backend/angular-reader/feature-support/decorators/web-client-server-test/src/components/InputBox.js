import React, { Component } from 'react';
import { connect } from 'react-redux';
import { sendMsg } from '../actions/conversationActions'
import './InputBox.css';

class InputBox extends Component {

  constructor(){
    super();
    this.state = { txt: '' };
  }

  componentDidMount(){
    this.nameInput.focus();
  }

  send() {
    this.props.sendMsg(this.state.txt)
    this.setState({ txt: '' })
  }

  render() {
    //const { sendMsg } = this.props
    const handleKeyPress = (key) => {
      if (key === 'Enter') this.send()
    }
    return (
      <div>
        <input
          ref={(input) => { this.nameInput = input; }}
          value={this.state.txt}
          onKeyPress={e => handleKeyPress(e.key)}
          onChange={e => this.setState({ txt: e.target.value })}>
        </input>
        <button onClick={() => this.send()}>
          send
        </button>
      </div>
    )
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    sendMsg: (txt) => dispatch(sendMsg(txt))
  })
)(InputBox)
