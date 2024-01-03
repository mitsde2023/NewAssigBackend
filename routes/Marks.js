const axios = require("axios");
const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const SubjectClassModel = require("../models/SubjectClassModel");
const FlattenedDataModel = require("../models/FlattenedDataModel");
const All_Students = require("../models/All_Students");
// const BatchModel = require('../models/BatchModel');
const Log = require("../models/Log");
const ApiKey = require("../models/ApiKey");

router.get("/getAllFlattenedData", async (req, res) => {
    try {
        const data = await FlattenedDataModel.findAll();
        res.json(data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/getBatchName/:subjectId", async (req, res) => {
    try {
        const subjectId = req.params.subjectId;

        const subject = await SubjectClassModel.findOne({
            where: { subject_id: subjectId },
        });

        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }

        // const batch = await BatchModel.findOne({
        //     where: { batch_id: subject.batch_id },
        // });

        // if (!batch) {
        //     return res.status(404).json({ message: 'Batch not found' });
        // }

        // res.json({ batch_name: batch.batch_name });
        res.json({ subject });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Student Marks search api ---------------------------------------------------------------------------
router.get("/student-marks", async (req, res) => {
    try {
        const { registration_number, email, user_username, user_id } = req.query;

        // Ensure at least one field is provided
        if (!registration_number && !email && !user_username && !user_id) {
            return res
                .status(400)
                .json({ message: "Please provide at least one search parameter" });
        }

        // Find user data
        const userData = await All_Students.findOne({
            where: {
                [Op.or]: [
                    registration_number && { registration_number },
                    email && { email },
                    user_username && { user_username },
                    user_id && { user_id },
                ].filter(Boolean), // Filter out undefined values
            },
        });

        if (!userData) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find flattened data
        const userFlattenedData = await FlattenedDataModel.findAll({
            where: {
                user_id: userData.user_id, // Assuming the field name in FlattenedDataModel is user_id
            },
        });

        // Combine user data with flattened data
        const result = {
            ...userData.toJSON(),
            flattenedData: userFlattenedData.map((item) => item.toJSON()),
        };

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

//using Subject_id & subject_name Update Data or create ------------------------------------------------

const StudentOneSubjectMarksData = async (subject_id, subject_name) => {
    try {
        const apiKey = await getApiKey();

        const class_id = subject_id;
        const response = await axios.get(
            `https://mitsde-api.edmingle.com/nuSource/api/v1/reports/classprogress?page=1&per_page=3000&class_id=${class_id}`,
            {
                headers: {
                    ORGID: 3,
                    apiKey: apiKey,
                },
            }
        );
        const classReport = response.data.class_report;
        const userMarks = classReport.user_marks;
        const users = classReport.users;

        const uniqueUserIds = new Set();

        users.forEach((user) => uniqueUserIds.add(user[0]));

        for (const userId of uniqueUserIds) {
            const foundUser = users.find((user) => user[0] === userId);

            if (foundUser) {
                const userData = {
                    subject_id: class_id,
                    subject_name: subject_name,
                    user_id: userId,
                    // name: foundUser[1],
                    // userUsername: foundUser[2],
                    assignments: [],
                };

                const userMarksData =
                    userMarks[userId]?.slice(0, 2).map((mark, index) => ({
                        assignment: `Assignment ${index + 1}` || null,
                        mk: mark.mk || null,
                        atmpt: mark.atmpt || null,
                    })) || [];

                if (userMarksData.length > 0) {
                    const [updatedRowsCount] = await FlattenedDataModel.update(
                        { assignments: userMarksData },
                        { where: { user_id: userId, subject_id: class_id } }
                    );

                    if (updatedRowsCount > 0) {
                        console.log(
                            `Subject Marks Data updated successfully for user_id ${userId} and subject_id ${class_id}.`
                        );
                    } else {
                        await FlattenedDataModel.create(userData);
                        console.log(
                            `No matching records found. New record inserted for user_id ${userId} and subject_id ${class_id}.`
                        );
                    }
                } else {
                    console.log(
                        `No data available for user_id ${userId} and subject_id ${class_id}.`
                    );
                }
            }
        }
        console.log("Subject Marks Data updated successfully for all users.");
    } catch (error) {
        console.error("Error updating/inserting subject marks data:", error);
    }
};
router.post(
    "/subject_marks_update/:subject_id/:subject_name",
    async (req, res) => {
        try {
            const subject_id = req.params.subject_id;
            const subject_name = req.params.subject_name;
            console.log(subject_id, subject_name, 239);
            await StudentOneSubjectMarksData(subject_id, subject_name);

            res.json({
                success: true,
                message: "Subject Marks Data saved successfully.",
            });
        } catch (error) {
            console.error("Error updating subject marks data:", error);
            res
                .status(500)
                .json({ success: false, message: "Error saving subject marks data." });
        }
    }
);

const getApiKey = async () => {
    try {
        // Find the first API key that has not expired yet
        const existingApiKey = await ApiKey.findOne({
            where: {
                expiresAt: {
                    [Op.gt]: new Date(),
                },
            },
        });

        if (existingApiKey) {
            // If a valid API key is found, return it
            return existingApiKey.apiKey;
        } else {
            // If no valid API key is found, throw an error or return null/undefined
            throw new Error("No valid API key found");
        }
    } catch (error) {
        // If an error occurs during the process, throw the error
        console.error("Error retrieving API key:", error.message);
        throw error;
    }
};

//function runs every 24 h To update Marks ---------------------------------------------------------------------

const StudentSubjectMarksDataEveryDay = async (data, res) => {
    try {
        const apiKey = await getApiKey();
        for (const item of data) {
            const class_id = item.subject_id;
            const subject_name = item.subject_name;

            try {
                const response = await axios.get(
                    `https://mitsde-api.edmingle.com/nuSource/api/v1/reports/classprogress?page=1&per_page=3000&class_id=${class_id}`,
                    {
                        headers: {
                            ORGID: 3,
                            apiKey: apiKey,
                        },
                    }
                );

                const classReport = response.data.class_report;
                const userMarks = classReport.user_marks;
                const users = classReport.users;
                const uniqueUserIds = new Set();

                // Collect unique user IDs
                users.forEach((user) => uniqueUserIds.add(user[0]));

                const flattenedData = [];

                // Iterate over unique user IDs
                for (const userId of uniqueUserIds) {
                    const userData = {
                        subject_id: class_id,
                        subject_name: subject_name,
                        user_id: userId,
                        // name: "",  // Default value
                        // userUsername: "",  // Default value
                        assignments: [], // Default value
                    };

                    const userMarksData = userMarks[userId]
                        .slice(0, 2)
                        .map((mark, index) => ({
                            assignment: `Assignment ${index + 1}` || null,
                            mk: mark.mk || null,
                            tm: mark.tm || null,
                            atmpt: mark.atmpt || null,
                        }));
                    userData.assignments = userMarksData;
                    flattenedData.push(userData);
                }

                // Iterate over the flattenedData array
                for (const userData of flattenedData) {
                    const { user_id, subject_id } = userData;
                    try {
                        const existingRecord = await FlattenedDataModel.findOne({
                            where: { user_id, subject_id },
                        });

                        if (existingRecord) {
                            await FlattenedDataModel.update(
                                { assignments: userData.assignments },
                                { where: { user_id, subject_id } }
                            );
                        } else {
                            // Create new record
                            await FlattenedDataModel.create(userData);
                            console.log(
                                `No matching records found. New record inserted for user_id ${user_id} and subject_id ${subject_id}.`
                            );
                        }
                    } catch (updateError) {
                        console.error(
                            `Error updating/inserting subject marks data for user_id ${user_id} and subject_id ${subject_id}:`,
                            updateError
                        );
                    }
                }
                console.log(
                    "Subject Marks Data processed successfully for class_id:",
                    class_id
                );
            } catch (error) {
                await Log.create({
                    message: `Error processing class_id ${class_id}: ${error.message}`,
                    level: "update-error",
                });
            }
        }
        return res.status(200).json({
            success: true,
            message: "Subject Marks Data saved/updated successfully for all class_ids",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const fetchDataAndSave = async () => {
    try {
        // Your logic to fetch data and trigger the function goes here
        const subData = await SubjectClassModel.findAll({
            attributes: ["subject_id", "subject_name"],
        });

        if (!subData || subData.length === 0) {
            console.error("No subjects found");
            return;
        }

        const subjectArray = subData.map((subject) => ({
            subject_id: subject.subject_id,
            subject_name: subject.subject_name,
        }));

        await StudentSubjectMarksDataEveryDay(subjectArray);

        console.log("Subject Marks Data saved successfully.");
    } catch (error) {
        console.error("Error fetching or saving subject marks data:", error);
    }
};

// Run the function every 24 hours (86400000 milliseconds)
const interval = 24 * 60 * 60 * 1000;
// const interval = 5000;

// Start the timer
const timer = setInterval(fetchDataAndSave, interval);

// first Time Bulk create All Date ----------------------------------------------------------------------

const StudentSubjectMarksData = async (data, res) => {
    try {
        const apiKey = await getApiKey();

        for (const item of data) {
            const class_id = item.subject_id;
            const subject_name = item.subject_name;

            try {
                const response = await axios.get(
                    `https://mitsde-api.edmingle.com/nuSource/api/v1/reports/classprogress?page=1&per_page=3000&class_id=${class_id}`,
                    {
                        headers: {
                            ORGID: 3,
                            apiKey: apiKey,
                        },
                    }
                );

                const classReport = response.data.class_report;
                const userMarks = classReport.user_marks;
                const users = classReport.users;
                const uniqueUserIds = new Set();

                // Collect unique user IDs
                users.forEach((user) => uniqueUserIds.add(user[0]));

                const flattenedData = [];

                // Iterate over unique user IDs
                for (const userId of uniqueUserIds) {
                    const userData = {
                        subject_id: class_id,
                        subject_name: subject_name,
                        user_id: userId,
                        assignments: [],
                    };

                    const userMarksData = userMarks[userId]
                        .slice(0, 2)
                        .map((mark, index) => ({
                            assignment: `Assignment ${index + 1}` || null,
                            mk: mark.mk || null,
                            tm: mark.tm || null,
                            atmpt: mark.atmpt || null,
                        }));
                    userData.assignments = userMarksData;
                    flattenedData.push(userData);
                }
                await FlattenedDataModel.bulkCreate(flattenedData);
            } catch (error) {
                console.error(`Error processing class_id ${class_id}:`, error);
                await Log.create({
                    message: `Error processing class_id ${class_id}: ${error.message}`,
                    level: "error",
                });
                await delay(30.5 * 60 * 1000);
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

router.post("/student_subject_marks_data", async (req, res) => {
    try {
        const sub_Data = await SubjectClassModel.findAll({
            attributes: ["subject_id", "subject_name"],
        });

        if (!sub_Data || sub_Data.length === 0) {
            return res.status(404).json({ message: "No subjects found" });
        }
        const subjectArray = sub_Data.map((subject) => ({
            subject_id: subject.subject_id,
            subject_name: subject.subject_name,
        }));

        StudentSubjectMarksData(subjectArray);
        res.json({
            success: true,
            message: "Subject Marks Data saved successfully.",
            data: subjectArray,
        });
    } catch (error) {
        console.error("Error fetching batch data:", error);
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
});

// const StudentSubjectMarksData = async (data, res) => {
//     try {
//         for (const item of data) {
//             const class_id = item.subject_id;
//             const subject_name = item.subject_name;

//             try {
//                 const response = await axios.get(`https://mitsde-api.edmingle.com/nuSource/api/v1/reports/classprogress?page=1&per_page=3000&class_id=${class_id}`, {
//                     headers: {
//                         'ORGID': 4,
//                         'apiKey': '34c376e9a999a96f29b86989d9f4513e',
//                     },
//                 });

//                 const classReport = response.data.class_report;
//                 const userMarks = classReport.user_marks;
//                 const users = classReport.users;
//                 const uniqueUserIds = new Set();

//                 // Collect unique user IDs
//                 users.forEach(user => uniqueUserIds.add(user[0]));

//                 const flattenedData = [];

//                 // Iterate over unique user IDs
//                 for (const userId of uniqueUserIds) {
//                     const userData = {
//                         subject_id: class_id,
//                         subject_name: subject_name,
//                         user_id: userId,
//                         // name: "",  // Default value
//                         userUsername: "",  // Default value
//                         assignments: [],  // Default value
//                     };

//                     const userMarksData = userMarks[userId].slice(0, 2).map((mark, index) => ({
//                         assignment: `Assignment ${index + 1}` || null,
//                         mk: mark.mk || null,
//                         atmpt: mark.atmpt || null,
//                     }));
//                     userData.assignments = userMarksData;
//                     flattenedData.push(userData);
//                 }

//                 // Iterate over the flattenedData array
//                 for (const userData of flattenedData) {
//                     const { user_id, subject_id, assignments, subject_name } = userData;
//                     try {
//                         // Use upsert to update or create the record
//                         const [record, created] = await FlattenedDataModel.upsert({
//                             user_id,
//                             subject_id,
//                             subject_name,
//                             assignments,
//                         });
//                     } catch (updateError) {
//                         console.error(`Error upserting subject marks data for user_id ${user_id} and subject_id ${subject_id}:`, updateError);
//                     }
//                 }
//                 console.log('Subject Marks Data processed successfully for class_id:', class_id);
//             } catch (error) {
//                 await Log.create({
//                     message: `Error processing class_id ${class_id}: ${error.message}`,
//                     level: 'error',
//                 });
//                 await delay(30.5 * 60 * 1000);
//             }
//         }
//         return res.status(200).json({
//             success: true,
//             message: 'Subject Marks Data saved/updated successfully for all class_ids',
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: 'Internal Server Error',
//             error: error.message,
//         });
//     }
// };

module.exports = router;
