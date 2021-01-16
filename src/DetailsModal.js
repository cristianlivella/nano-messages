import React from 'react';
import * as moment from 'moment'

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

class DetailsModal extends React.Component {
    constructor(props) {
        super(props)
    }

    handleClose() {
        this.props.handleModal(false);
    }

    render() {
        return (
            <Dialog onClose={() => this.handleClose()} aria-labelledby="customized-dialog-title" open={this.props.open} maxWidth="100%">
                <DialogTitle id="customized-dialog-title" onClose={() => this.handleClose()}>
                    Message details
                </DialogTitle>
                <DialogContent dividers>
                    <TableContainer>
                        <Table size="small">
                            <TableBody>
                                <TableRow key="1">
                                    <TableCell style={{fontWeight: '500'}}>First block timestamp</TableCell>
                                    <TableCell>{this.props.message.first_timestamp} - {moment(this.props.message.first_timestamp * 1000).format("DD/MM/YYYY HH:mm:ss")}</TableCell>
                                </TableRow>
                                <TableRow key="2">
                                    <TableCell style={{fontWeight: '500'}}>Last block timestamp</TableCell>
                                    <TableCell>{this.props.message.timestamp} - {moment(this.props.message.timestamp * 1000).format("DD/MM/YYYY HH:mm:ss")}</TableCell>
                                </TableRow>
                                <TableRow key="3">
                                    <TableCell style={{fontWeight: '500'}}>Author address</TableCell>
                                    <TableCell><Link href={"https://nanocrawler.cc/explorer/account/" + this.props.message.author} target="_blank">{this.props.message.author}</Link></TableCell>
                                </TableRow>
                                <TableRow key="31">
                                    <TableCell style={{fontWeight: '500'}}>Channel address</TableCell>
                                    <TableCell><Link href={"https://nanocrawler.cc/explorer/account/" + this.props.channel} target="_blank">{this.props.channel}</Link></TableCell>
                                </TableRow>
                                {this.props.message.blocks.map((block, index) => {
                                    return (
                                        <TableRow key={"4" + index}>
                                            <TableCell style={{fontWeight: '500'}}>Block #{index+1}</TableCell>
                                            <TableCell><Link href={"https://nanocrawler.cc/explorer/block/" + block} target="_blank">{block}</Link></TableCell>
                                        </TableRow>
                                    )
                                })}
                                <TableRow key="5">
                                    <TableCell style={{fontWeight: '500'}}>Checksum block</TableCell>
                                    <TableCell><Link href={"https://nanocrawler.cc/explorer/block/" + this.props.message.checksum_block} target="_blank">{this.props.message.checksum_block}</Link></TableCell>
                                </TableRow>
                                <TableRow key="6">
                                    <TableCell style={{fontWeight: '500'}}>Broadcast block</TableCell>
                                    <TableCell><Link href={"https://nanocrawler.cc/explorer/block/" + this.props.message.broadcast_block} target="_blank">{this.props.message.broadcast_block}</Link></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => this.handleClose()} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default DetailsModal
