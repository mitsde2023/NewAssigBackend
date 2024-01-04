const axios = require('axios');
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
// const StudentModel = require('../models/StudentModel');
const SubjectClassModel = require('../models/SubjectClassModel');
const AllStudentModel = require('../models/All_Students');
const BatchModel = require('../models/BatchModel');
const ApiKey = require('../models/ApiKey');
const Log = require('../models/Log');



// const  StudentSubjectData= async (arr) => { 
//   try {
//     // need following fileds extract from arr
//     const class_id = req.params.class_id;  
//     const master_batch_id = req.params.master_batch_id;

//     const response = await axios.get(`https://mitsde-staging-api.edmingle.com/nuSource/api/v1/masterbatch/classstudents?class_id=${class_id}&master_batch_id=${master_batch_id}&page=1&per_page=3000`, {
//       headers: {
//         'orgid': 4,
//         'apikey': '34c376e9a999a96f29b86989d9f4513e',
//       },
//     });

//     const students = response.data.students
//     const classes = response.data.class.class;

//     for (const classData of classes) {
//       await SubjectClassModel.create({
//         subject_id: classData.class_id,
//         subject_name: classData.class_name,
//         program_id: master_batch_id,
//         batch_id: class_id,
//         start_date: classData.class_start,
//         end_date: classData.class_end
//       });
//     }

//     for (const student of students) {
//       await StudentModel.create({
//         user_id: student.user_id,
//         registration_number: student.registration_number,
//         name: student.name,
//         email: student.email,
//         program_id: master_batch_id,
//         batch_id: class_id,
//         user_name: student.user_name,
//         user_username: student.user_username,
//         contact_number: student.contact_number,
//       });
//     }

//     res.status(201).json({ message: 'Data saved successfully.' });
//   } catch (error) {
//     console.error('API Error:', error.message);
//     // res.status(500).json({ error: 'Internal Server Error' });
//   }

// }


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const StudentSubjectData = async (data) => {
  try {
    const apiKey = await getApiKey();

    for (const item of data) {
      const class_id = item.class_id;
      const master_batch_id = item.master_batch_id;

      try {
        const response = await axios.get(`https://mitsde-api.edmingle.com/nuSource/api/v1/masterbatch/classstudents?class_id=${class_id}&master_batch_id=${master_batch_id}&page=1&per_page=3000`, {
          headers: {
            'orgid': 3,
            'apikey': apiKey,
          },
        });

        // const students = response.data.students;
        const classes = response.data.class.class;

        if (!classes || classes.length === 0) {
          console.warn(`No classes found for class_id: ${class_id}`);
          continue;  // Move to the next iteration if no classes are found
        }

        for (const classData of classes) {
          await SubjectClassModel.findOrCreate({
            where: { subject_id: classData.class_id },
            defaults: {
              subject_id: classData.class_id,
              subject_name: classData.class_name,
              program_id: master_batch_id,
              batch_id: class_id,
              start_date: classData.class_start,
              end_date: classData.class_end,
            },
          });
        }

        // for (const student of students) {
        //   await StudentModel.findOrCreate({
        //     where: { user_id: student.user_id },
        //     defaults: {
        //       user_id: student.user_id,
        //       registration_number: student.registration_number,
        //       name: student.name,
        //       email: student.email,
        //       program_id: master_batch_id,
        //       batch_id: class_id,
        //       user_name: student.user_name,
        //       user_username: student.user_username,
        //       contact_number: student.contact_number,
        //     },
        //   });
        // }

        console.log(`Data saved successfully for class_id: ${class_id}`);
      } catch (error) {
        console.error(`Error processing class_id ${class_id}:`, error.message);
        await delay(30.5 * 60 * 1000);
        continue;
      }
    }

    console.log('Data saved successfully for all master_batch_ids.');
  } catch (error) {
    console.error('Error processing data:', error.message);
    // You can add more specific error handling based on the type of error received
  }
};


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
      throw new Error('No valid API key found');
    }
  } catch (error) {
    // If an error occurs during the process, throw the error
    console.error('Error retrieving API key:', error.message);
    throw error;
  }
};

router.post('/student_subject_data', async (req, res) => {
  try {
    const batchData = await BatchModel.findAll({
      attributes: ['batch_id', 'program_id'],
    });
    const batchArray = batchData.map((batch) => ({
      class_id: batch.batch_id,
      master_batch_id: batch.program_id,
    }));
    StudentSubjectData(batchArray);
    res.status(201).json({ message: 'Data saved successfully.' });

  } catch (error) {
    console.error('Error fetching batch data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})


async function saveSubjDataToDatabase() {
  try {
    const apiKey = await getApiKey();

    const response = await axios.get(`https://mitsde.edmingle.com/nuSource/api/v1/short/masterbatch?status=0&batch_period=5&page=1&per_page=3000&search=&organization_id=4`, {
      headers: {
        'orgid': 3,
        'apikey': apiKey,
      },
    });
    const apiResponse = response.data
    // Loop through courses in the API response
    for (const course of apiResponse.courses) {
      const { bundle_id, batch, bundle_name } = course;

      // Loop through batches in the course
      for (const batchInfo of batch) {
        const { class_id, classes, class_name } = batchInfo;

        // Loop through classes in the batch
        for (const classInfo of classes) {
          const [
            subject_id,
            mahesh_id,
            ganesh_id,
            // Add other fields as needed based on your SubjectClassModel
            tutor_id,
            tutor_name,
            subject_name,
          ] = classInfo;
          console.log(class_id, subject_id, class_name, bundle_name, subject_name, bundle_id)
          // Extract relevant data and create/update records in the database
          await SubjectClassModel.findOrCreate({
            where: { subject_id, program_id: bundle_id, batch_id: class_id },
            defaults: {
              program_id: bundle_id,
              program_name: bundle_name,
              batch_name: class_name,
              batch_id: class_id,
              subject_id,
              subject_name,
              tutor_name
            }

          });
        }
      }
    }

    console.log('Data saved successfully.');
  } catch (error) {
    console.error('Error saving data to the database:', error);
  }
}
router.post('/All_student_subject_data', async (req, res) => {
  try {
    saveSubjDataToDatabase();
    res.status(201).json({ message: 'Data saved successfully.' });

  } catch (error) {
    console.error('Error fetching batch data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

})

router.get('/subject-class', async (req, res) => {
  try {
    const subjectClassData = await SubjectClassModel.findAll();
    res.json(subjectClassData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// router.post('/student_subject_data/:class_id/:master_batch_id', async (req, res) => {
//   try {
//     const class_id = req.params.class_id;
//     const master_batch_id = req.params.master_batch_id;

//     const response = await axios.get(`https://mitsde-staging-api.edmingle.com/nuSource/api/v1/masterbatch/classstudents?class_id=${class_id}&master_batch_id=${master_batch_id}&page=1&per_page=3000`, {
//       headers: {
//         'orgid': 4,
//         'apikey': '34c376e9a999a96f29b86989d9f4513e',
//       },
//     });

//     const students = response.data.students
//     const classes = response.data.class.class;

//     for (const classData of classes) {
//       await SubjectClassModel.create({
//         subject_id: classData.class_id,
//         subject_name: classData.class_name,
//         program_id: master_batch_id,
//         batch_id: class_id,
//         start_date: classData.class_start,
//         end_date: classData.class_end
//       });
//     }

//     for (const student of students) {
//       await StudentModel.create({
//         user_id: student.user_id,
//         registration_number: student.registration_number,
//         name: student.name,
//         email: student.email,
//         program_id: master_batch_id,
//         batch_id: class_id,
//         user_name: student.user_name,
//         user_username: student.user_username,
//         contact_number: student.contact_number,
//       });
//     }

//     res.status(201).json({ message: 'Data saved successfully.' });
//   } catch (error) {
//     console.error('API Error:', error.message);
//     // res.status(500).json({ error: 'Internal Server Error' });
//   }
// });



router.post('/bulk_create_save_All_Students', async (req, res) => {
  try {
    const apiKey = await getApiKey();
    const response = await axios.get(`https://mitsde-api.edmingle.com/nuSource/api/v1/organization/students?organization_id=2&search=&is_archived=0&page=1&per_page=50000`, {
      headers: {
        'orgid': 3,
        'apikey': apiKey,
      },
    });
    const studentsData = response.data.students;
    const createdStudents = await AllStudentModel.bulkCreate(studentsData);
    res.json({ code: 200, message: 'Success', createdStudents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: 'Internal Server Error' });
  }
});


router.post('/daly_update/save_All_Students', async (req, res) => {
  try {
    const apiKey = await getApiKey();
    const response = await axios.get(`https://mitsde-api.edmingle.com/nuSource/api/v1/organization/students?organization_id=2&search=&is_archived=0&page=1&per_page=50000`, {
      headers: {
        'orgid': 3,
        'apikey': apiKey,
      },
    });
    const studentsData = response.data.students;

    // Iterate over studentsData and upsert each student
    for (const student of studentsData) {
      await AllStudentModel.upsert(student, { where: { user_id: student.user_id } });
    }

    res.json({ code: 200, message: 'Success' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: 'Internal Server Error' });
  }
});

const updateAllStudents = async () => {
  try {
    const apiKey = await getApiKey();
    const response = await axios.get(`https://mitsde-api.edmingle.com/nuSource/api/v1/organization/students?organization_id=2&search=&is_archived=0&page=1&per_page=50000`, {
      headers: {
        'orgid': 3,
        'apikey': apiKey,
      },
    });
    const studentsData = response.data.students;

    // Iterate over studentsData and upsert each student
    for (const student of studentsData) {
      await AllStudentModel.upsert(student, { where: { user_id: student.user_id } });
    }
    await Log.create({
      message: `Error updating Student`,
      level: "Every-day-Student-Update-error",
    });
  } catch (error) {
    console.error('Error updating all students data:', error);
  }
};


// setInterval(() => {
//   updateAllStudents();
// }, 24 * 60 * 60 * 1000);

router.get('/getAllStudents', async (req, res) => {
  try {
    const data = await AllStudentModel.findAll();
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;