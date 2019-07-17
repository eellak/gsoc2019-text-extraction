import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';

const styles = theme => ({

    footer: {
        position: 'absolute',
        bottom: '0',
        width: '100%',
        height: '250px',
        overflow: 'scroll'
    },

});

class Console extends Component {

    constructor(props) {
        super(props);
        this.state = {
            logArray: []
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.logMessage !== prevProps.logMessage) {
            let logMessage = this.props.logMessage;
            const date = new Date();
            logMessage = date.toTimeString().split(' ')[0] + ' ' + logMessage.message;
            this.setState({
                logArray: [...this.state.logArray, {
                    dateInstance: date,
                    message: logMessage
                }]
            })
        }
    }



    render() {
        const classes = this.props.classes;
        return (
            <div className={classes.footer}>
                {this.state.logArray.map((logObj, id) => (
                    <Typography key={id}>{logObj.message}</Typography>
                )
                )}
            </div>);
    }
}

export default withStyles(styles)(Console);
