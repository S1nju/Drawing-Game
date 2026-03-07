const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Game",
  tableName: "games",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    hostId: {
      type: "uuid",
    },
    status: {
      type: "varchar",
      default: "waiting", // waiting | playing | finished
    },
    maxPlayers: {
      type: "int",
    },
    totalRounds: {
      type: "int",
    },
    turnTime: {
      type: "int", // en secondes
    },
    
  },
 
});