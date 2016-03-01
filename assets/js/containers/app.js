import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';



class App extends Component {

    render(){
        console.log(this.props)
        return (
            <div className="app">
                {this.props.children}
            </div>
        )
    }
}


export default App;
