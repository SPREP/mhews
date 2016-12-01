module.exports = {
  servers: {
    one: {
      host: '52.196.21.207',
      username: 'nrjmata',
      pem: '/Users/nrjmata/.ssh/id_rsa'
      // password:
      // or leave blank for authenticate from ssh-agent
    }
  },

  meteor: {
    name: 'mhews',
    path: '../',
    docker: {
      image: 'abernix/meteord:base'
    },
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
      debug: true,
    },
    env: {
      ROOT_URL: 'http://52.196.21.207:8080',
      PORT: "8080",
      MONGO_URL: 'mongodb://localhost/meteor'
    },

    //dockerImage: 'kadirahq/meteord'
    deployCheckWaitTime: 60
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};
