import axios, { AxiosRequestConfig } from 'axios';

export class AxiosService {
    async post(
        url: string,
        data: any,
        headers: any,
        contentType: string = 'application/json'
    ) {
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': contentType,
                ...headers,
            },
        };

        return await axios.post(url, data, config);
    }

    async get(url: string, headers: any) {
        const config: AxiosRequestConfig = {
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
        };

        return await axios.get(url, config);
    }
}
