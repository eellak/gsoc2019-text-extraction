import React, { Component } from 'react';
import ReadabilityOptions from './Built-in/readability/ReadabilityOptions'
import LexdivOptions from './Built-in/lexdiv/LexdivOptions'
import MiscOptions from './Built-in/misc/MiscOptions'
import ScriptOptions from './Built-in/ScriptOptions'
import CustomOptions from './Built-in/custom/CustomOptions'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

/* ScriptsTab is a component, which renders a script selection tab.
*/
class ScriptsTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabIndex: 0
        }
    }
    // Change view tab according to user's selection
    changeTab = (tabIndex) => {
        this.setState({ tabIndex: Number(tabIndex) })
    };

    render() {
        const dummyTab = (() => {
            if (this.props.selectedFilesPaths.length !== 0) {
                // console.log(this.props.fs.statSync(this.props.selectedFilesPaths[0], {encoding: "utf8"}));
                // <Typography variant="subtitle1">Dummy method which pastes the contents of the first selected file. {data}</Typography>));
            }
            else return <Typography variant="subtitle1">No file selected.</Typography>;
        })();

        const customScriptTab = (
            <CustomOptions
                platform={this.props.platform}
                selectedCustomScripts={this.props.selectedCustomScripts}
                ipc={this.props.ipc} savedScripts={this.props.savedScripts}
                settings={this.props.settings} electron={this.props.electron}
                setDistantState={this.props.setDistantState}
                isDev={this.props.isDev}
                type="custom"
                setScriptParameters={this.props.setScriptParameters}
            />

        );

        const tabs = this.props.indices.map((obj, index) => {
            return <ScriptOptions
                key={index}
                ipc={this.props.ipc}
                setDistantState={this.props.setDistantState}
                filePaths={this.props.selectedFilesPaths}
                settings={this.props.settings}
                type={obj.indexType}
                env={obj.env}
                indices={obj.indicesDeclaration}
                scriptPath={obj.scriptPath}
                selectedIndices={this.props.selectedIndices}
                setScriptParameters={this.props.setScriptParameters}
                platform={this.props.platform} />
        });
        return (
            <div className={this.props.className}>
                <Typography variant="subtitle1" align="center">Select processing script</Typography>
                <Tabs value={this.state.tabIndex} onChange={(event, tabIndex) => this.changeTab(tabIndex)}>
                    {this.props.indices.map((obj, index) => <Tab key={index} label={obj.indexTypeDisplayName} />)}
                    <Tab label="CustomScript" />
                    <Tab label="DummyScript" />
                </Tabs>
                {tabs.map((component, index) => {
                    if (index === this.state.tabIndex) {
                        return component;
                    }
                })}
                {this.state.tabIndex === this.props.indices.length && customScriptTab}
                {this.state.tabIndex === this.props.indices.length + 1 && dummyTab}
            </div>
        );
    }
};
export default ScriptsTab;
