# node-blenderrenderer
A blender renderer that allows you to render a blender file on a remote machine

## Dependencies

* FFMPEG
* Blender (the CLI, use [this link](https://docs.blender.org/manual/en/dev/render/workflows/command_line.html) and add to path)

## Install

`sudo npm install -g node-blender-renderer`

## Running

run `blender-renderer` and navigate to the returned ip address (on the same network). Upload your `.blend` file there and allow it to process.
