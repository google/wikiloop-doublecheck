export default ({ $axios, app }) => {
    $axios.onRequest(config => {
        console.log(`DEBUG XXX before rewrite config.baseURL = ${config.baseURL }`);
        console.log(`DEBUG XXX is client: ${process.client}`);
        console.log(`DEBUG XXX is server: ${process.server}`);
        if (process.client) {
            config.baseURL = "";
        } else {
            config.baseURL = `http://${app.$env.HOS}:${app.$env.PORT}`;
        }
        console.log(`DEBUG XXX after rewrite config.baseURL = ${config.baseURL }`);
    });
}
