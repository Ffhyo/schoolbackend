import Student from "../models/studentModel.js";
 
export const getlogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for:', username);
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const user = await Student.findOne({ username: username });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // FIXED: Proper password comparison (remove parseInt if password is string)
    // If passwords are hashed, use bcrypt.compare instead
    const isPasswordValid = password === user.password; // Remove parseInt
    
    if (isPasswordValid) {
      return res.status(200).json({
        success: true,
        message: 'success', // Consistent with your frontend expectation
        user: {
          id: user._id || user.id,
          username: user.username,
          // Include other necessary user fields
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};
export const getStudent = async (req,res) =>{
    const house =req.body;
    const students =await  Student.find();
    res.status(200).json({
        success:true,
        data:students
    })
}

export const getStudentByHouse = async (req,res) =>{
    const {house} =req.body;
    console.log(house);
    const students =await  Student.find({house:house});
    res.status(200).json({
        success:true,   
        data:students
    })
}   

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
    } catch (error) {
    res.status(500).json({
        success: false,
        message: 'Error fetching student',
        error: error.message
    });
  }
};
export const getStudentByClass = async (req, res) => {
  try {
    const {Class} = req.params; // 'class' matches the route parameter
    const { section } = req.query;
    
    // Build query object
    const query = {Class: Class };
   
    if (section) {
      query.section = section;
    }
    
    const students = await Student.find(query);
     
    
    if (!students || students.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No students found for this class and section' 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      data: students // Return the array of students
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  } 
};