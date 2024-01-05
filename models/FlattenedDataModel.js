const { DataTypes } = require('sequelize');
const sequelize = require('../config'); // Update with your database configuration
// const AllStudents = require('./All_Students');

const FlattenedDataModel = sequelize.define('FlattenedDataModel', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    // program_name: {
    //     type: DataTypes.STRING,
    //     allowNull: true
    // },
    // batch_name: {
    //     type: DataTypes.STRING,
    //     allowNull: true
    // },
    subject_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },

    // name: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    // },
    // userUsername: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    // },

    assignments: {
        type: DataTypes.JSON, // Assuming assignments is an array of objects
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
});

module.exports = FlattenedDataModel;
