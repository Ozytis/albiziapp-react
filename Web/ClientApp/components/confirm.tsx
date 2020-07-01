import * as React from "react";
import * as ReactDOM from "react-dom";
import { BaseComponent } from "./base-component";
import { Button, Modal, Icon, Dialog, DialogActions, DialogContent, DialogContentText } from "@material-ui/core";
import { t } from "../services/translation-service";

interface ConfirmComponentProps {

}

class ConfirmComponentState {
    show = false;
    text = "";
    onValidate: (value: boolean) => Promise<any>;
}

export class ConfirmComponent extends BaseComponent<ConfirmComponentProps, ConfirmComponentState>{
    constructor(props: ConfirmComponentProps) {
        super(props, "prompt", new ConfirmComponentState());
        confirmComponent = this;
    }

    async configure(text: string, onValidate: (value: boolean) => Promise<any>) {
        await this.setState({ text: text, onValidate: onValidate });
    }

    async show() {
        await this.setState({ show: true });
    }

    render() {

        if (!this.state.show) {
            return null;
        }

        return (
            <>
                {
                    ReactDOM.createPortal(
                        <Dialog
                            open
                            title={this.state.text}
                        >
                            <DialogContent>
                                <DialogContentText>{this.state.text}</DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button variant="text"
                                    onClick={() => this.setState({ show: false }).then(() => this.state.onValidate(false))}>
                                    <Icon className="fas fa-undo mr-2" /> {t.__("Annuler")}
                                </Button>
                                <Button color="primary" onClick={() => this.setState({ show: false }).then(() => this.state.onValidate(true))}>
                                    <Icon className="fas fa-check mr-2" /> {t.__("Valider")}
                                </Button>
                            </DialogActions>
                        </Dialog>, confirmHolder)
                }
            </>
        )
    }
}

let confirmComponent: ConfirmComponent;


const confirmHolder = document.createElement("div");
confirmHolder.id = "confirm-holder";
document.body.appendChild(confirmHolder);

ReactDOM.render(<ConfirmComponent ref={c => confirmComponent = c} />, confirmHolder);

export const Confirm = (text: string) => {

    return new Promise<boolean>((success) => {

        confirmComponent.configure(text, async (value) => {
            success(value);
        });

        confirmComponent.show();
    });
};