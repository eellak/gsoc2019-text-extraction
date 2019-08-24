import { consoleHeight } from './Main';
import React, { Component } from 'react';
import { withStyles } from '@material-ui/styles';
import { Typography, Paper } from '@material-ui/core';

const styles = theme => ({

    footer: {
        height: `${consoleHeight}px`,
        'overflow-y': 'scroll',
    },
    padding: {
        paddingLeft: '10px'
    }
});

class Console extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
        // Cannot be put in state because of rapid addition which would not get caught by setState
        this.logArray = []
        const logMessage = (message, type) => {
            let logMessage = { message: message, type: type };
            const date = new Date();
            logMessage = date.toTimeString().split(' ')[0] + ' ' + logMessage.message;
            this.logArray.push({
                dateInstance: date,
                message: logMessage
            });
            // Rerender component
            this.setState({render: 1});
        };
        props.setDistantState({logMessage: logMessage});
    }

    componentDidUpdate() {
        const consoleDiv = document.getElementById("console");
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }

    render() {
        const classes = this.props.classes;
        return (
            <Paper id="console" classes={{ root: classes.footer }}>
                {this.logArray.map((logObj, id) => (
                    <Typography key={id} classes={{root: classes.padding}}>{logObj.message}</Typography>
                ))}
            </Paper>
        )
    }
}

export default withStyles(styles)(Console);
