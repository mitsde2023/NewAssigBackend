const express = require('express');
const app = express();

const cors = require('cors');
const Course_Subject_routes = require('./routes/Course_Subject');

// const Class_Routes=require('./routes/Class')
const Student_Routes=require('./routes/Student')
const Marks_Routes=require("./routes/Marks")
const sequelize = require('./config');
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
app.use('/api/marks', Marks_Routes )



const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
