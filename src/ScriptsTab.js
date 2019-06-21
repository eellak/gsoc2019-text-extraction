import React, { Component } from 'react';
import './ScriptsTab.css';
import ReadabilityOptions from './Built-in/readability/ReadabilityOptions'
import LexdivOptions from './Built-in/lexdiv/LexdivOptions'
import MiscOptions from './Built-in/misc/MiscOptions'
import CustomOptions from './Built-in/custom/CustomOptions'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";

const ScriptsTab = props => {
    const dummyTab = (() => {
        if (props.selectedFilesPaths.length !== 0) {
            const file = new File(["foo"], props.selectedFilesPaths[0]);
            return <div>Dummy method which pastes the path of the first selected file. {file.name}</div>;
        }
        else return <div>No file selected.</div>;
    })();

    const readabilityTab = (
        <div>
            <ReadabilityOptions filePaths={props.selectedFilesPaths} settings={props.settings} type="readability" setScriptParameters={props.setScriptParameters} platform={props.platform} />
        </div>);

    const lexdivTab = (
        <div>
            <LexdivOptions filePaths={props.selectedFilesPaths} settings={props.settings} type="lexdiv" setScriptParameters={props.setScriptParameters} platform={props.platform} />
        </div>);

    const miscTab = (
        <div>
            <MiscOptions filePaths={props.selectedFilesPaths} settings={props.settings} type="misc" setScriptParameters={props.setScriptParameters} platform={props.platform} />
        </div>);
    
    const customScriptTab = (
        <div>
            <CustomOptions platform={props.platform} settings={props.settings} electron={props.electron} isDev={props.isDev} type="custom" setScriptParameters={props.setScriptParameters} />
        </div>);

    return (
        <div>
            <h4>Select processing script</h4>
            <Tabs id="script-select">
                <TabList>
                    <Tab>DummyScript</Tab>
                    <Tab>Readability</Tab>
                    <Tab>Lexical Diversity</Tab>
                    <Tab>Mischellaneous</Tab>
                    <Tab>CustomScript</Tab>
                </TabList>
                <TabPanel>
                    {dummyTab}
                </TabPanel>
                <TabPanel forceRender={true}>
                    {readabilityTab}
                </TabPanel>
                <TabPanel forceRender={true}>
                    {lexdivTab}
                </TabPanel>
                <TabPanel forceRender={true}>
                    {miscTab}
                </TabPanel>
                <TabPanel forceRender={true}>
                    {customScriptTab}
                </TabPanel>
            </Tabs>
        </div>
    );
};

export default ScriptsTab;