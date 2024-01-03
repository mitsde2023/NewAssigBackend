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

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
