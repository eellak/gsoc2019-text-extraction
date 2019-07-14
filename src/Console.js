import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

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
        return (
            <div >
                {this.state.logArray.map((logObj, id) => (
                    <Typography key={id}>{logObj.message}</Typography>
                )
                )}
            </div>);
    }
}

export default Console;
