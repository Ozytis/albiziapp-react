import React from "react";
import { BaseComponent } from "./base-component";
import { Modal, DialogActions, Dialog, createStyles, Theme, WithStyles, withStyles, Button, Icon, InputLabel } from "@material-ui/core";
import clsx from "clsx";
import { t } from "../services/translation-service";

const styles = (theme: Theme) => createStyles({
    input: {
        display: "none"
    },
    videoCanvas: {
        width: "33vh",
        height: "25vh",
        margin: `${theme.spacing(1)}px auto`
    },
    snapButton: {
        margin: theme.spacing(1),
    },
    photoContent: {
        margin: `${theme.spacing(1)}px auto`,
        width: "33vh",
        height: "25vh",
    },
    label: {
        margin: theme.spacing(1),
    }
})


interface PhotoFormItemProps extends WithStyles<typeof styles> {
    label: string;
    className?: string;
    value: string;
    onChange: (photoData: any) => Promise<any>;
}

class PhotoFormItemState {
    loading = false;
    showSourceSelection = false;
    showCamera = false;
    showSnapShot = false;
}

class PhotoFormItemComponent extends BaseComponent<PhotoFormItemProps, PhotoFormItemState>{
    constructor(props: PhotoFormItemProps) {
        super(props, "photo-form-item", new PhotoFormItemState());
    }

    async componentDidMount() {

    }

    async takeSnapShot() {
        await this.setState({ showSnapShot: true });
        const context = this.videoCanvas.getContext("2d");

        console.log(this.video.videoWidth, this.video.videoHeight, this.video);
        context.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);
        await this.setState({ showCamera: false });
    }

    async takePicture(sourceType: string) {

        if (sourceType === "library") {
            this.control.click();
        }
        else {
            await this.setState({ showCamera: true, showSnapShot: false });

            var mediaConfig = { video: true };
            var errBack = function (e) {
                console.log('An error has occurred!', e)
            };

            // Put video listeners into place
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia(mediaConfig);

                //video.src = window.URL.createObjectURL(stream);
                this.video.srcObject = stream;
                this.video.play();

            }
        }
    }

    onFileSelected(fileList: FileList) {

        if (this.state.loading || fileList.length === 0) {
            return;
        }

        this.setState({ loading: true }).then(() => {

            var reader = new FileReader();

            reader.onloadend = result => {
                this.setState({ loading: false, showSourceSelection: false });
                this.props.onChange((result.target as FileReader).result);
            };

            reader.readAsDataURL(fileList[0]);
        });
    }

    control: HTMLInputElement;
    videoCanvas: HTMLCanvasElement;
    video: HTMLVideoElement;

    openModale = () => {
        console.log('open photo modale');
        this.setState({ showSourceSelection: true });
    }

    async keepSnapShot() {
        await this.props.onChange(this.videoCanvas.toDataURL());
        await this.setState({ showCamera: false, showSnapShot: false, showSourceSelection: false });
    }

    render() {
        return (
            <div className="photo-form-item">
                <div className="photo-form-item-preview">
                    <InputLabel className={clsx(this.props.classes.label)}>
                        {(!this.props.value || this.props.value.length < 1) && this.props.label}

                    </InputLabel>
                    {
                        this.props.value && this.props.value.length > 1 &&
                        <div className={clsx("photo-content", this.props.classes.photoContent)} style={{ backgroundImage: `url("${this.props.value}")` }}>
                        </div>
                    }
                    {
                        <div className="photo-form-item-button text-center m-2" onClick={() => this.openModale()}>
                            <Icon className="fas fa-camera" />
                            <input type="file" accept="image/*"
                                capture="camera" ref={input => this.control = input} onChange={(e) => this.onFileSelected(e.target.files)}
                                className={clsx(this.props.classes.input)}
                            />
                        </div>
                    }
                </div>
                {
                    this.state.showSourceSelection &&
                    <Dialog open onClose={() => this.setState({ showSourceSelection: false })}>
                        {
                            this.state.showCamera &&
                            <>
                                <video autoPlay ref={c => this.video = c} className={clsx(this.props.classes.videoCanvas)} />

                                <Button variant="contained" color="primary" onClick={() => this.takeSnapShot()} className={clsx(this.props.classes.snapButton)}>
                                    {t.__("Prendre la photo")}
                                </Button>
                            </>
                        }

                        {
                            this.state.showSnapShot &&
                            <>
                                <canvas ref={c => this.videoCanvas = c} className={clsx(this.props.classes.videoCanvas)} />
                                <Button variant="contained" color="primary" onClick={() => this.keepSnapShot()} className={clsx(this.props.classes.snapButton)}>
                                    {t.__("Valider la photo")}
                                </Button>
                                <Button
                                    variant="text"
                                    color="default"
                                    onClick={() => this.takePicture("camera")}
                                    className={clsx(this.props.classes.snapButton)}>
                                    {t.__("Reprendre une photo")}
                                </Button>
                            </>
                        }

                        <DialogActions>

                            <div className="text-center">
                                {
                                    !this.state.showCamera && !this.state.showSnapShot &&
                                    <button className="button button-primary button-block mb-1 mt-1"
                                        onClick={() => this.takePicture("camera")}>
                                        Prendre une photo
                                    </button>
                                }

                                <button className="button button-primary  button-block mb-1"
                                    onClick={() => this.takePicture("library")}>
                                    Choisir une photo existante
                            </button>
                            </div>
                        </DialogActions>
                    </Dialog>
                }
            </div>
        )
    }
}

export const PhotoFormItem = withStyles(styles, { withTheme: true })(PhotoFormItemComponent);