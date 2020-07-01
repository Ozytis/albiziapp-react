import React from "react";
import { BaseComponent } from "./base-component";
import { t } from "../services/translation-service";


export class ErrorSummary extends BaseComponent<{ errors: string[], globalText?: string }, {}>{
    constructor(props?: { errors: string[] }) {
        super(props);
    }

    render() {

        if (!this.props.errors || this.props.errors.length === 0) {
            return null;
        }

        return (
            <div
                className="validation-summary-errors alert alert-danger rounded-0"
                style={{ background: "linear-gradient(to right,#ff6600 0%, #ff8800 100%)"}}
                role="alert">

                {this.props.globalText || t.__("Veuillez corriger les erreurs suivantes :")}

                <ul>
                    {
                        this.props.errors.map && this.props.errors.map((error, index) => (
                            <li key={`error-${index}`}>
                                {error}
                            </li>
                        ))
                    }
                </ul>
            </div>
        )
    }
}