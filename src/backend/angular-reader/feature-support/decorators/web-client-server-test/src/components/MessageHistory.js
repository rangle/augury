import React, { Component } from 'react';
import { connect } from 'react-redux';
import './InputBox.css';

const MessageHistory = ({ messageHistory }) => (
  <div>
    {
      (messageHistory || []).map((msg, i) =>
        <div key={i}>
          <b> { msg.username } </b>: <span> { msg.text } </span>
        </div>
      )
    }
  </div>
)

// is this a container?
// action bindings should only be in containers (using bindActionCreators)
export default connect(
  state => ({ messageHistory: state.conversation.messageHistory })
)(MessageHistory)
