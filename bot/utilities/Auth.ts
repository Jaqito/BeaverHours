import fetch from "node-fetch"

export const getAccessToken = async () => {
    const params = `grant_type=client_credentials&client_id=${process.env.BOT_ID}&client_secret=${process.env.BOT_PASSWORD}&scope=https%3A%2F%2Fapi.botframework.com%2F.default`;
    var response = await fetch(
        "https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token",
        {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    const resp = await response.json();
    return resp.access_token;
};

