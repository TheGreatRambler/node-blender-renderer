# node-blender-renderer
A blender renderer that allows you to render a blender file on a remote machine

## Dependencies

* FFMPEG
* Blender (the CLI, use [this link](https://docs.blender.org/manual/en/dev/render/workflows/command_line.html) and add to path)

## Install

`sudo npm install -g node-blender-renderer`

## Running

run `sudo blender-renderer <port>` on the remote machine (for example, a raspberry pi in your network) and navigate to the returned ip address. Upload your `.blend` file there and allow it to process. When it is done, the `.mp4` file will be downloaded to your computer.

### Notes
* Will not work over the internet, only on the local network, unless you do some fancy port forwarding
