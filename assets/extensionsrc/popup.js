chrome.cookies.get({url: "https://login.microsoftonline.com", name: "ESTSAUTHPERSISTENT"}, cookie => {
    if (cookie) {
        var cookieb64 = btoa(JSON.stringify({estsauthpersistentval: cookie.value}));
        document.getElementById("cook").value = cookieb64;
        document.getElementById("copyb").onclick = () => {
            navigator.clipboard.writeText(cookieb64).then(() => {
                document.getElementById("copyb").innerText = "Successfully copied!";
            }, () => {
                document.getElementById("copyb").innerText = "Something went wrong, please refer to alternative.";
            });
            document.getElementById("copyb").disabled = true;
        };
    } else {
        document.getElementById("success").style.display = "none";
        document.getElementById("fail").style.display = "block";
    }
});