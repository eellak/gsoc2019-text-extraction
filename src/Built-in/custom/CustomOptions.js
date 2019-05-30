import React, { Component } from 'react';
import './CustomOptions.css';

class CustomOptions extends Component {

    constructor() {
        super();
        this.state = {
            platform: window.process.platform,
            electron: window.require('electron'),
            isDev: window.require('electron-is-dev'),
            selectedFilesPaths: [],
            resultList: []
        };
    }

    checkAll = () => {
        const checkboxes = document.querySelectorAll(".read-index");
        const isChecked = document.querySelector("#check-all").checked;
        checkboxes.forEach((checkbox) => {
          checkbox.checked = isChecked;
        });
      }
      
    render() {
        return (
        <form id="custom-options">
            <button>Select script</button>
            <input type="text" placeholder="Insert necessary arguments"/>
        </form>);
    }
  }

    export default CustomOptions;