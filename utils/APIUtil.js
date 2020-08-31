const axios = require('axios').default;

exports.fetchToken = estsAuthPersistent => new Promise(async (resolve, reject) => {
    const res = await axios.get("https://login.microsoftonline.com/36f7beb6-5478-4b30-8d4c-04155d250604/oauth2/authorize?response_type=token&client_id=5e3ce6c0-2b1f-4285-8d4b-75ee78787346&resource=https%3A%2F%2Fchatsvcagg.teams.microsoft.com", {
        headers: {
            Cookie: "ESTSAUTHPERSISTENT=" + estsAuthPersistent
        },
        maxRedirects: 1
    });
    switch (res.status) {
        case 200: resolve(res); break;
        case 401: reject(res); break;
        default: reject(res);
    }
});

exports.fetchClassInformation = token => new Promise(async (resolve, reject) => {
    const res = await axios.get("https://teams.microsoft.com/api/csa/api/v1/teams/users/me?isPrefetch=false&enableMembershipSummary=true", {
        headers: {
            Authorization: "Bearer " + token
        }
    });
    switch (res.status) {
        case 200: resolve(res.data.data); break;
        case 401: throw new Error(res);
        default: throw new Error(res);
    }
});