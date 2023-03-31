import React, {Component} from "react";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";

class SnackbarDisplay extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showSnackbar: this.props.enabled
        }
    }

    hideSnackbar = () => {
        this.setState({showSnackbar: false})
    }

    render() {
        return <>
            <Snackbar open={this.state.showSnackbar} onClose={this.hideSnackbar}
                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
            >
                <Alert severity={this.props.severity} onClose={this.hideSnackbar}>
                    {this.props.message}
                </Alert>
            </Snackbar>
        </>;
    }
}

export default SnackbarDisplay;