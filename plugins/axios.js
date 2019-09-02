export default ({ $axios, app }) => {
    $axios.onRequest(config => {
        if (process.client) {
            config.baseURL = "";
        } else {
            config.baseURL = `http://${app.$env.HOST}:${app.$env.PORT}`;
        }
    });
}
