# PomPomExpress
Final Year Project which is a Honkai Star Rail database, and character optomizer, using node.js as a backend with a mongo.db database, and a react native frontend

## Backend Startup
* In the terminal, go to the backend folder of the project, then run the command `npm install`
* In the terminal, go to the backend folder of the project, then run the command `node ./server.js`

## Frontend Startup
* In the terminal, go to the frontend folder of the project, and run the command `npm install expo --save`
* In the terminal, go to the frontend folder of the project, and run the command `npx expo prebuild`
* In the terminal, go to the frontend folder of the project, and run the command `npx expo start`

## Running project
* Edit all instances of `http://10.202.134.121:3000`, specifically the `10.202.134.121`, with the IPV4 that is shown by running  `ipconfig` in the console
  * These are are in:
   * `backend\server.js`
   * `frontend\contexts\AuthContext.tsx`
   * `frontend\app\(tabs)\characterScreen.tsx`
   * `frontend\app\(tabs)\lightConScreen.tsx`
   * `frontend\app\(tabs)\calculatorScreen.tsx`
   * `frontend\app\(tabs)\optimizerScreen.tsx`
* Try to use the expo application to on a mobile device to run the program by scannign the QR code
* If that does not work then you should download Android Studio, create a mobile emulator, run the emulator, and press `a` on the console running the frontend of the application
