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

// Create a button so we can call requestStreamDeck() -- it requires a user action.
const p = document.createElement("p");
p.textContent = "Stream Deck";
p.id = "sdbutton"
document.body.appendChild(p);

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
    clockInterval = window.setInterval(async () => { drawClock(sd) }, 5000)
}

let drawClock = async (sd: StreamDeckWeb) => {
    let now = new Date();
    await paintButton(sd, 2, now.getHours() % 12 + ":" + ("0" + now.getMinutes()).substr(-2, 2))
}

let getDevice = async () => {
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
let paintButton = async (device: StreamDeck, b: number, text: string, invert = false): Promise<void> => {
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
        ctx.fillStyle = "red"
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

// sendButtonKey handles injecting the keyboard event into the document based on
// the buton.
let sendButtonKey = (b: number) => {
    let evt: KeyboardEvent;
    switch (b) {
        case 0:
            // Ctrl-E
            evt = new KeyboardEvent('keydown', { 'keyCode': 69, 'ctrlKey': true });
            break
        case 3:
            // Ctrl-D
            evt = new KeyboardEvent('keydown', { 'keyCode': 68, 'ctrlKey': true });
            break
        default:
            return
    }
    document.dispatchEvent(evt);
}

let drawButton = async (device: StreamDeckWeb, b: number): Promise<void> => {
    // TODO: do something smarter for different kinds of devices
    let [a, v] = meetStatus()
    switch (b) {
        case 0:
            return paintButton(device, b, "Camera", v)
        case 3:
            return paintButton(device, b, "Microphone", a)
        case 2:
            // this is the clock, don't update it here
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

let meetStatus = (): [boolean, boolean] => {
    let a = document.querySelector("div[aria-label*='ctrl + d']")
        ?.getAttribute("data-is-muted") == "true";
    let v = document.querySelector("div[aria-label*='ctrl + e']")
        ?.getAttribute("data-is-muted") == "true";
    //gA = a; gV = v;
    // todo: consider if creating a new array object here is too much overhead
    return [a, v]
}