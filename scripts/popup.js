var WebsiteUrl;
var WebsiteHostName;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    WebsiteUrl = tabs[0].url
    WebsiteHostName = new URL(tabs[0].url).hostname

    document.getElementById("url").innerText = WebsiteHostName
})


function ShowError(text) {
    var div = document.createElement('div');
    div.setAttribute('id', 'ERRORcontainer');
    div.innerHTML = `
                <div class="ERROR">
                    <p>${text}</p>     
                </div>`
    document.getElementsByClassName("bottomItem")[0].appendChild(div)

    setTimeout(() => {
        document.getElementById("ERRORcontainer").remove()
    }, 3000)
}


document.getElementById("btn").addEventListener("click", () => {
    chrome.storage.local.get("BlockedUrls", (data) => {
        console.log(data);
    })

    if (WebsiteUrl.toLowerCase().includes("chrome://")) {
        ShowError("You cannot block a chrome URL")
    }
    else {
        chrome.storage.local.get("BlockedUrls", (data) => {
            if (data.BlockedUrls === undefined) {
                chrome.storage.local.set({ BlockedUrls: [{ status: "In_Progress", url: WebsiteHostName }] })
                chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        { from: "popup", subject: "startTimer" }
                    );
                });
                console.log("lol");
                setTimeout(() => {
                    var then = new Date();
                    then.setHours(24, 0, 0, 0);
                    const blockTill = then.getTime()

                    chrome.storage.local.set({
                        BlockedUrls: [{
                            status: "BLOCKED", url: WebsiteHostName, BlockTill: blockTill
                        }]
                    })
                }, 2000);

            }
            else {
                
                if (data.BlockedUrls.some((e) => e.url === WebsiteHostName && e.status === "In_Progress")) {
                    ShowError("This URL will be completely blocked after some time")
                }
                else if (data.BlockedUrls.some((e) => e.url === WebsiteHostName && e.status === "BLOCKED")) {
                    ShowError("This URL is Blocked completely")
                }
                else {
                    var then = new Date();
                    then.setHours(24, 0, 0, 0);
                    const blockTill = then.getTime()
                    chrome.storage.local.set({ BlockedUrls: [...data.BlockedUrls, { status: "In_Progress", url: WebsiteHostName,BlockTill: blockTill }] })
                    console.log("lol1");
                    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            { from: "popup", subject: "startTimer" }
                        );
                    });
                    setTimeout(() => {
                        chrome.storage.local.get("BlockedUrls", (data) => {
                            var arr=data.BlockedUrls;
                            arr.forEach((e, index) => {
                                if (e.url === WebsiteHostName && e.status === 'In_Progress') {
                                    var then = new Date();
                                    then.setHours(24, 0, 0,0);
                                    const blockTill = then.getTime()
                                    arr[index].status="BLOCKED";
                                    arr[index].BlockTill=blockTill;
                                }
                            })
                            chrome.storage.local.set({ BlockedUrls:arr})
                        })


                    }, 2000);
                }
            }
        })

    }


})