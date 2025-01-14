# Logbench

Logbench is an Electron app where you can send local JSON-serialized logs to. This is useful if you want a more persistent replacement for `console.log`.

The documentation is work in progress, but to get started you can follow the instructions below.

## Download the app

Go to [Releases](https://github.com/albingroen/Logbench/releases) and download the latest version of the app for your architecture. Currently only macOS Arm is supported.

## Download the worker

In order for Logbench to receive logs, you need to run the worker. The [worker](https://github.com/albingroen/Logbench/tree/main/worker) is a Node.js server that listens for logs and sends them to the Logbench app over Websockets. It stores the logs in a local SQLite database. It never contacts the internet. Don't trust me? [Read the code](https://github.com/albingroen/Logbench/blob/b4809167530f0dd196fed5bc548f0be39edfc30e/worker/src/index.ts#L113-L160).
