# Tick, a queue management system

This is a queue management system for a small business. It is built with Electron, express, React and Socket.io.
After starting the packaged application, it will start an express server.
The interface can be accessed from the App or from a browser in the same network.

It provides the ability to create different queues, and display them together or separately on one or more screens.
There is a web interface meant to be accessed from computers within the network, from where the queues can be managed: Workers can call the next customer, or send a message.

Build with `npx electron-builder --windows nsis:ia32`