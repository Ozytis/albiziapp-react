import axios from "axios";
import { OperationResult } from "./operation-result";
import { __ } from "./translation";

export class BaseService {

    public BaseUrl = "/api/";

    public static AuthToken = "";

    constructor(){
        axios.defaults.withCredentials = true;
    }

    getHeaders() {
       return {}
    }

    protected async get<T>(url: string) {
        const result = await axios.get<T>(this.BaseUrl + url, {
            withCredentials: true,
            headers: this.getHeaders()
        });

        return result.data;
    }

    protected async post<T>(url: string, data: unknown) {

        try {
            const result = await axios.post<T>(this.BaseUrl + url, data, {
                withCredentials:  true,
                headers: this.getHeaders()
            });

            return new OperationResult<T>(true, null as unknown as string[], result.data);
        }
        catch (error) {
            console.log(JSON.parse(JSON.stringify(error.response)));
            return new OperationResult<T>(false, error.response.data.errors || error.response.data || [__("Erreur serveur")])
        };
    }

    protected async put<T>(url: string, data: unknown) {

        try {
            const result = await axios.put<T>(this.BaseUrl + url, data, {
                withCredentials:  true,
                headers: this.getHeaders()
            });
            return new OperationResult<T>(true, null as unknown as string[], result.data);
        }
        catch (error) {
            return new OperationResult<T>(false, error.response.data.errors || error.response.data || [__("Erreur serveur")]);
        }
    }

    protected async delete(url: string) {

        try {
            const result = await axios.delete(this.BaseUrl + url, {
                withCredentials:  true,
                headers: this.getHeaders()
            });
            return new OperationResult<void>(true, null as unknown as string[], result.data);
        }
        catch (error) {
            return new OperationResult<void>(false, error.response.data.errors || error.response.data || [__("Erreur serveur")]);
        }
    }

    protected async patch<T>(url: string, data: unknown) {
        try {
            const result = await axios.patch<T>(this.BaseUrl + url, data, {
                withCredentials: true,
                headers: this.getHeaders()
            });
            return new OperationResult<T>(true, null as unknown as string[], result.data);
        }
        catch (error) {
            return new OperationResult<void>(false, error.response.data.errors || error.response.data);
        }
    }

    protected buildGetUrl(url: string, from: number, count: number, sort: string, sortOrder: string, filters: any) {

        const parameters = {
            $skip: from,
            $top: count,
            $sort: sort,
            $sortOrder: sortOrder
        };

        const params = [];

        for (const key in parameters) {
            if (parameters[key] !== null && parameters[key] !== undefined) {
                params.push(`${key}=${encodeURIComponent(parameters[key])}`);
            }
        }

        for (const key in filters) {


            if ((filters[key] + "").length > 0) {

                params.push(`$${key}=${encodeURIComponent(filters[key])}`);
            }
        }

        url += (url.indexOf("?") > -1 ? "&" : "?") + params.join("&");

        return url;
    }

    protected async downloadFileWithPost(url: string, postData: unknown) {

        try {
            const result = await axios.post(this.BaseUrl + url, postData, {
                responseType: "blob",
                withCredentials: BaseService.AuthToken && BaseService.AuthToken.length > 0,
                headers: this.getHeaders()
            });

            const disposition = result.headers['content-disposition'];
            let filename = "";

            if (disposition && disposition.indexOf('attachment') !== -1) {
                const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                const matches = filenameRegex.exec(disposition);

                if (matches !== null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }

            const type = result.headers['content-type'];

            let blob;

            if (typeof File === 'function') {
                try {

                    blob = new File([result.data], filename, { type: type });
                } catch (e) { /* Edge */ }
            }
            if (typeof blob === 'undefined') {
                blob = new Blob([result.data], { type: type });
            }

            const URL = window.URL || window.webkitURL;
            const downloadUrl = URL.createObjectURL(blob);

            console.log("filename", filename, type, downloadUrl);

            if (filename) {

                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();

            } else {
                //    window.location.href = downloadUrl;
            }

            setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100);

            return new OperationResult(true, null as unknown as string[]);
        }
        catch (error) {
            return new OperationResult(false, error.response.data.errors || error.response.data || [__("Erreur serveur")]);
        }
    }
}