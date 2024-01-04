const express = require('express');
const app = express();
const xlsx = require('xlsx');
const multer = require('multer');
const cors = require('cors');
const Course_Subject_routes = require('./routes/Course_Subject');

// const Class_Routes=require('./routes/Class')
const Student_Routes = require('./routes/Student')
const Marks_Routes = require("./routes/Marks")
const sequelize = require('./config');
const FlippedStudent = require('./models/FlippedStudent');
const StudentSubCode = require('./models/SubjectCode');
const FlattenedDataModel = require('./models/FlattenedDataModel');
const All_Students = require('./models/All_Students');
const StudentSubWiseMarks = require('./models/StudentSubWiseMarks.js');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const FlattenedDataModel = require('./models/FlattenedDataModel');
app.use(cors());
app.use(express.json());

// app.use(cors({ origin: 'http://localhost:3000' }));


sequelize.sync().then(() => {
  console.log('Database synced.');
});

app.use('/api/course', Course_Subject_routes);
// app.use('/api/batch', Batch_Routes);
// app.use('/api/class', Class_Routes)
app.use('/api/student', Student_Routes)
app.use('/api/marks', Marks_Routes)

app.post('/save_flipped_students', upload.single('excelFile'), async (req, res) => {
  try {
    // Check if an Excel file is provided
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Excel file not provided.' });
    }

    // Read the Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const excelData = workbook.Sheets[sheetName];

    // Save flipped students data using the module
    const result = await saveFlippedStudentsData(excelData);

    res.json({ success: true, message: 'Flipped students data saved successfully.', result });
  } catch (error) {
    console.error('Error processing flipped students data:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});


app.post('/saveSubjectCode', upload.single('excelFile'), async (req, res) => {
  try {
    // Check if an Excel file is provided
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Excel file not provided.' });
    }

    // Read the Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const excelData = workbook.Sheets[sheetName];

    const result = await saveSubjectCode(excelData);

    res.json({ success: true, message: 'Flipped students data saved successfully.', result });
  } catch (error) {
    console.error('Error processing flipped students data:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
  }
});

const saveSubjectCode = async (excelData) => {
  try {
    // Convert Excel data to JSON
    const jsonData = xlsx.utils.sheet_to_json(excelData);
    console.log('JSON Data:', jsonData);

    // Save each student to the database
    for (const SubjectData of jsonData) {
      try {
        await StudentSubCode.create(SubjectData);
      } catch (error) {
        console.error('Error creating student:', error);
      }
    }
    return { success: true, message: 'Flipped students data saved successfully.' };
  } catch (error) {
    console.error('Error saving flipped students data:', error.message);
    throw error;
  }
};

const saveFlippedStudentsData = async (excelData) => {
  try {
    // Convert Excel data to JSON
    const jsonData = xlsx.utils.sheet_to_json(excelData);
    console.log('JSON Data:', jsonData);

    // Save each student to the database
    for (const studentData of jsonData) {
      try {
        await FlippedStudent.create(studentData);
      } catch (error) {
        console.error('Error creating student:', error);
      }
    }
    return { success: true, message: 'Flipped students data saved successfully.' };
  } catch (error) {
    console.error('Error saving flipped students data:', error.message);
    throw error;
  }
};

app.get('/flipped_students', async (req, res) => {
  try {
    const flippedStudents = await FlippedStudent.findAll();
    res.json({ success: true, flippedStudents });
  } catch (error) {
    console.error('Error fetching flipped students:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

app.get('/subject_codes', async (req, res) => {
  try {
    const subjectCodes = await StudentSubCode.findAll();
    res.json({ success: true, subjectCodes });
  } catch (error) {
    console.error('Error fetching subject codes:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



const StudentSubjectWiseData = async () => {
  try {
    // Fetch marks data
    const marksData = await FlattenedDataModel.findAll();
    console.log(marksData, 148);

    // Fetch students data
    const studentsData = await All_Students.findAll();
    console.log(studentsData, 152);

    const subjectCodes = await StudentSubCode.findAll();
    console.log(subjectCodes, 155);

    // const flippedStudent = await FlippedStudent.findAll();
    // console.log(flippedStudent, 158);

    // Normalize function to convert to lowercase and remove spaces
    const normalizeString = (str) => str.toLowerCase().replace(/\s/g, '');

    // Map over marksData and combine with studentsData
    const combinedData = marksData.map((marksItem) => {
      const matchingStudent = studentsData.find(
        (student) => student.user_id === marksItem.user_id
      );

      return {
        ...marksItem.dataValues,
        registration_number: matchingStudent
          ? matchingStudent.registration_number
          : "SWM Reg_No NF",
        email: matchingStudent ? matchingStudent.email : "SWM Email NF",
        name: matchingStudent ? matchingStudent.name : "SWM name NF",
      };
    });

    console.log(combinedData, 165);

    const finalData = combinedData.map((item) => {
      const normalizedItemName = normalizeString(item.subject_name);
      const matchingSubjectName = subjectCodes.find(
        (sub) => normalizeString(sub.Subject) === normalizedItemName
      );

      return {
        ...item,
        subject_code: matchingSubjectName ? matchingSubjectName.Code : "Subject Name Not Match",
      };
    });

    await StudentSubWiseMarks.bulkCreate(finalData);
    console.log('Data saved successfully.');
  } catch (error) {
    console.error('Error fetching or saving data:', error);
  }
};


// StudentSubjectWiseData();


app.get('/api/studentSubWiseMarks', async (req, res) => {
  try {
    const marksData = await StudentSubWiseMarks.findAll();
    res.json(marksData);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/studentSubWiseMarks/calloperation', async (req, res) => {
  try {
    // res.json(marksData);
    await StudentSubjectWiseData();
    await  UpdateStudentSubjectWiseData();
    res.json("operation done...");

  } catch (error) {
    console.error('Error fetching or saving data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const UpdateStudentSubjectWiseData = async () => {
  try {
    // Fetch all records from FlippedStudent
    const flippedStudents = await FlippedStudent.findAll();
    console.log(flippedStudents, 158);

    // Fetch all records from StudentSubWiseMarks
    const studentFinalData = await StudentSubWiseMarks.findAll();
    console.log(studentFinalData);

    // Update subject_code for each registrationNo in StudentSubWiseMarks
    for (const flippedStudent of flippedStudents) {
      const { registrationNo } = flippedStudent;

      // Find all records with matching registration_number
      const matchingRecords = studentFinalData.filter(
        (record) => record.registration_number === registrationNo
      );

      // Update subject_code for each matching record
      for (const record of matchingRecords) {
        const existingSubjectCode = record.subject_code;
        const modifiedSubjectCode = `F${existingSubjectCode}`;

        // Update the subject_code in the database
        await StudentSubWiseMarks.update(
          { subject_code: modifiedSubjectCode },
          { where: { id: record.id } }
        );
      }
    }
    console.log('Data updated successfully.');
  } catch (error) {
    console.error('Error updating data:', error);
  }
};

// Call the update function
// UpdateStudentSubjectWiseData();

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
