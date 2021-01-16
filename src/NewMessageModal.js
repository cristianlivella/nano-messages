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


class NewMessageModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {currentStep: 1, message: '', enoughBalance: false, address: '', messagePrice: '2000000000000000000000000000', sendLink: '', sending: false, dynamicMessage: '', gif: '', progress: {done: 0, total: 0}}
    }

    componentDidUpdate(prevProps) {
        if (this.props.open && prevProps.open !== this.props.open) {
            this.setState({currentStep: 1, message: ''});
            utilities.getCurrentAddr().then(res => {
                this.setState({address: res, sendLink: 'nano:' + res + '?amount=' + this.state.messagePrice});
            })
            utilities.receiveAll().then(() => {
                utilities.enoughBalance(0).then(res => {
                    this.setState({enoughBalance: res});
                })
            })
            this.changeGif(1);
        }
    }

    handleClose() {
        this.props.handleModal(false);
    }

    handleMessage = (e) => {
        this.setState({message: e.target.value.slice(0, 1450)});
    }

    goToStep2 = () => {
        if (this.state.message.trim() === '') {
            return;
        }
        if (this.state.enoughBalance) {
            this.startSending()
        }
        else {
            this.setState({currentStep: 2})
        }
    }

    goToStep3 = () => {
        this.setState({dynamicMessage: 'Please wait while we check the balance...'})
        utilities.receiveAll().then(() => {
            utilities.enoughBalance(0).then(res => {
                this.setState({enoughBalance: res});
                if (res) {
                    this.startSending()
                }
                else {
                    this.setState({dynamicMessage: 'The balance is not enough. Please check and try again.'})
                }
            })
        })
    }

    progressCallback = (status) => {
        this.setState({progress: status});
        this.changeGif((status.done === status.total) ? 2 : 1)
    }

    changeGif = (type) => {
        const gifs = [];
        gifs[1] = ['bAplZhiLAsNnG', 'QX15lZJbifeQPzcNDt', 'JIX9t2j0ZTN9S', '5Zesu5VPNGJlm', '13HBDT4QSTpveU', 'f5dv1g0Af3KNJneSC3', 'o0vwzuFwCGAFO', '13rQ7rrTrvZXlm', 'l0K4hO8mVvq8Oygjm', '11BbGyhVmk4iLS', 'xiAqCzbB3eZvG', 'UYmY3vRnWpHHO', 'jLK74MUW07RaU', '3o7qE1YN7aBOFPRw8E', 'Oj5w7lOaR5ieNpuBhn', '11JTxkrmq4bGE0', 'sANGK3xBT0ipq', '5tsjxsQXLl4GcNsd5S', '5WILqPq29TyIkVCSej', 'LHZyixOnHwDDy', 'URW2lPzihY5fq', 'UFGj6EYw5JhMQ', 'jUZmz3kAiAuLC', 'amUVFzg1wNZKg'];
        gifs[2] = ['26u4lOMA8JKSnL9Uk', '3o6ZsZbUukGiYMf2a4', 'Rk8wCrJCrjRJ2MyLrb', 'l0Iyl55kTeh71nTXy', '3o7qDEq2bMbcbPRQ2c', 'ZdUnQS4AXEl1AERdil', 'd31w24psGYeekCZy', 'YRuFixSNWFVcXaxpmX', 'fvT39aAmEvCJi3Bgsf', '1BhG0U58TwNllcEXcd'];
        this.setState({gif: gifs[type][Math.floor(Math.random() * gifs[type].length)]})
    }

    startSending = () => {
        this.setState({currentStep: 3, dynamicMessage: '', sending: true});
        utilities.sendMessage(this.state.message, this.props.channel, this.progressCallback).then((res) => {
            this.setState({sending: false});
            this.props.updateMessages();
        })
    }

    render() {
        return (
            <Dialog onClose={() => this.handleClose()} aria-labelledby="customized-dialog-title" open={this.props.open} fullWidth={true} maxWidth={'md'}>
                <DialogTitle id="customized-dialog-title" onClose={() => this.handleClose()}>
                    New message
                </DialogTitle>
                <DialogContent dividers>
                    {this.state.currentStep === 1 && (
                        <div>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Message"
                            type="text"
                            variant="outlined"
                            multiline
                            rows={6}
                            fullWidth
                            value={this.state.message}
                            onChange={(e) => this.handleMessage(e)}
                          />
                          <Typography variant="body1" style={{marginTop: '6px'}}>
                              {this.state.message.length} character{this.state.message.length !== 1 ? 's' : ''}{' - '}
                              {this.state.message.length === 0 ? 0 : (Math.ceil(this.state.message.length / 31) + 3)} Nano blocks
                          </Typography>
                        </div>
                    )}
                    {this.state.currentStep === 2 && (
                        <div>
                            <QRCode style={{margin: '0 auto', display: 'block'}} value={this.state.sendLink} />
                            <Typography variant="body1" style={{marginTop: '6px', textAlign: 'center'}}>
                                Please send {this.state.messagePrice / (Math.pow(10, 30))} Nano here: <Link href={this.state.sendLink}>{this.state.address}</Link>.
                            </Typography>
                            <Typography variant="body1" style={{marginTop: '6px', textAlign: 'center'}}>
                                Keep in mind that these funds will be transferred to burn addresses, so they will be irrecoverable.
                            </Typography>
                            {this.state.dynamicMessage.length > 0 && <Typography variant="body1" style={{marginTop: '6px', textAlign: 'center'}}>
                                {this.state.dynamicMessage}
                            </Typography>}
                         </div>
                    )}
                    {this.state.currentStep === 3 && (
                        <div>
                            <img src={'https://media.giphy.com/media/' + this.state.gif + '/giphy.gif'} style={{height: '200px', maxWidth: '100%', display: 'block', margin: '0 auto', cursor: 'pointer'}} onClick={() => window.open('https://giphy.com/gifs/' + this.state.gif, '_blank')}/>
                            <div style={{position: 'relative', top: '-26px'}}>
                                <img src={'giphy.png'} style={{height: '24px', float: 'left'}}/>
                                <Link href={'https://giphy.com/gifs/' + this.state.gif} target='_blank' style={{display: 'block', float: 'left', marginLeft: '3px', padding: '4px', marginTop: '-1px', background: '#ffffff'}}>via GIPHY</Link>
                                <div style={{float: 'none', clear: 'both'}} />
                            </div>
                            {(this.state.progress.done !== this.state.progress.total || this.state.progress.done === 0) ? <div>
                                <Typography variant="h6" style={{marginTop: '6px', textAlign: 'center'}}>
                                    Sending block {this.state.progress.done + 1} of {this.state.progress.total}...
                                </Typography>
                                <Typography variant="body1" style={{marginTop: '6px', textAlign: 'center'}}>
                                    Please wait, this may take some time. Keep your browser open and in foreground.
                                </Typography>
                                <Typography variant="body2" color="textSecondary" style={{textAlign: 'center'}}>
                                    (some browser pause the execution of scripts when they are in the background)
                                </Typography>
                            </div> :
                            <Typography variant="h6" style={{marginTop: '6px', textAlign: 'center'}}>
                                The message has been successfully sent!
                            </Typography>}
                         </div>
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.handleClose()} color="secondary" disabled={this.state.sending}>
                        Close
                    </Button>
                    {this.state.currentStep === 1 && (
                        <Button onClick={() => this.goToStep2()} color="primary">
                            Send
                        </Button>
                    )}
                    {this.state.currentStep === 2 && (
                        <Button onClick={() => this.goToStep3()} color="primary">
                            Next
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        )
    }
}

export default NewMessageModal
