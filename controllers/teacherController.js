import teacherModel  from "../models/teacherModel.js";
import bcrypt from 'bcryptjs';
export const createTeacher = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      username,
      password,
      employeeId,
      subject,
      subjects,
      gradeLevels,
      qualification,
      experience,
      specialization,
      employmentType,
      joinDate,
      salary,
      department,
      address,
      emergencyContact,
      schedule,
      permissions,
      isActive,
      status
    } = req.body;

    // Check if teacher already exists with email or username
    const existingTeacher = await teacherModel.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingTeacher) {
      return res.status(400).json({
        message: 'Teacher already exists with this email or username'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create teacher object
    const teacherData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      username: username.toLowerCase().trim(),
      password: hashedPassword,
      employeeId: employeeId || '',
      subject: subject.trim(),
      subjects: subjects || [],
      gradeLevels: gradeLevels || [],
      qualification: qualification || '',
      experience: experience || 0,
      specialization: specialization || '',
      employmentType: employmentType || 'full-time',
      joinDate: joinDate ? new Date(joinDate) : new Date(),
      salary: salary || 0,
      department: department || '',
      address: {
        street: address?.street || '',
        city: address?.city || '',
        state: address?.state || '',
        zipCode: address?.zipCode || '',
        country: address?.country || ''
      },
      emergencyContact: {
        name: emergencyContact?.name || '',
        relationship: emergencyContact?.relationship || '',
        phone: emergencyContact?.phone || ''
      },
      schedule: {
        monday: schedule?.monday || [],
        tuesday: schedule?.tuesday || [],
        wednesday: schedule?.wednesday || [],
        thursday: schedule?.thursday || [],
        friday: schedule?.friday || [],
        saturday: schedule?.saturday || [],
        sunday: schedule?.sunday || []
      },
      permissions: {
        canGradeStudents: permissions?.canGradeStudents ?? true,
        canTakeAttendance: permissions?.canTakeAttendance ?? true,
        canCreateAssignments: permissions?.canCreateAssignments ?? true,
        canViewAllStudents: permissions?.canViewAllStudents ?? false,
        canManageClass: permissions?.canManageClass ?? true
      },
      isActive: isActive !== undefined ? isActive : true,
      status: status || 'active',
      createdBy: req.adminId // If you have admin authentication
    };

    const teacher = new teacherModel(teacherData);
    await teacher.save();

    // Remove password from response
    const teacherResponse = teacher.toObject();
    delete teacherResponse.password;

    res.status(201).json({
      message: 'Teacher created successfully',
      teacher: teacherResponse
    });

  } catch (error) {
    console.error('Error creating teacher:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `Teacher with this ${field} already exists`
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      message: 'Server error while creating teacher',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

 

export const getloggedInTeacherProfile = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Login attempt for username:", username);
    console.log("Request body:", req.body);

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }

    // Find teacher by username only
    const teacher = await teacherModel.findOne({ username });
    
    if (teacher) {
      console.log("Teacher found:", teacher.username);
      console.log("Stored hashed password:", teacher.password);
    }
    
    if (!teacher) {
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    // Check if teacher is active
    if (!teacher.isActive) {
      return res.status(401).json({ 
        message: 'Account is deactivated. Please contact administrator.' 
      });
    }

    // Verify password using bcrypt
    console.log("Comparing passwords...");
    console.log("Input password:", password);
    console.log("Stored hash:", teacher.password);
    
    const isPasswordValid = await bcrypt.compare(password, teacher.password);
    console.log("Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      console.log("Password mismatch");
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }

    console.log("Login successful for teacher:", teacher.firstName);

    // Update last login and login count
    teacher.lastLogin = new Date();
    teacher.loginCount = (teacher.loginCount || 0) + 1;
    await teacher.save();

    // Remove sensitive data before sending response
    const teacherProfile = {
      _id: teacher._id,
      id: teacher._id,
      username: teacher.username,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      fullName: `${teacher.firstName} ${teacher.lastName}`,
      email: teacher.email,
      phone: teacher.phone,
      profileImage: teacher.profileImage,
      subject: teacher.subject,
      subjects: teacher.subjects,
      gradeLevels: teacher.gradeLevels,
      experience: teacher.experience,
      employmentType: teacher.employmentType,
      department: teacher.department,
      permissions: teacher.permissions,
      isActive: teacher.isActive,
      status: teacher.status,
      joinDate: teacher.joinDate,
      lastLogin: teacher.lastLogin,
      qualification: teacher.qualification,
      specialization: teacher.specialization,
      employeeId: teacher.employeeId
    };

    res.status(200).json({
      message: 'success',
      user: teacherProfile
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Fetching teacher with ID:", id);

    if (!id) {
      return res.status(400).json({ message: 'Teacher ID is required' });
    }

    const teacher = await teacherModel.findById(id).select('-password'); // Remove password from response

    if (!teacher) {
      console.log("No teacher found with ID:", id);
      return res.status(404).json({ message: 'Teacher not found' });
    }

    console.log("Teacher found:", teacher.firstName, teacher.lastName);

    // Return in the same format as your other functions
    res.status(200).json({
      message: 'Teacher retrieved successfully',
      teacher: teacher // Wrap in teacher object
    });
  } catch (error) {
    console.error('Error fetching teacher by ID:', error);
    
    // Handle CastError (invalid ID format)
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid teacher ID format' });
    }
    
    res.status(500).json({ 
      message: 'Server Error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

 