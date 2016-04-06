# echobot
A sample bot for getting started with Bot Framework

This repo is an example of using Node.js to build a bot, which is hosted on Azure and uses continuous deployment from Github.

Here's how to use this bot as a starter template for your own Node.js based bot:

*note: in the examples below, replace "echobotsample" with your bot ID for any settings or URLs.*

1. Fork this repo.
2. Create an Azure web app.
![](images/azure-create-webapp.png?raw=true)
3. Set up continuous deployment to Azure from your Github repo. You will be asked to authorize Azure access to your GitHub repo, and then choose your branch from which to deploy.
![](images/azure-deployment.png?raw=true)
4. Verify the deployment has completed by visiting the web app. [http://echobotsample.azurewebsites.net/](https://echobotsample.azurewebsites.net/). It may take a minute of two for the initial fetch and build from your repo.
![](images/azure-browse.png?raw=true)
5. [Register your bot with the Bot Framework](http://docs.botframework.com/connector/getstarted/#registering-your-bot-with-the-microsoft-bot-framework) using **https://echobotsample.azurewebsites.net/api/messages** as your endpoint.
6. Enter your Bot Framework App ID and App Secret into Azure settings.
![](images/azure-secrets.png?raw=true)
7. [Test the connection to your bot](http://docs.botframework.com/connector/getstarted/#testing-the-connection-to-your-bot) from the Bot Framework developer portal.

##Testing locally
* git clone this repo.
* npm install
* node ./server.js
* Visit [http://localhost:3978/](http://localhost:3978/) to see the home page.
* Use **http://localhost:3978/api/messages** in the [Bot Framework Emulator](http://docs.botframework.com/connector/tools/bot-framework-emulator/#navtitle)
   
##Helpful hints:
* Your web app will deploy whenever you git push to your repo. Changing the text of your index.html and visiting your homepage is a simple way to see that your latest deployment has been published to Azure.
* Azure "knows" your app is a NodeJs app by the presence of the "server.js" file. Renaming this file may possibly cause Azure to not execute NodeJs code.
* Azure app settings become NodeJS process.env variables.
* Use https when specifying URLs in the Bot Framework developer portal. Your app secret will not be transmitted unless it is secure.
