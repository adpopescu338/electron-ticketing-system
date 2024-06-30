# Tick, a versatile Queue Management System

This is a queue management system suitable for a range of scenarios. It is built with Electron, express, React and Socket.io.
After starting the packaged application, it will start an express server.
The interface can be accessed from the App or from a browser in the same network.

It provides the ability to create different queues, and display them together or separately on one or more screens.
There is a web interface meant to be accessed from computers within the network, from where the queues can be managed: Workers can call the next customer, or send a message.

## Installation

Clone the repository and run `yarn install` to install the dependencies.
Then run `yarn dev` to start the development server.

## Packaging

Run `yarn build` to build the application.
Run `yarn package` to package the application.
