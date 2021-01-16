import React from 'react';
import DetailsModal from './DetailsModal'
import * as moment from 'moment'

import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

class Message extends React.Component {
    constructor(props) {
        super(props)
        this.state = {modalOpen: false}
    }

    handleModal = (state) => {
        this.setState({modalOpen: state})
    }

    render() {
        const reg = /[\r\n]{2,}/g;
        const cleanedMessage = this.props.message.message.replace(reg, "\n\n");
        const backgroundColor = '#' + this.props.message.broadcast_block.slice(0, 2) + this.props.message.broadcast_block.slice(8, 10) + this.props.message.broadcast_block.slice(-2) + '28'
        return (
            <Card style={{margin: '16px 4px', backgroundColor: backgroundColor, whiteSpace: 'pre-line'}}>
                <CardContent>
                    <Typography variant="body1" component="p">
                        {cleanedMessage}
                    </Typography>
                </CardContent>
                <CardActions>
                    <div style={{width: '50%', float: 'left', padding: '0 8px'}}>
                        <Typography variant="body2" color="textSecondary" component="p">
                            {moment(this.props.message.timestamp * 1000).format("DD/MM/YYYY HH:mm:ss")}
                        </Typography>
                    </div>
                    <div style={{width: '50%', float: 'right', padding: '0 8px', textAlign: 'right'}}>
                        <Button size="small" color="primary" onClick={() => this.handleModal(true)}>
                            Details
                        </Button>
                    </div>
                </CardActions>
                <DetailsModal open={this.state.modalOpen} handleModal={this.handleModal} message={this.props.message} channel={this.props.channel}/>
            </Card>
        )
        return <div>{this.props.message.message}</div>
    }
}

export default Message
