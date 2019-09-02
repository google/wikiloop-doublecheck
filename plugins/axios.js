export default ({ $axios, $env }) => {
    $axios.onRequest(config => {
        console.log(`AXIOS Config ${JSON.stringify(config, null, 2)}`);
    });
}
