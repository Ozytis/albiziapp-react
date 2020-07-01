import clsx from 'clsx';
import React from "react";
import { BaseComponent } from "./base-component";

interface LoaderProps {
    loaderIcon?: string;
    usualIcon?: string;
    loading: boolean;
    className?: string;
}

export class Loader extends BaseComponent<LoaderProps, {}>{
    constructor(props: LoaderProps) {
        super(props);
    }

    render() {

        if (this.props.loading) {
            return (
                <>
                    <i className={clsx("fas mr-1 fa-spin fa-fw", this.props.className, this.props.loaderIcon ? this.props.loaderIcon : "fa-sync")} />
                </>
            )
        } else {
            return (
                <div>
                    <i className={clsx("mr-1 fas", " fa-fw fa-" + (this.props.usualIcon || "check"), this.props.className)} />
                </div>
            )
        }
    }
}