import React, { Component } from 'react';
import './ResultsTab.css';
import '@trendmicro/react-sidenav/dist/react-sidenav.css';
import "react-tabs/style/react-tabs.css";

const ResultsTab = props => {
    return (
        <div>
            <button id="execute" onClick={props.executeAll}>Execute</button>
            <div id="results" />
        </div>
    );
};

export default ResultsTab;

