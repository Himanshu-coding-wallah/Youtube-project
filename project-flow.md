# Production Code Of Backend
- do `npm init` in root folder
- intall nodemon `npm install --save-dev nodemon `
- intall prettier `npm install -D prettier `
- intall mongoose `npm install mongoose`
- intall dotenv `npm install dotenv `
- intall express `npm install express `
- create `.env`
- create `.gitignore`
- create `.prettierrc`
- create `.prettierignore`
- in scripts , 
```js
"dev": "nodemon src/index.js"
```
>NOTE -->   
> - Nodemon restart the server automatically when we save the changes. it is a dev dependencry i.e. it do not go into production  
> - add content in .gitignore from website like gitignore generator  
> - prettier is used to follow the same formatting among the peers
## 1. Folder Setup
in `src`, 
- folders  
    - `controller`  
    - `db`  
    - `middlewares`  
    - `routes`  
    - `utils`  
    - `models`  

- files   
    - `app.js`
    - `index.js`
    - `constants.js`

## Database connection
- Create cluster in mongodb atlas  
- Copy string provided by the mongo and paste that in .env by the varibale MONGODB_URI
`MONGODB_URI=mongodb+srv://Himanshu:Himanshu123@cluster0.fw3kydq.mongodb.net`  
- In constants.js, add the database name and export it  
`export const DB_NAME = "project-Youtube"`   
> NOTE--> database is in other continent, use async await and try catch  
---
```js

// First approach -> we can write database code in index  

import mongoose from "mongoose"
import express from "express"
import { DB_NAME } from "../constants.js"
;(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error)=>{
            console.log("error in express while connecting to database", error)
            throw error
        })
        
        app.listen(process.env.PORT, ()=>{
            console.log(`App is listening on port ${process.env.PORT}`)
        })


    } catch (error) {
        console.log("error in database connection is: ", error)
    }
})()

```
---
```js
// Second approach -> We can write database code in db folder than import it to index  

// constants.js -- src folder
export const DB_NAME = "project-Youtube"



// dbconnection.js -- db folder

import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"


const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)       
        console.log(`MongoDB connected || DB host: ${connectionInstance.connection.host}`) 
    } catch (error) {
        console.log("error in database connection--> ", error)
        process.exit(1)
        // this process is the process that is currently running in node
    }
}

export default connectDB


// index.js -- src folder
import dotenv from "dotenv"
dotenv.config()
import connectDB from "./db/dbConnection.js"

connectDB()

```
---

