import React from 'react';
import './App.css';
import Message from './Message'
import NewMessageModal from './NewMessageModal'
import Policy from './Policy'
import * as utilities from './utilities.js'
import { sha256 } from 'js-sha256';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';


class Demo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {cleaned: '', encoded: '', addresses: [], checksum: '', checksumEncoded: '', channel: '', channelEncoded: '', channelAddress: '', messageTimer: null}
    }

    componentDidMount() {
        this.handleMessageChange('');
        this.handleChannelChange('');
    }

    handleMessageChange(message) {
        clearTimeout(this.state.messageTimer)
        this.setState({
            messageTimer: setTimeout(() => {
                const cleaned = utilities.clearUnicodeChars(message);
                const encoded = utilities.encodeMessage(cleaned)
                const addresses =  utilities.getMessageSendAddresses(message)
                const checksum = (addresses.length - 1) + '|' + sha256(encoded).substring(0, 30 - (addresses.length - 1).toString().length)
                this.setState({
                    cleaned: cleaned,
                    encoded: encoded,
                    addresses: addresses,
                    checksum: checksum,
                    checksumEncoded: utilities.encodeMessage(checksum)
                })
            }, 200)
        })
    }

    handleChannelChange(channel) {
        let channelClean = utilities.clearUnicodeChars(channel.toLowerCase().trim());
        if (channelClean === '') {
            channelClean = ' '
        }
        const channelEncoded = utilities.encodeMessage(channelClean);
        this.setState({channel: channel, channelEncoded: channelEncoded.substring(0, 43), channelAddress: utilities.getChannelAddress(channel)})
    }

    render() {
        return (
            <Container>
                <Paper elevation={3} style={{margin: '24px 0', padding: '8px', backgroundColor: 'rgba(255,255,255,1)'}}>
                    <Typography variant="h3" style={{textAlign: 'center', color: '#00428e'}}>
                        Nano Messages demo
                    </Typography>
                    <Typography variant="body1" style={{textAlign: 'center', color: '#00428e', marginBottom: '16px'}}>
                        Click <Link href={process.env.PUBLIC_URL}>here</Link> to go to the home page.
                    </Typography>
                    <TextField
                        label="Message"
                        variant="outlined"
                        size="small"
                        style={{width: '100%', marginBottom: '14px'}}
                        multiline
                        onChange={(e) => this.handleMessageChange(e.target.value)}
                    />
                    <TextField
                        label="Channel name"
                        variant="outlined"
                        size="small"
                        style={{width: '100%', marginBottom: '28px'}}
                        value={this.state.channel}
                        onChange={(e) => this.handleChannelChange(e.target.value.slice(0, 25))}
                    />
                    <TextField
                        label="Message cleaned - character in UTF-8 one-byte range"
                        variant="outlined"
                        size="small"
                        style={{width: '100%', marginBottom: '14px'}}
                        InputProps={{
                            readOnly: true,
                        }}
                        multiline
                        value={this.state.cleaned}
                    />
                    <TextField
                        label="Message encoded using base32 Nano encoding"
                        variant="outlined"
                        size="small"
                        style={{width: '100%', marginBottom: '14px'}}
                        InputProps={{
                            readOnly: true,
                        }}
                        multiline
                        value={this.state.encoded}
                    />
                    <TextField
                        label="Number of blocks - Nano addresses/transaction"
                        variant="outlined"
                        size="small"
                        style={{width: '100%', marginBottom: '14px'}}
                        InputProps={{
                            readOnly: true,
                        }}
                        multiline
                        value={this.state.addresses.length + 1}
                    />
                    <TextField
                        label="Checksum plain"
                        variant="outlined"
                        size="small"
                        style={{width: '100%', marginBottom: '14px'}}
                        InputProps={{
                            readOnly: true,
                        }}
                        multiline
                        value={this.state.checksum}
                    />
                    <TextField
                        label="Checksum base32 encoded"
                        variant="outlined"
                        size="small"
                        style={{width: '100%', marginBottom: '14px'}}
                        InputProps={{
                            readOnly: true,
                        }}
                        multiline
                        value={this.state.checksumEncoded}
                    />
                    <TextField
                        label="Channel encoded"
                        variant="outlined"
                        size="small"
                        style={{width: '100%', marginBottom: '14px'}}
                        InputProps={{
                            readOnly: true,
                        }}
                        multiline
                        value={this.state.channelEncoded}
                    />
                    {this.state.addresses.map((address, index) => {
                        return (
                            <TextField
                                key={"addr" + index}
                                label={"Address #" + (index+1) + ((index + 1 == this.state.addresses.length) ? ' (checksum)' : '')}
                                variant="outlined"
                                size="small"
                                style={{width: '100%', marginBottom: '14px'}}
                                InputProps={{
                                    readOnly: true,
                                }}
                                multiline
                                value={address}
                            />
                        )
                    })}
                    {<TextField
                        key={"addr" + this.state.addresses.length}
                        label={"Address #" + (this.state.addresses.length+1) + " (channel)"}
                        variant="outlined"
                        size="small"
                        style={{width: '100%', marginBottom: '14px'}}
                        InputProps={{
                            readOnly: true,
                        }}
                        multiline
                        value={this.state.channelAddress}
                    />}
                </Paper>
            </Container>
        );
    }
}

export default Demo
