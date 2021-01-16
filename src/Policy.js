import React from 'react';
import * as moment from 'moment'
import * as utilities from './utilities.js'
import * as QRCode from 'qrcode.react'
import * as bigInt from 'big-integer';

import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import TextField from '@material-ui/core/TextField';


class Policy extends React.Component {
    constructor(props) {
        super(props)
        this.state = {currentStep: 1, message: '', enoughBalance: false, address: '', messagePrice: '2000000000000000000000000000', sendLink: '', sending: false, dynamicMessage: '', gif: '', progress: {done: 0, total: 0}}
    }

    render() {
        return (
            <Dialog aria-labelledby="customized-dialog-title" open={this.props.open} fullWidth={true} disableBackdropClick={true} disableEscapeKeyDown={true}>
                <DialogTitle id="customized-dialog-title">
                    Welcome! Please read this policy/agreement
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" style={{marginBottom: '12px'}}>
                        This web application allows you to write and read messages in the Nano blockchain.
                    </Typography>
                    <Typography variant="body1" style={{marginBottom: '12px'}}>
                        All the messages you will read are in Nano's public blockchain, and are fetched directly from there, with a direct connection between your device and the api.nanos.cc node.
                    </Typography>
                    <Typography variant="body1" style={{marginBottom: '12px'}}>
                        Neither the author of this repository nor Github own these messages or can control them, therefore we do not assume any responsibility for the contents you will see.
                    </Typography>
                    <Typography variant="body1" style={{marginBottom: '12px'}}>
                        Sent messages will forever remain publicly accessible in the blockchain, there is no way to remove them.
                    </Typography>
                    <Typography variant="body1" style={{marginBottom: '12px'}}>
                        Please do not post content that is vulgar, offensive or against the law. Let's keep the blockchain a clean place.
                    </Typography>
                    <Typography variant="body1" style={{marginBottom: '12px'}}>
                        This application does not use cookies but uses localStorage and sessionStorage, technologies similar to cookies, only for technical purposes. No profiling is done, there is no advertising or other bad stuff.
                    </Typography>
                    <Typography variant="body1" style={{marginBottom: '12px'}}>
                        Consider the Nano you will send here as lost, as they will be sent to burn addresses.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.props.accept()} color="primary">
                        I have read and accept
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default Policy
