const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Player",
  tableName: "players",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
    },
    name: {
      type: "varchar",
    },
    score: {
      type: "int",
      default: 0, // score initial = 0
    },
    hasGuessedCurrentTurn: {
      type: "boolean",
      default: false, 
    },
  },
  relations: {
    game: {
      type: "many-to-one",
      target: "Game",
      joinColumn: true,
      onDelete: "CASCADE",
    },
  },
});