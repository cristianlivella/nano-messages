import React from 'react';
import './App.css';
import Message from './Message'
import NewMessageModal from './NewMessageModal'
import Policy from './Policy'
import * as utilities from './utilities.js'

import { Button } from '@material-ui/core';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { Alert, AlertTitle } from '@material-ui/lab';
import Link from '@material-ui/core/Link';
import CircularProgress from '@material-ui/core/CircularProgress';


class Home extends React.Component {
    constructor(props) {
        super(props)
        this.state = {channel: 'global', channelAddress: '', channelTimeout: null, messagesLimit: 10, messages: [], loading: false, newMessageModal: false, showPolicy: false}
    }

    componentDidMount() {
        const policyAccepted = localStorage.getItem('policy');
        if (policyAccepted !== 'true') {
            this.setState({showPolicy: true});
        }
        else {
            this.updateMessages();
            setInterval(() => {
                this.updateMessages();
            }, (5 * 60 * 1000));
        }
    }

    acceptPolicy = () => {
        this.setState({showPolicy: false});
        localStorage.setItem('policy', 'true');
        this.updateMessages();
        setInterval(() => {
            this.updateMessages();
        }, (5 * 60 * 1000));
    }

    handleChannelUpdate(e) {
        this.state.channelTimeout && clearTimeout(this.state.channelTimeout);
        this.setState({
                channelTimeout: setTimeout(() => {
                    this.updateMessages();
                }, 500),
                messagesLimit: 10,
                channel: e.target.value.slice(0, 25)
        })
    }

    changeChannel(channelName) {
        this.setState({channel: channelName, messageLimit: 10}, () => {
            this.updateMessages();
        });
    }

    handleLoadMore() {
        this.setState({messagesLimit: this.state.messagesLimit + 10}, () => {
            this.updateMessages();
        });
    }

    handleNewMessageModal = (state) => {
        this.setState({newMessageModal: state})
    }

    updateMessages = async () => {
        this.setState({loading: true});
        const address = utilities.getChannelAddress(this.state.channel);
        this.setState({channelAddress: address});
        const messages = await utilities.getMessagesInChannel(address, this.state.messagesLimit);
        this.setState({messages: messages, loading: false});
    }

    render() {
        const messages = this.state.messages;
        return (
            <Container>
                <Paper elevation={3} style={{margin: '24px 0', padding: '8px', backgroundColor: 'rgba(255,255,255,0.99)'}}>
                    <Typography variant="h3" style={{textAlign: 'center', color: '#00428e'}}>
                        Nano Messages
                    </Typography>
                    <Typography variant="h6" style={{textAlign: 'center', color: '#00428e'}}>
                        Messages on the blockchain
                    </Typography>
                    <div>
                        <div className="left-btn">
                            <TextField
                                id="outlined-required"
                                label="Channel name"
                                variant="outlined"
                                size="small"
                                value={this.state.channel}
                                onChange={(e) => this.handleChannelUpdate(e)}
                            />
                        </div>
                        <div className="right-btn">
                            <Button variant="contained" color="primary" onClick={() => this.handleNewMessageModal(true)}>
                                New message
                            </Button>
                        </div>
                    </div>
                    <div style={{float: 'none', clear: 'both'}} />
                    <div style={{margin: '8px 0'}} >
                        {messages.length > 0 ? messages.map(m => <Message key={m.broadcast_block} message={m} channel={this.state.channelAddress} />) : (!this.state.loading && (
                            <Alert severity="error">
                                <AlertTitle>No messages found</AlertTitle>
                                There are no messages in this channel.<br/>
                                Try exploring the <Link href="#" onClick={() => this.changeChannel('global')}>global</Link> channel,
                                or <Link href="#" onClick={() => this.handleNewMessageModal(true)}>write</Link> the first message!
                            </Alert>
                        ))}
                        {this.state.messages.length === this.state.messagesLimit &&
                            <Button variant="contained" color="primary" onClick={() => this.handleLoadMore()} style={{margin: '16px auto', display: 'block'}}>
                                Load more
                            </Button>
                        }
                        {this.state.loading && <CircularProgress style={{margin: '16px auto', display: 'block'}} />}
                    </div>
                    <hr/>
                    <Typography variant="body1" style={{textAlign: 'center'}}>
                        <Link href="https://github.com/cristianlivella/nano-messages" target="_blank">github.com/cristianlivella/nano-messages</Link>
                    </Typography>
                    <Typography variant="body2" style={{textAlign: 'center'}}>
                        API by <Link href="https://api.nanos.cc/" target="_blank">api.nanos.cc</Link>, <Link href="https://mynano.ninja/api" target="_blank">mynano.ninja</Link> and <Link href="https://vox.nanos.cc/api" target="_blank">vox.nanos.cc/api</Link><br/>
                        Background by <Link href="https://steemit.com/cryptocurrency/@lucasols/nano-4k-wallpapers" target="_blank">lucasols</Link><br/>
                    </Typography>
                </Paper>
                <NewMessageModal open={this.state.newMessageModal} handleModal={this.handleNewMessageModal} channel={this.state.channelAddress} updateMessages={this.updateMessages}/>
                <Policy open={this.state.showPolicy} accept={this.acceptPolicy} />
            </Container>
        );
    }
}


export default Home;
