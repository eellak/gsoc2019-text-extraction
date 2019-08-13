import React, { Component } from 'react';
import { withStyles } from '@material-ui/styles';
import ScriptOptions from './Built-in/ScriptOptions';
import CustomOptions from './Built-in/custom/CustomOptions';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    container: {
        height: '100%'
    }
})
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
                settings={this.props.settings}
                type={obj.indexType}
                env={obj.env}
                indices={obj.indicesDeclaration}
                scriptPath={obj.scriptPath}
                selectedIndices={this.props.selectedIndices}
                setScriptParameters={this.props.setScriptParameters}
                platform={this.props.platform} />
        });
        const classes = this.props.classes;
        return (
            <div className={classes.container}>
                {/* <Typography variant="subtitle1" align="center">Select processing script</Typography> */}
                <Tabs value={this.state.tabIndex} textColor="secondary" onChange={(event, tabIndex) => this.changeTab(tabIndex)}>
                    {this.props.indices.map(obj => <Tab key={obj.indexTypeDisplayName} label={obj.indexTypeDisplayName} />)}
                    <Tab label="CustomScript" />
                </Tabs>
                {tabs.map((component, index) => {
                    if (index === this.state.tabIndex) {
                        return component;
                    }
                })}
                {this.state.tabIndex === this.props.indices.length && customScriptTab}
            </div>
        );
    }
};
export default withStyles(styles)(ScriptsTab);
