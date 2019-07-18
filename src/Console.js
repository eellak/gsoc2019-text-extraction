import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({

    footer: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        width: '100%',
        height: '20%',
        overflow: 'scroll',
    },

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
                    <Typography key={id}>{logObj.message}</Typography>
                ))}
            </Paper>
        )
    }
}

export default withStyles(styles)(Console);
