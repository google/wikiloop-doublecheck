# WikiLoop Battlefiled: Fight vandalisim on WP together
This is a project of Webapp built to allow people to fight vandalism together. See [[[m:WikiProject_WikiLoop]]](https://meta.wikimedia.org/wiki/WikiProject_WikiLoop) for more introduction. The readme in this repository focus on development of the software itself.

## Developers Instruction

### Install & Setup development environment
Step 1, you should install `node`([NodeJS](https://nodejs.org)), `npm`, and we recommend `nvm` to manage versions of your NodeJS runtime and environment.

Step 2, fork and clone this repository. If you are new to [Git](https://git-scm.com/) and [Github](https://github.com), follow [this Git helloworld instruction](https://guides.github.com/activities/hello-world/) by Github

Example of a command to clone a copy.

```sh
git clone https://github.com/xinbenlv/wikiloop-battlefield-vue
```

Step 3, standard npm install 
```sh
cd <dir of your git cloned repository>
npm install 
```

Step 4, setup `.env` file

You should have create a `.env` file containing evironment variables needed by this project used by [`dotenv`](https://www.npmjs.com/package/dotenv). A template has been provided in the `template.env`. Once set, you should do `cp template.env .env` to create such file in the exact name. 

### Reference
The project is based on [VueJS](https://vuejs.org/) and its framework [NuxtJS](https://nuxtjs.org/). To see a full stack diagram for this project. Go to our [StackShare page](day https://stackshare.io/project-wikiloop/battlefield) to learn other technology our stack is based at.
