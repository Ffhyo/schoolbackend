import adminModel from "../models/adminModel.js";
import studentModel from "../models/studentModel.js";
import teacherModel from "../models/teacherModel.js";

// Login admin
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Please fill all credentials" });
    }
    
    const user = await adminModel.findOne({ username, password });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Update login stats
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();
    
    // Successful login response with admin-specific data
    res.status(200).json({ 
      message: "success", 
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        assignedSections: user.assignedSections,
        permissions: user.permissions,
        role: user.role,
        loginCount: user.loginCount,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all admins
export const getAdmins = async (req, res) => {
  try {
    const admins = await adminModel.find();
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: error.message });
  }
};

// Create admin (for testing)
export const createAdmin = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, assignedSections } = req.body;
    
    const admin = await adminModel.create({
      username,
      password,
      email,
      firstName,
      lastName,
      assignedSections: assignedSections || ['Class 1', 'Class 2', 'Class 3'],
      permissions: {
        canManageStudents: true,
        canManageTeachers: true,
        canManageCourses: true,
        canViewAnalytics: true
      }
    });
    
    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get admin dashboard data
export const getAdminDashboard = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    // Get admin details
    const admin = await adminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    // Get data specific to this admin's assigned sections
    let studentQuery = {};
    let teacherQuery = {};
    
    if (admin.assignedSections && admin.assignedSections.length > 0) {
      studentQuery = { Class: { $in: admin.assignedSections } };
    }
    
    // Get counts and recent data
    const totalStudents = await studentModel.countDocuments(studentQuery);
    const totalTeachers = await teacherModel.countDocuments(teacherQuery);
    const recentStudents = await studentModel.find(studentQuery)
      .sort({ enrollmentDate: -1 })
      .limit(5);
    
    // Get admin's activity
    const adminActivity = getAdminActivity(adminId);
    
    res.status(200).json({
      adminInfo: {
        name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim() || admin.username,
        username: admin.username,
        assignedSections: admin.assignedSections || [],
        permissions: admin.permissions || {},
        loginCount: admin.loginCount || 0,
        lastLogin: admin.lastLogin
      },
      stats: {
        totalStudents,
        totalTeachers,
        assignedSections: admin.assignedSections?.length || 0,
        studentGrowth: calculateGrowth(adminId, 'students'),
        teacherGrowth: calculateGrowth(adminId, 'teachers')
      },
      recentStudents,
      adminActivity,
      quickActions: generateQuickActions(admin.permissions || {})
    });
    
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get admin-specific students
// Get admin-specific students - UPDATED VERSION
// Get admin-specific students - UPDATED FOR YOUR ACTUAL SCHEMA
export const getStudents = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { section, Class, house, search, page = 1, limit = 10 } = req.query;
    
    // Get admin details to know their assigned sections
    const admin = await adminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    let query = { status: 'Active' }; // Only active students
    
    // If admin has assigned sections, only show students from those sections
    if (admin.assignedSections && admin.assignedSections.length > 0) {
      query.section = { $in: admin.assignedSections };
    }
    
    // Apply section filter if provided
    if (section && section !== 'All Sections') {
      query.section = section;
    }
    
    // Apply class filter if provided (note: Class with capital C)
  if (Class && Class !== 'All Classes') {
  
 query.Class=Class
}
    
    // Apply house filter if provided
    if (house && house !== 'All Houses') {
      query.house = house;
    }
    
    // Apply search filter if provided
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } },
        { 'fathersName': { $regex: search, $options: 'i' } },
        { 'mothersName': { $regex: search, $options: 'i' } }
      ];
    }

    const students = await studentModel.find(query)
      .select('-password') // Exclude password field
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ firstName: 1, lastName: 1 });

    const total = await studentModel.countDocuments(query);

    // Get unique values for filters
    const baseQuery = admin.assignedSections && admin.assignedSections.length > 0 
      ? { section: { $in: admin.assignedSections }, status: 'Active' } 
      : { status: 'Active' };

    const classFilterOptions = await studentModel.distinct('Class', baseQuery);
    const houseFilterOptions = await studentModel.distinct('house', baseQuery);
    const sectionFilterOptions = await studentModel.distinct('section', baseQuery);

    res.status(200).json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      adminSections: admin.assignedSections,
      filterOptions: {
        classes: classFilterOptions.filter(Boolean).sort(),
        houses: houseFilterOptions.filter(Boolean),
        sections: sectionFilterOptions.filter(Boolean).sort()
      }
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get admin-specific teachers
export const getTeachers = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { subject, page = 1, limit = 10 } = req.query;
    
    // Get admin details
    const admin = await adminModel.findById(adminId);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    
    let query = {};
    
    // Apply subject filter if provided
    if (subject) {
      query.subject = subject;
    }
    
    const teachers = await teacherModel.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ firstName: 1 });

    const total = await teacherModel.countDocuments(query);

    res.status(200).json({
      teachers,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
      adminInfo: {
        name: `${admin.firstName || ''} ${admin.lastName || ''}`.trim(),
        canManageTeachers: admin.permissions?.canManageTeachers || false
      }
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add new student (admin-specific)
export const addStudent = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    // Check if admin has permission to manage students
    const admin = await adminModel.findById(adminId);
    if (!admin?.permissions?.canManageStudents) {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    const student = await studentModel.create(req.body);
    res.status(201).json({
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ error: error.message });
  }
};

// Add new teacher (admin-specific)
export const addTeacher = async (req, res) => {
  try {
    const { adminId } = req.params;
    
    // Check if admin has permission to manage teachers
    const admin = await adminModel.findById(adminId);
    if (!admin?.permissions?.canManageTeachers) {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    const teacher = await teacherModel.create(req.body);
    res.status(201).json({
      message: 'Teacher created successfully',
      teacher
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to get admin-specific activity
const getAdminActivity = (adminId) => {
  return [
    { action: 'Logged in', timestamp: new Date() },
    { action: 'Viewed dashboard', timestamp: new Date(Date.now() - 3600000) },
    { action: 'Checked student records', timestamp: new Date(Date.now() - 7200000) }
  ];
};

// Helper function to calculate growth (mock implementation)
const calculateGrowth = (adminId, type) => {
  const growthRates = {
    students: 12,
    teachers: 5
  };
  return growthRates[type] || 0;
};

// Helper function to generate quick actions based on permissions
const generateQuickActions = (permissions) => {
  const actions = [];
  
  if (permissions.canManageStudents) {
    actions.push({ label: 'Add Student', path: '/students/add', icon: '👨‍🎓' });
  }
  if (permissions.canManageTeachers) {
    actions.push({ label: 'Add Teacher', path: '/teachers/add', icon: '👩‍🏫' });
  }
  if (permissions.canManageCourses) {
    actions.push({ label: 'Manage Courses', path: '/courses', icon: '📚' });
  }
  
  // Add default actions if no specific permissions
  if (actions.length === 0) {
    actions.push(
      { label: 'View Students', path: '/students', icon: '👨‍🎓' },
      { label: 'View Teachers', path: '/teachers', icon: '👩‍🏫' }
    );
  }
  
  return actions;
};

// update hero section.
 