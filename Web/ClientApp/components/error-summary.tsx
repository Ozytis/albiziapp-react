import React from "react";
import { BaseComponent } from "./base-component";
import { t } from "../services/translation-service";


export class ErrorSummary extends BaseComponent<{ errors: string[]; globalText?: string }, {}>{
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
                style={{ background: "#ff6600", width: "max-content", margin: "auto", padding:"10px" }}
                role="alert">

                {this.props.globalText || t.__("Veuillez corriger les erreurs suivantes :")}

                <ul style={{marginTop:"2%"}}>
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