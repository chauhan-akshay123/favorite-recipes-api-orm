let { DataTypes, sequelize } = require('../lib/');

let recipe = sequelize.define("recipe", {
 title: DataTypes.STRING,
 chef: DataTypes.STRING,
 cuisine: DataTypes.STRING,
 preparationTime: DataTypes.INTEGER,
 instructions: DataTypes.STRING
});

module.exports = {
    recipe,
};