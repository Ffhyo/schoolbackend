import Exam from '../models/examModel.js';

export const createExam = async (req, res) => {
  try {
    console.log('📝 Received request to create exam:', req.body);
    
    const { name, date, classIds } = req.body;  
    
    if (!name || !date || !Array.isArray(classIds) || classIds.length === 0) {
      return res.status(400).json({ 
        message: 'Name, date, and at least one class ID are required.' 
      });
    }   
    
    const newExam = new Exam({ 
      name: name.trim(),
      date,
      classIds 
    });
    
    await newExam.save();   
    
    // Return the exam with the MongoDB _id
    res.status(201).json({
      id: newExam._id, // Map _id to id for frontend
      name: newExam.name,
      classIds: newExam.classIds,
      date: newExam.date
    });
    
  } catch (error) {
    console.error('❌ Error in createExam:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

export const examDetail = async (req, res) => {
  try {
    const exams = await Exam.find(); // Fixed variable name (exam -> exams)
    
    if (!exams || exams.length === 0) {
      return res.status(404).json({ message: "No exams found" });
    }

    // Send the exams data back to the client
    res.status(200).json({
      success: true,
      data: exams
    });

  } catch (error) {
    console.error('❌ Error in examDetail:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
}

export const examDelete = async (req, res) => {
try{
  const {id} =req.params;
  const deletedExam = await Exam.findByIdAndDelete(id); 
  if(!deletedExam){
    return res.status(404).json({message:"Exam not found"});
  }   
  res.status(200).json({message:"Exam deleted successfully"});
}catch(error){
  console.error('❌ Error in examDelete:', error);
  res.status(500).json({ 
    message: 'Server error', 
    error: error.message 
  }); 

}}