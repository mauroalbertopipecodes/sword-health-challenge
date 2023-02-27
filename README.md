### NodeJS Pipecodes Boilerplate


# NodeJS + Express + Sequelize (ORM with MySQL)

# Startup

````
Use docker:
Install docker: https://docs.docker.com/get-docker/
Copy .env.example into a .env file and fill the variables
Run
docker build -t pipecodes_nodejs_boilerplate .
docker-compose up --build --force-recreate

To stop just press ctrl+c

OR

1- Install NVM - Node version manager - So you can develop using different versions:
https://dev.to/csituma/install-nvm-on-mac-windows-and-linux-1aj9
1.1- Install MySQL and create the database
2- npm install
3- Copy .env.example into a .env file and fill the variables
4- npm run dev OR npm start
````



`````
npm install -g sequelize-cli
Update the database credentials in config/config.json

Creating a migration
npx sequelize-cli migration:create --name modify_users_add_new_fields

Add the columns in the created migration file:
https://dev.to/nedsoft/add-new-fields-to-existing-sequelize-migration-3527
queryInterface.addColumn

Migrate
npx sequelize-cli db:migrate
`````



