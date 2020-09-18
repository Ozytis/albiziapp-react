import { Button, createStyles, Dialog, DialogActions, Icon, InputLabel, Theme, WithStyles, withStyles } from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import { t } from "../services/translation-service";
import { BaseComponent } from "./base-component";

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
        backgroundRepeat: "no-repeat",
        backgroundSize: "contain"
    },
    label: {
        margin: theme.spacing(1),
    },
    cameraIcon: {
        color: theme.palette.common.black
    },
    dialogChoiceModal: {
        height:'15vh'
    },
    dialogChoice: {
        display: "flex",
        flexDirection: "column",
    },
    dialogChoiceButton: {
        marginBottom:"10px"
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

    async takeSnapShot() {
        await this.setState({ showSnapShot: true });
        const context = this.videoCanvas.getContext("2d");

        var w, h, ratio: number;
        ratio = this.video.videoWidth / this.video.videoHeight;
        w = this.video.videoWidth - 100;
        h = parseInt(w as any / ratio as any, 10);
        this.videoCanvas.width = w;
        this.videoCanvas.height = h;
        context.drawImage(this.video, 0, 0, w, h);
        this.videoStream.getTracks().forEach(function (track) {
            track.stop();
        });
        await this.setState({ showCamera: false });
    }

    async takePicture(sourceType: string) {

        if (sourceType === "library") {
            this.control.click();
        }
        else {
            await this.setState({ showCamera: true, showSnapShot: false });

            const mediaConfig = { video: true };
            try {
                // Put video listeners into place
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    this.videoStream = await navigator.mediaDevices.getUserMedia(mediaConfig);

                    // video.src = window.URL.createObjectURL(stream);
                    this.video.srcObject = this.videoStream;
                    this.video.play();


                }
            } catch (e) {
                if (e.name == "NotAllowedError") {
                    alert(t.__("Vous n'avez pas autorisé à utiliser la caméra"));
                } else {
                    alert(t.__("Une erreur s'est produite."));
                }
                console.log(e);
            }
        }
    }

    onFileSelected(fileList: FileList) {

        if (this.state.loading || fileList.length === 0) {
            return;
        }

        this.setState({ loading: true }).then(() => {

            const reader = new FileReader();

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
    videoStream: MediaStream;
    openModale = () => {
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
                            <Icon className={clsx("fas fa-camera", this.props.classes.cameraIcon)} />
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

                        <DialogActions className={clsx(this.props.classes.dialogChoiceModal)}>
                            <div className={clsx(this.props.classes.dialogChoice,"text-center")}>
                                {
                                    !this.state.showCamera && !this.state.showSnapShot &&
                                    <Button color="primary" className={clsx(this.props.classes.dialogChoiceButton, "button button-primary button-block mt-1")} variant="contained"
                                        onClick={() => this.takePicture("camera")}>
                                        Prendre une photo
                                    </Button>
                                }


                                <Button color="secondary" variant="contained" className="button button-primary  button-block mb-1"
                                    onClick={() => this.takePicture("library")}>
                                    Choisir une photo existante
                            </Button>
                            </div>
                        </DialogActions>
                    </Dialog>
                }
            </div>
        )
    }
}

export const PhotoFormItem = withStyles(styles, { withTheme: true })(PhotoFormItemComponent);