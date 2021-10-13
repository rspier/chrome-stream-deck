/*
Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// make typescript happy with DOM types
/// <reference lib="dom" />

import './contentscript.scss';
import { requestStreamDecks, getStreamDecks, StreamDeckWeb, StreamDeck } from '@elgato-stream-deck/webhid';


// See images/README.md for more on these images.
let front_handImg = new Image();
front_handImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCI+PHJlY3QgZmlsbD0ibm9uZSIgaGVpZ2h0PSIyNCIgd2lkdGg9IjI0Ii8+PHBhdGggZD0iTTE4LjUsOGMtMC4xNywwLTAuMzQsMC4wMi0wLjUsMC4wNVY0LjVDMTgsMy4xMiwxNi44OCwyLDE1LjUsMmMtMC4xOSwwLTAuMzcsMC4wMi0wLjU0LDAuMDZDMTQuNzUsMC44OSwxMy43MywwLDEyLjUsMCBjLTEuMDYsMC0xLjk2LDAuNjYtMi4zMywxLjU5QzkuOTYsMS41Myw5LjczLDEuNSw5LjUsMS41QzguMTIsMS41LDcsMi42Miw3LDR2MC41NUM2Ljg0LDQuNTIsNi42Nyw0LjUsNi41LDQuNUM1LjEyLDQuNSw0LDUuNjIsNCw3IHY4LjVjMCw0LjY5LDMuODEsOC41LDguNSw4LjVzOC41LTMuODEsOC41LTguNXYtNUMyMSw5LjEyLDE5Ljg4LDgsMTguNSw4eiBNMTksMTUuNWMwLDMuNTktMi45MSw2LjUtNi41LDYuNVM2LDE5LjA5LDYsMTUuNVY3IGMwLTAuMjgsMC4yMi0wLjUsMC41LTAuNVM3LDYuNzIsNyw3djVoMlY0YzAtMC4yOCwwLjIyLTAuNSwwLjUtMC41UzEwLDMuNzIsMTAsNHY3aDJWMi41QzEyLDIuMjIsMTIuMjIsMiwxMi41LDJTMTMsMi4yMiwxMywyLjVWMTEgaDJWNC41QzE1LDQuMjIsMTUuMjIsNCwxNS41LDRTMTYsNC4yMiwxNiw0LjV2OC45MmMtMS43NywwLjc3LTMsMi41My0zLDQuNThoMmMwLTEuNjYsMS4zNC0zLDMtM3YtNC41YzAtMC4yOCwwLjIyLTAuNSwwLjUtMC41IHMwLjUsMC4yMiwwLjUsMC41VjE1LjV6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K';
let mic_noneImg = new Image();
mic_noneImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMCAwaDI0djI0SDBWMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTIgMTRjMS42NiAwIDMtMS4zNCAzLTNWNWMwLTEuNjYtMS4zNC0zLTMtM1M5IDMuMzQgOSA1djZjMCAxLjY2IDEuMzQgMyAzIDN6bS0xLTljMC0uNTUuNDUtMSAxLTFzMSAuNDUgMSAxdjZjMCAuNTUtLjQ1IDEtMSAxcy0xLS40NS0xLTFWNXptNiA2YzAgMi43Ni0yLjI0IDUtNSA1cy01LTIuMjQtNS01SDVjMCAzLjUzIDIuNjEgNi40MyA2IDYuOTJWMjFoMnYtMy4wOGMzLjM5LS40OSA2LTMuMzkgNi02LjkyaC0yeiIgZmlsbD0id2hpdGUiLz48L3N2Zz4K';
let mic_offImg = new Image();
mic_offImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMCAwaDI0djI0SDBWMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTAuOCA0LjljMC0uNjYuNTQtMS4yIDEuMi0xLjJzMS4yLjU0IDEuMiAxLjJsLS4wMSAzLjkxTDE1IDEwLjZWNWMwLTEuNjYtMS4zNC0zLTMtMy0xLjU0IDAtMi43OSAxLjE2LTIuOTYgMi42NWwxLjc2IDEuNzZWNC45ek0xOSAxMWgtMS43YzAgLjU4LS4xIDEuMTMtLjI3IDEuNjRsMS4yNyAxLjI3Yy40NC0uODguNy0xLjg3LjctMi45MXpNNC40MSAyLjg2TDMgNC4yN2w2IDZWMTFjMCAxLjY2IDEuMzQgMyAzIDMgLjIzIDAgLjQ0LS4wMy42NS0uMDhsMS42NiAxLjY2Yy0uNzEuMzMtMS41LjUyLTIuMzEuNTItMi43NiAwLTUuMy0yLjEtNS4zLTUuMUg1YzAgMy40MSAyLjcyIDYuMjMgNiA2LjcyVjIxaDJ2LTMuMjhjLjkxLS4xMyAxLjc3LS40NSAyLjU1LS45bDQuMiA0LjIgMS40MS0xLjQxTDQuNDEgMi44NnoiIGZpbGw9IndoaXRlIi8+PC9zdmc+Cg==';
let videocam_offImg = new Image();
videocam_offImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMCAwaDI0djI0SDBWMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNOS41NiA4bC0yLTItNC4xNS00LjE0TDIgMy4yNyA0LjczIDZINGMtLjU1IDAtMSAuNDUtMSAxdjEwYzAgLjU1LjQ1IDEgMSAxaDEyYy4yMSAwIC4zOS0uMDguNTUtLjE4TDE5LjczIDIxbDEuNDEtMS40MS04Ljg2LTguODZMOS41NiA4ek01IDE2VjhoMS43M2w4IDhINXptMTAtOHYyLjYxbDYgNlY2LjVsLTQgNFY3YzAtLjU1LS40NS0xLTEtMWgtNS42MWwyIDJIMTV6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPgo=';
let videocamImg = new Image();
videocamImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMCAwaDI0djI0SDBWMHoiIGZpbGw9Im5vbmUiIC8+PHBhdGggZD0iTTE1IDh2OEg1VjhoMTBtMS0ySDRjLS41NSAwLTEgLjQ1LTEgMXYxMGMwIC41NS40NSAxIDEgMWgxMmMuNTUgMCAxLS40NSAxLTF2LTMuNWw0IDR2LTExbC00IDRWN2MwLS41NS0uNDUtMS0xLTF6IiBmaWxsPSJ3aGl0ZSIgLz48L3N2Zz4K';
let call_endImg = new Image();
call_endImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzQ1NUE2NCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIzLjYyIDExLjI3Yy0yLjAzLTEuNzItNC40Ni0zLTcuMTItMy42OUMxNS4wNiA3LjIxIDEzLjU2IDcgMTIgN3MtMy4wNi4yMS00LjUuNThjLTIuNjYuNjktNS4wOCAxLjk2LTcuMTIgMy42OS0uNDUuMzgtLjUgMS4wNy0uMDggMS40OWwuNjcuNjcgMi4yNiAyLjI2Yy4zMy4zMy44NS4zOSAxLjI1LjEzbDIuNTYtMS42NGMuMjktLjE4LjQ2LS41LjQ2LS44NFY5LjY1QzguOTMgOS4yMyAxMC40NCA5IDEyIDlzMy4wNy4yMyA0LjUuNjV2My42OGMwIC4zNC4xNy42Ni40Ni44NGwyLjU2IDEuNjRjLjQuMjUuOTIuMiAxLjI1LS4xM2wyLjI2LTIuMjYuNjctLjY3Yy40MS0uNDEuMzctMS4xLS4wOC0xLjQ4eiIgZmlsbD0icmVkIi8+PC9zdmc+Cg==';
let ccImg = new Image();
ccImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjRweCIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjRweCIgZmlsbD0iIzAwMDAwMCI+PHBhdGggZD0iTTAgMGgyNHYyNEgwVjB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE5IDRINWMtMS4xMSAwLTIgLjktMiAydjEyYzAgMS4xLjg5IDIgMiAyaDE0YzEuMSAwIDItLjkgMi0yVjZjMC0xLjEtLjktMi0yLTJ6bTAgMTRINVY2aDE0djEyek03IDE1aDNjLjU1IDAgMS0uNDUgMS0xdi0xSDkuNXYuNWgtMnYtM2gydi41SDExdi0xYzAtLjU1LS40NS0xLTEtMUg3Yy0uNTUgMC0xIC40NS0xIDF2NGMwIC41NS40NSAxIDEgMXptNyAwaDNjLjU1IDAgMS0uNDUgMS0xdi0xaC0xLjV2LjVoLTJ2LTNoMnYuNUgxOHYtMWMwLS41NS0uNDUtMS0xLTFoLTNjLS41NSAwLTEgLjQ1LTEgMXY0YzAgLjU1LjQ1IDEgMSAxeiIgZmlsbD0id2hpdGUiLz48L3N2Zz4=';
let cc_offImg = new Image();
cc_offImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDI0IDI0IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0cHgiIGZpbGw9IiMwMDAwMDAiPjxyZWN0IGZpbGw9Im5vbmUiIGhlaWdodD0iMjQiIHdpZHRoPSIyNCIvPjxwYXRoIGQ9Ik0xMywxMGMwLTAuNTUsMC40NS0xLDEtMWgzYzAuNTUsMCwxLDAuNDUsMSwxdjFoLTEuNXYtMC41aC0ydjFMMTMsMTB6IE0xNi41LDEzLjVsMS4yMSwxLjIxQzE3Ljg5LDE0LjUyLDE4LDE0LjI3LDE4LDE0di0xIGgtMS41VjEzLjV6IE04LjgzLDZIMTl2MTAuMTdsMS45OCwxLjk4YzAtMC4wNSwwLjAyLTAuMSwwLjAyLTAuMTZWNmMwLTEuMS0wLjktMi0yLTJINi44M0w4LjgzLDZ6IE0xOS43OCwyMi42MUwxNy4xNywyMEg1IGMtMS4xMSwwLTItMC45LTItMlY2YzAtMC4wNSwwLjAyLTAuMSwwLjAyLTAuMTVMMS4zOSw0LjIybDEuNDEtMS40MWwxOC4zOCwxOC4zOEwxOS43OCwyMi42MXogTTcuNSwxMy41aDJWMTNoMC42N2wtMi41LTIuNUg3LjUgVjEzLjV6IE0xNS4xNywxOEwxMSwxMy44M1YxNGMwLDAuNTUtMC40NSwxLTEsMUg3Yy0wLjU1LDAtMS0wLjQ1LTEtMXYtNGMwLTAuMzIsMC4xNi0wLjU5LDAuNC0wLjc4TDUsNy44M1YxOEgxNS4xN3oiIGZpbGw9IndoaXRlIi8+PC9zdmc+';

// Create a button so we can call requestStreamDeck() -- it requires a user action.
const p = document.createElement("p");
p.textContent = "Stream Deck";
p.id = "sdbutton"
document.body.appendChild(p);

const isMacOS = navigator.appVersion.indexOf("Mac OS") != -1;

// hid isn't yet in the typings, so need to cast it to an any.
if (!("hid" in (navigator as any))) {
    // The WebHID API is not supported.
    alert("WebHID not enabled: Enable at chrome://flags/#enable-experimental-web-platform-features");
}

window.addEventListener("load", async (_) => {
    // attempt to get the previously selected Stream Deck.
    let sds = await getStreamDecks();
    if (sds.length > 0) {
        let sd = sds[0]
        // Temporary workaround for getStreamDecks returning a
        // Promise<Promise<StreamDeckWeb>[]> but claiming to return a
        // Promise<StreamDeckWeb[]>
        sd = await sd;
        await sd.clearPanel()
        // If the buttons don't draw right, put a small sleep here, but the load
        // event should handle it.
        await drawButtons(sd)
        setupHandlers(sd)
    }
});

let clockInterval: number;

let setupHandlers = (sd: StreamDeckWeb) => {
    sd.on('down', (key: number) => {
        console.log(`Key ${key} down`)
        sendButtonKey(key)
        sd.fillKeyColor(key, 255, 0, 0)
    });

    sd.on('up', (key: number) => {
        console.log(`Key ${key} up`)
        drawButton(sd, key)
    });

    // TODO: Do we actually need to handle these events?
    (navigator as any).hid.addEventListener("connect", (_: Event) => {
        console.log("got connect event")
        // Automatically open event.device or warn user a device is available.
    });

    (navigator as any).hid.addEventListener("disconnect", (_: Event) => {
        // Remove |event.device| from the UI.
        console.log("got disconnect event")
    });

    // listen to all click events on the page so we can keep things in sync.
    window.addEventListener("click", () => { drawButtons(sd); })

    if (clockInterval) {
        window.clearInterval(clockInterval);
    }
    // Draw a clock on the top right button.
    clockInterval = window.setInterval(async () => {
        drawButtons(sd);  // this is a good time to make sure buttons are in sync
        drawClock(sd)
    }, 5000)
}

let drawClock = async (sd: StreamDeckWeb) => {
    let now = new Date();
    let h = now.getHours() % 12;
    if (h == 0) {
       h = 12;
    }
    await paintButton(sd, 2, h + ":" + ("0" + now.getMinutes()).substr(-2, 2))
}

let getDevice = async (): Promise<StreamDeckWeb | null> => {
    let sds = await getStreamDecks();
    if (sds.length > 0) {
        return sds[0];
    }
    console.log("couldn't get, so requesting...")
    sds = await requestStreamDecks();
    if (sds.length > 0) {
        return sds[0];
    }
    return null;
}

p.addEventListener("click", async (_) => {
    console.log('got click');
    // attempt to get the previously selected Stream Deck
    let sd = await getDevice()
    if (!sd) {
        console.log("no streamdeck found")
        return
    }
    await sd.clearPanel()
    await drawButtons(sd)
    setupHandlers(sd)
});


// paintButton draws a button with a text label.
let paintButton = async (device: StreamDeck, b: number, text: string, invert = false, bgColor = "red"): Promise<void> => {
    let canvas = document.createElement('canvas')
    canvas.width = device.ICON_SIZE
    canvas.height = device.ICON_SIZE

    // We probably should reuse this instead of creating it each time.
    let ctx = canvas.getContext('2d')
    if (!ctx) {
        console.log("Error getting context.")
        return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (invert) {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    // Start with a font that's 80% as high as the button. maxWidth
    // is used on the stroke and fill calls below to scale down.
    ctx.font = (canvas.height * .8) + 'px "Arial"'
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = 1
    ctx.strokeText(text, 8, 60, canvas.width * .8)
    ctx.fillStyle = 'white'
    ctx.fillText(text, 8, 60, canvas.width * .8)

    let id = ctx.getImageData(0, 0, canvas.width, canvas.height)
    console.log(`painting ${text} on ${b}`)
    return device.fillKeyBuffer(b, Buffer.from(id.data), { format: 'rgba' })
}

// paintButton draws a button with a text label.
let paintButtonImage = async (device: StreamDeck, b: number, image: HTMLImageElement, invert = false, bgColor = "red"): Promise<void> => {
    let canvas = document.createElement('canvas')
    canvas.width = device.ICON_SIZE
    canvas.height = device.ICON_SIZE

    // We probably should reuse this instead of creating it each time.
    let ctx = canvas.getContext('2d')
    if (!ctx) {
        console.log("Error getting context.")
        return
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (invert) {
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    ctx.drawImage(image, canvas.height * .10, canvas.width * .10, canvas.height * .80, canvas.width * .80)

    let id = ctx.getImageData(0, 0, canvas.width, canvas.height)
    console.log(`painting IMAGE on ${b}`)
    return device.fillKeyBuffer(b, Buffer.from(id.data), { format: 'rgba' })
}

// sendButtonKey handles injecting the keyboard event into the document based on
// the buton.
let sendButtonKey = (b: number) => {
    let evt: KeyboardEvent;
    switch (b) {
        case 0:
            // Video: Ctrl-E
            evt = new KeyboardEvent('keydown', { 'keyCode': 69, 'ctrlKey': !isMacOS, 'metaKey': isMacOS });
            document.dispatchEvent(evt);
            break
        // Closed Captions: c (keyCode=67 for Javascript)
        case 1:
            evt = new KeyboardEvent('keydown', { 'keyCode': 67, 'ctrlKey': false, 'metaKey': false });
            document.dispatchEvent(evt);
            break
        // case 2: clock
        case 3:
            // Microphone: Ctrl-D
            evt = new KeyboardEvent('keydown', { 'keyCode': 68, 'ctrlKey': !isMacOS, 'metaKey': isMacOS });
            document.dispatchEvent(evt);
            break
        case 4:
            // Raise Hand
            // (no keyboard shortcut)
            let hand = document.querySelector("button[aria-label*=' hand' i]") as HTMLElement;
            hand?.click()
            break
        case 5:
            // Hangup
            // (no keyboard shortcut) <= there is one in fact with h
            let end = document.querySelector("button[aria-label='Leave call' i]") as HTMLElement;
            end?.click()
            break
        default:
            return
    }
}

let drawButton = async (device: StreamDeckWeb, b: number): Promise<void> => {
    // TODO: do something smarter for different kinds of devices
    let [a, v, h, c] = meetStatus()
    switch (b) {
        case 0:
            return paintButtonImage(device, b, v ? videocam_offImg : videocamImg, v);
        case 1:
            return paintButtonImage(device, b, c ? ccImg : cc_offImg, c, "blue");
        case 2:
            drawClock(device)
            return
        case 3:
            return paintButtonImage(device, b, a ? mic_offImg : mic_noneImg, a)
        case 4:
            if (hasHand()) {
                return paintButtonImage(device, b, front_handImg, !h, "blue")
            }
            return
        case 5:
            if (hasHup()) {
              return paintButtonImage(device, b, call_endImg, false)
            }
            return
        default:
            return device.clearKey(b)
    }
}

let drawButtons = async (device: StreamDeckWeb) => {
    if (!("clearPanel" in device)) {
        console.log("streamdeck not initialized")
        return
    }
    for (let b = 0; b < device.NUM_KEYS; b++) {
        await drawButton(device, b)
    }
}

/*
// keep track of the last retrieved mute values so we can do an optimization and do conditional updates later.
let gA: boolean = false;
let gV: boolean = false;
*/

let hasHand = (): boolean => {
    return document.querySelector("button[aria-label*=' hand' i]") !== null
}

let hasHup = (): boolean => {
    return document.querySelector("button[aria-label='Leave call' i]") !== null
}

let meetStatus = (): [boolean, boolean, boolean, boolean] => {
    // It might be a button, it might be a div.  Look for both.
    let a = document.querySelector("button[aria-label*='ctrl + d' i],div[aria-label*='ctrl + d' i],button[aria-label*='⌘ + d' i],div[aria-label*='⌘ + d' i]")
        ?.getAttribute("data-is-muted") == "true";
    let v = document.querySelector("button[aria-label*='ctrl + e' i],div[aria-label*='ctrl + e' i],button[aria-label*='⌘ + e' i],div[aria-label*='⌘ + e' i]")
        ?.getAttribute("data-is-muted") == "true";
    let h = document.querySelector("button[aria-label*=' hand' i]")
        ?.getAttribute("aria-pressed") !== "true";
    let c = document.querySelector("button[aria-label*=' captions (c)' i]")
        ?.getAttribute("aria-pressed") == "true";    

    //gA = a; gV = v;
    // todo: consider if creating a new array object here is too much overhead
    return [a, v, h, c]
}
