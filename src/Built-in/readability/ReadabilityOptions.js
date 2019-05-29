import React, { Component } from 'react';
import './ReadabilityOptions.css';

class ReadabilityOptions extends Component {

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
            <div id="select-read-indices">
                <input type="checkbox" id="check-all" name="readability-index" value="all" onClick={this.checkAll} />All
              <input type="checkbox" className="read-index" name="readability-index" value="ARI" />ARI
              <input type="checkbox" className="read-index" name="readability-index" value="ARI.NRI" />(ARI NRI)
              <input type="checkbox" className="read-index" name="readability-index" value="ARI.simple" />(ARI simplified)
              <input type="checkbox" className="read-index" name="readability-index" value="Bormuth" />Bormuth
              <input type="checkbox" className="read-index" name="readability-index" value="Coleman" />Coleman
              <input type="checkbox" className="read-index" name="readability-index" value="Coleman.Liau" />Coleman.Liau
              <input type="checkbox" className="read-index" name="readability-index" value="Dale.Chall" />Dale.Chall
              <input type="checkbox" className="read-index" name="readability-index" value="Danielson.Bryan" />Danielson.Bryan
              <input type="checkbox" className="read-index" name="readability-index" value="Dickes.Steiwer" />Dickes.Steiwer
              <input type="checkbox" className="read-index" name="readability-index" value="DRP" />DRP
              <input type="checkbox" className="read-index" name="readability-index" value="ELF" />ELF
              <input type="checkbox" className="read-index" name="readability-index" value="Farr.Jenkins.Paterson" />Farr.Jenkins.Paterson
              <input type="checkbox" className="read-index" name="readability-index" value="Farr.Jenkins.Paterson.PSK" />Farr.Jenkins.Paterson PSK
              <input type="checkbox" className="read-index" name="readability-index" value="Flesch" />Flesch
              <input type="checkbox" className="read-index" name="readability-index" value="Flesch.PSK" />Flesch PSK
              <input type="checkbox" className="read-index" name="readability-index" value="Flesch.Kincaid" />Flesch.Kincaid
              <input type="checkbox" className="read-index" name="readability-index" value="FOG" />FOG
              <input type="checkbox" className="read-index" name="readability-index" value="FOG.PSK" />FOG PSK
              <input type="checkbox" className="read-index" name="readability-index" value="FOG.NRI" />FOG NRI
              <input type="checkbox" className="read-index" name="readability-index" value="FORCAST" />FORCAST
              <input type="checkbox" className="read-index" name="readability-index" value="FORCAST.RGL" />FORCAST Reading Grade Level
              <input type="checkbox" className="read-index" name="readability-index" value="Fucks" />Fucks
              <input type="checkbox" className="read-index" name="readability-index" value="Harris.Jacobson" />Harris.Jacobson
              <input type="checkbox" className="read-index" name="readability-index" value="Linsear.Write" />Linsear.Write
              <input type="checkbox" className="read-index" name="readability-index" value="LIX" />LIX
              {/* <input type="checkbox" className="read-index" name="readability-index" value="nWS" />nWS */}
                <input type="checkbox" className="read-index" name="readability-index" value="RIX" />RIX
              <input type="checkbox" className="read-index" name="readability-index" value="SMOG" />SMOG
              <input type="checkbox" className="read-index" name="readability-index" value="SMOG.C" />SMOG C
              <input type="checkbox" className="read-index" name="readability-index" value="SMOG.simple" />SMOG simplified
              <input type="checkbox" className="read-index" name="readability-index" value="Spache" />Spache
              <input type="checkbox" className="read-index" name="readability-index" value="Strain" />Strain
              <input type="checkbox" className="read-index" name="readability-index" value="Traenkle.Bailer" />Traenkle.Bailer
              <input type="checkbox" className="read-index" name="readability-index" value="TRI" />TRI
              <input type="checkbox" className="read-index" name="readability-index" value="Tuldava" />Tuldava
              <input type="checkbox" className="read-index" name="readability-index" value="Wheeler.Smith" />Wheeler.Smith
            </div>
        );
    }
  }

    export default ReadabilityOptions;