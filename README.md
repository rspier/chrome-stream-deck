# Elgato Stream Deck Chrome Extension for Google Meet using WebHID

This extension uses [WebHid](https://web.dev/hid) to drive an Elgato Stram Deck
Mini such that it can control Google Meet.

## IMPORTANT - Enable WebHID

You must enable this Chrome flag to enable WebHID:
[chrome://flags/#enable-experimental-web-platform-features](chrome://flags/#enable-experimental-web-platform-features)

Hopefully WebHID will be on by default soon.

## IMPORTANT - dependencies

Requires the code in https://github.com/Julusian/node-elgato-stream-deck/pull/8 to work. (Source: https://github.com/rspier/node-elgato-stream-deck/tree/webhid-next)

Until it is merged:

```shell
# At the same level as the chrome-stream-deck directory:
$ git clone https://github.com/rspier/node-elgato-stream-deck -b webhid-next
```

## Usage

The first time you use the extension, you must click on the (ugly) button and choose your StreamDeck device.  Subsequent times, it will automatically reconnect to the previously selected device.

## Development

```shell
# Make a production build
$ yarn build 

# Development
$ yarn watch
```

## Linux: udev

If you're running this on Linux, you'll need to make sure the device has the right permissions.  

Make sure `/etc/udev/rules.d/99-streamdeck.rules` exists with the following contents:

```udev
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0060", MODE:="664", GROUP="plugdev"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="0063", MODE:="664", GROUP="plugdev"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="006c", MODE:="664", GROUP="plugdev"
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="0fd9", ATTRS{idProduct}=="006d", MODE:="664", GROUP="plugdev"
```

And then run `sudo udevadm control --reload`.

## TODO

* Support Stream Decks that aren't the Stream Deck Mini.
* Popup reminding people to enable WebHID
* Better looking/positioned button

## Disclaimer

This is not an official Google product/project.
