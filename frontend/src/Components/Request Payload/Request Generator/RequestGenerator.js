import axios from "axios";
import {host, portNumber, requestBodySize} from "../../../App Configurations/SystemSettings";

export const requestGenerator = (httpmethod, endpoint, header, body) => {
    return axios({
        method: httpmethod,
        url: endpoint,
        header: header,
        data: body,
        maxBodyLength: requestBodySize,
        validateStatus:  (status) => {
            return status>=200 && status<300;
        },
        proxy: {
            host: host
        }
    })
        .then(response => response)
        .catch(error => error.response)
}
