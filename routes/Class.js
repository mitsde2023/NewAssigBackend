// const axios = require('axios');
// const express = require('express');
// const router = express.Router();
// const Class_master = require('../models/Class_Master');
// const Batch_Master = require('../models/Batch_Master');

// async function saveClassData(masterBatchId) {
//   try {
//     const response = await axios.get(`https://mitsde-staging-api.edmingle.com/nuSource/api/v1/masterbatch/${masterBatchId}`, {
//       headers: {
//         'ORGID': 4,
//         'apiKey': '34c376e9a999a96f29b86989d9f4513e',
//       },
//     });
//     const classData = response.data.class.courses_array;
//     for (const classs of classData) {
//       await Class_master.create({
//         batch_id: masterBatchId,
//         course_id: classs.course_id,
//         class_id: classs.class_id,
//       });
//     }
//     console.log(`Class data for masterBatchId ${masterBatchId} has been saved to the database.`);
//   } catch (error) {
//     console.error('API Error:', error.message);
//     // Assuming you have a response object available
//     // res.status(500).json({ error: 'Internal Server Error' });
//   }
// }

// router.post('/saveclassMaster', async (req, res) => {
//   try {
//     const batchIds = await Batch_Master.findAll({ attributes: ['batch_id'], raw: true });
//     const batchIdsArray = batchIds.map((batch) => batch.batch_id);

//     for (const masterBatchId of batchIdsArray) {
//       await saveClassData(masterBatchId);
//     }

//     res.status(200).json({ message: 'Data has been saved to the database.' });
//   } catch (error) {
//     console.error('API Error:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// async function saveClassData(masterBatchIds) {
//     //  const [masterBatchIds] =masterBatchID
//     try {
//         const response = await axios.get(`https://mitsde-api.edmingle.com/nuSource/api/v1/masterbatch/${masterBatchID}`, {
//             headers: {
//                 'orgid': 3,
//                 'apikey': 'c289e35991bdf067370b8db627e6dc80',
//             },
//         });
//         const classData = response.data.class; 
//         for (const classs of classData) {
//           await Class_master.create({
//             batch_id: masterBatchID,
//             course_id: classs.course_id,
//             class_id:classs.class_id,
//           });
//         }
//       res.status(200).json({ message: 'Batch data has been saved to the database.' });
//     } catch (error) {
//       console.error('API Error:', error.message);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
// };




// router.post('/saveclassMaster', async (req, res) => {
//   try {
//     const batchIds = await Batch_Master.findAll({ attributes: ['batch_id'], raw: true });
//     const batchIdsArray = batchIds.map((batch) => batch.batch_id);
//      console.log(batchIdsArray, 3999)
// //    in console  [ 11, 258, 259, 260, 263 ] 3999
//      await saveClassData(batchIdsArray);
//     res.status(200).json({ message: 'Data has been saved to the database.' });
//   } catch (error) {
//     console.error('API Error:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


// module.exports = router;