import React, { Component } from 'react';
import ReadabilityOptions from './Built-in/readability/ReadabilityOptions'
import LexdivOptions from './Built-in/lexdiv/LexdivOptions'
import MiscOptions from './Built-in/misc/MiscOptions'
import CustomOptions from './Built-in/custom/CustomOptions'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

class ScriptsTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabIndex: 0
        }
    }

    changeTab = (tabIndex) => {
        this.setState({ tabIndex: Number(tabIndex) })
    };

    render() {
        const dummyTab = (() => {
            if (this.props.selectedFilesPaths.length !== 0) {
                const file = new File(["foo"], this.props.selectedFilesPaths[0]);
                return <Typography variant="subtitle1">Dummy method which pastes the path of the first selected file. {file.name}</Typography>;
            }
            else return <Typography variant="subtitle1">No file selected.</Typography>;
        })();

        const readabilityTab = (
            <div>
                <ReadabilityOptions setDistantState={this.props.setDistantState} selectedIndices={this.props.readIndex} filePaths={this.props.selectedFilesPaths} settings={this.props.settings} type="readability" setScriptParameters={this.props.setScriptParameters} platform={this.props.platform} />
            </div>);

        const lexdivTab = (
            <div>
                <LexdivOptions setDistantState={this.props.setDistantState} selectedIndices={this.props.lexdivIndex} filePaths={this.props.selectedFilesPaths} settings={this.props.settings} type="lexdiv" setScriptParameters={this.props.setScriptParameters} platform={this.props.platform} />
            </div>);

        const miscTab = (
            <div>
                <MiscOptions setDistantState={this.props.setDistantState} selectedIndices={this.props.miscIndex} filePaths={this.props.selectedFilesPaths} settings={this.props.settings} type="misc" setScriptParameters={this.props.setScriptParameters} platform={this.props.platform} />
            </div>);

        const customScriptTab = (
            <div>
                <CustomOptions platform={this.props.platform} settings={this.props.settings} electron={this.props.electron} isDev={this.props.isDev} type="custom" setScriptParameters={this.props.setScriptParameters} />
            </div>);

        return (
            <div className={this.props.className}>
                <Typography variant="subtitle1" align="center">Select processing script</Typography>
                <Tabs value={this.state.tabIndex} onChange={(event, tabIndex) => this.changeTab(tabIndex)}>
                    <Tab label="DummyScript" />
                    <Tab label="Readability" />
                    <Tab label="Lexical Diversity" />
                    <Tab label="Mischellaneous" />
                    <Tab label="CustomScript" />
                </Tabs>
                {this.state.tabIndex === 0 && dummyTab}
                {this.state.tabIndex === 1 && readabilityTab}
                {this.state.tabIndex === 2 && lexdivTab}
                {this.state.tabIndex === 3 && miscTab}
                {this.state.tabIndex === 4 && customScriptTab}
            </div>
        );
    }
};
export default ScriptsTab;
