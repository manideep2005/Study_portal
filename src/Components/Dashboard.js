import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const chatIframeRef = useRef(null);
  
  // State variables
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [contactsData, setContactsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [showUploadMaterialModal, setShowUploadMaterialModal] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    course: '',
    dueDate: '',
    description: '',
    estimatedTime: '',
    priority: 'medium'
  });
  const [uploadedMaterials, setUploadedMaterials] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [taskView, setTaskView] = useState('list'); // list or calendar
  const [notificationCount, setNotificationCount] = useState(3);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Assignment Graded', message: 'Your Mathematics Problem Set has been graded', time: '2 hours ago', read: false },
    { id: 2, title: 'New Course Announcement', message: 'Important information about your Physics course', time: '3 hours ago', read: false },
    { id: 3, title: 'Reminder', message: 'Programming Assignment due tomorrow', time: '1 day ago', read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [chatURL, setChatURL] = useState('https://slrtech-chatapp.onrender.com/register');

  useEffect(() => {
    // Check if user is authenticated
    const loggedInUser = localStorage.getItem('user');
    
    if (!loggedInUser) {
      // Redirect to signin if not authenticated
      navigate('/signin');
      return;
    }
    
    try {
      // Parse user data from localStorage
      const userData = JSON.parse(loggedInUser);
      setUser(userData);
      
      // In a real app, you would fetch this data from an API
      fetchUserData(userData.id);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      localStorage.removeItem('user');
      navigate('/signin');
    }
  }, [navigate]);

  // Function to fetch user-specific data
  const fetchUserData = (userId) => {
    setIsLoading(true);
    
    // Simulating API calls with setTimeout
    setTimeout(() => {
      // Sample data
      const fetchedCourses = [
        { id: 1, name: 'Mathematics 101', instructor: 'Dr. Smith', nextLesson: 'Calculus II', progress: 65, description: 'Introduction to advanced mathematical concepts including calculus and linear algebra.' },
        { id: 2, name: 'Introduction to Physics', instructor: 'Prof. Johnson', nextLesson: 'Mechanics', progress: 40, description: 'Fundamentals of physics, covering mechanics, thermodynamics, and electromagnetism.' },
        { id: 3, name: 'Computer Science Basics', instructor: 'Dr. Williams', nextLesson: 'Data Structures', progress: 80, description: 'Learn programming fundamentals, algorithms, and basic software development principles.' },
        { id: 4, name: 'English Literature', instructor: 'Prof. Davis', nextLesson: 'Modern Poetry', progress: 55, description: 'Explore classical and contemporary literature with critical analysis techniques.' }
      ];
      
      const fetchedAssignments = [
        { id: 1, title: 'Calculus Problem Set', course: 'Mathematics 101', courseId: 1, dueDate: '2023-04-15', status: 'pending', priority: 'high', estimatedTime: '3 hours', description: 'Complete problems 1-20 in Chapter 5' },
        { id: 2, title: 'Physics Lab Report', course: 'Introduction to Physics', courseId: 2, dueDate: '2023-04-10', status: 'pending', priority: 'medium', estimatedTime: '4 hours', description: 'Write a detailed report on the pendulum experiment' },
        { id: 3, title: 'Programming Assignment', course: 'Computer Science Basics', courseId: 3, dueDate: '2023-04-05', status: 'overdue', priority: 'high', estimatedTime: '5 hours', description: 'Implement a binary search tree in Python' },
        { id: 4, title: 'Literature Essay', course: 'English Literature', courseId: 4, dueDate: '2023-04-20', status: 'pending', priority: 'low', estimatedTime: '6 hours', description: 'Write a 1500-word essay on modernist literature' },
        { id: 5, title: 'Midterm Exam', course: 'Mathematics 101', courseId: 1, dueDate: '2023-03-25', status: 'completed', priority: 'high', estimatedTime: '2 hours', description: 'Prepare for midterm covering Chapters 1-4' }
      ];
      
      setCourses(fetchedCourses);
      setAssignments(fetchedAssignments);
      
      // Initialize materials object with empty arrays for each course
      const materials = {};
      fetchedCourses.forEach(course => {
        materials[course.id] = [];
      });
      setUploadedMaterials(materials);
      
      setContactsData([
        { userId: 'u123', name: 'Prof. Smith', role: 'Mathematics Professor', avatar: '👨‍🏫', status: 'online', unread: 2, lastMessage: 'Please check your latest assignment results.' },
        { userId: 'u124', name: 'John Miller', role: 'Student', avatar: '👨‍🎓', status: 'offline', unread: 0, lastMessage: 'Thanks for the study materials!' },
        { userId: 'u125', name: 'Lisa Johnson', role: 'Teaching Assistant', avatar: '👩‍🏫', status: 'away', unread: 1, lastMessage: 'Can you help with tomorrow\'s lab?' },
        { userId: 'u126', name: 'Academic Advisor', role: 'Advisor', avatar: '👩‍💼', status: 'online', unread: 0, lastMessage: 'Your schedule for next semester is ready.' }
      ]);
      
      setIsLoading(false);
    }, 1000); // Simulating network delay
  };

  // Navigation functions
  const navigateToChat = (userId) => {
    // Set the current chat user if provided
    if (userId) {
      setCurrentChatUser(contactsData.find(contact => contact.userId === userId));
      // If we have a specific user, go to the chat page directly instead of register
      setChatURL(`https://slrtech-chatapp.onrender.com/chat`);
    } else {
      setChatURL('https://slrtech-chatapp.onrender.com/register');
    }
    setShowChat(true);
  };

  const startVideoCall = (userId) => {
    console.log(`Starting video call with user ${userId}`);
    // In a real app, this would initiate a video call
    // For now, we'll just open the chat with a video call flag
    navigateToChat(userId);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/signin');
  };

  // New Assignment handlers
  const handleAddAssignment = () => {
    setShowAddAssignmentModal(true);
  };

  const handleAssignmentInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitNewAssignment = (e) => {
    e.preventDefault();
    
    // Get the course ID based on the course name
    const courseObj = courses.find(c => c.name === newAssignment.course);
    const courseId = courseObj ? courseObj.id : null;
    
    // Create new assignment object
    const newAssignmentObj = {
      id: assignments.length + 1,
      title: newAssignment.title,
      course: newAssignment.course,
      courseId: courseId,
      dueDate: newAssignment.dueDate,
      status: 'pending',
      priority: newAssignment.priority,
      estimatedTime: newAssignment.estimatedTime,
      description: newAssignment.description
    };
    
    // Add to assignments array
    setAssignments(prev => [...prev, newAssignmentObj]);
    
    // Reset form and close modal
    setNewAssignment({
      title: '',
      course: '',
      dueDate: '',
      description: '',
      estimatedTime: '',
      priority: 'medium'
    });
    setShowAddAssignmentModal(false);
    
    // Show success notification
    const newNotification = {
      id: notifications.length + 1,
      title: 'Assignment Created',
      message: `${newAssignmentObj.title} has been added to your assignments`,
      time: 'Just now',
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setNotificationCount(prev => prev + 1);
  };

  // Course materials upload handlers
  const handleUploadMaterials = (courseId) => {
    setCurrentCourseId(courseId);
    setShowUploadMaterialModal(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0 && currentCourseId) {
      // Create file objects with additional metadata
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file) // Create a local URL for the file
      }));
      
      // Add files to the course's materials
      setUploadedMaterials(prev => ({
        ...prev,
        [currentCourseId]: [...(prev[currentCourseId] || []), ...newFiles]
      }));
    }
  };

  const handleDeleteMaterial = (courseId, fileId) => {
    setUploadedMaterials(prev => ({
      ...prev,
      [courseId]: prev[courseId].filter(file => file.id !== fileId)
    }));
  };

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    // First filter by status
    if (activeFilter !== 'all' && assignment.status !== activeFilter) {
      return false;
    }
    
    // Then filter by search term
    if (searchTerm && !assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !assignment.course.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Upcoming tasks (next 7 days)
  const upcomingTasks = assignments.filter(assignment => {
    if (assignment.status === 'completed') return false;
    
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    return dueDate >= today && dueDate <= oneWeekFromNow;
  });

  // Format bytes into KB, MB, etc.
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle notification read
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setNotificationCount(0);
  };

  // Handle chat close
  const handleChatClose = () => {
    setShowChat(false);
    setCurrentChatUser(null);
  };

  // Show loading state while fetching data
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Header */}
      <header className="dashboard-header">
        <button className="menu-toggle" onClick={() => setMenuOpen(true)}>
          ☰
        </button>
        <h1>{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h1>
        <div className="header-actions">
          <button className="chat-button" onClick={() => navigateToChat()}>
            💬
            {contactsData.reduce((count, contact) => count + contact.unread, 0) > 0 && (
              <span className="notification-badge">
                {contactsData.reduce((count, contact) => count + contact.unread, 0)}
              </span>
            )}
          </button>
          <div className="notification-wrapper">
            <button 
              className="notification-bell"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <button onClick={markAllNotificationsAsRead}>Mark all as read</button>
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <p className="no-notifications">No new notifications</p>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      >
                        <div className="notification-content">
                          <h4>{notification.title}</h4>
                          <p>{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Content Sections */}
      <div className="dashboard-content">
        {activeSection === 'overview' && (
          <div className="section-overview animate-fade-in">
            <div className="welcome-banner">
              <h2>Welcome back, {user?.name || 'Student'}!</h2>
              <p>Here's what you need to know today:</p>
            </div>
            
            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-card">
                <h3>Courses</h3>
                <p className="stat-number">{courses.length}</p>
                <p>Active courses</p>
              </div>
              <div className="stat-card">
                <h3>Assignments</h3>
                <p className="stat-number">{assignments.filter(a => a.status === 'pending').length}</p>
                <p>Pending</p>
              </div>
              <div className="stat-card">
                <h3>Overdue</h3>
                <p className="stat-number">{assignments.filter(a => a.status === 'overdue').length}</p>
                <p>Need attention</p>
              </div>
              <div className="stat-card">
                <h3>Average Progress</h3>
                <p className="stat-number">
                  {Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)}%
                </p>
                <p>Keep it up!</p>
              </div>
            </div>
            
            {/* Course Progress Section */}
            <div className="section-container">
              <div className="section-header">
                <h3>Course Progress</h3>
                <button className="view-all-button" onClick={() => setActiveSection('courses')}>
                  View All
                </button>
              </div>
              <div className="course-cards">
                {courses.slice(0, 3).map(course => (
                  <div key={course.id} className="course-card">
                    <h4>{course.name}</h4>
                    <p className="instructor">{course.instructor}</p>
                    <div className="progress-container">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <span className="progress-text">{course.progress}%</span>
                    </div>
                    <p className="next-lesson">Next: {course.nextLesson}</p>
                    <button className="continue-button">Continue Learning</button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Upcoming Tasks */}
            <div className="section-container">
              <div className="section-header">
                <h3>Upcoming Tasks</h3>
                <button className="view-all-button" onClick={() => setActiveSection('assignments')}>
                  View All
                </button>
              </div>
              <div className="upcoming-tasks">
                {upcomingTasks.length === 0 ? (
                  <p className="no-tasks">No upcoming tasks for the next 7 days.</p>
                ) : (
                  upcomingTasks.map(task => (
                    <div key={task.id} className="task-item">
                      <div className="task-info">
                        <div className="task-priority-indicator" data-priority={task.priority}></div>
                        <div className="task-content">
                          <h4>{task.title}</h4>
                          <p>{task.course}</p>
                        </div>
                      </div>
                      <div className="task-meta">
                        <p className="task-due">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                        <p className="task-time">{task.estimatedTime}</p>
                      </div>
                    </div>
                  ))
                )}
                <button className="add-task-button" onClick={handleAddAssignment}>
                  + Add New Task
                </button>
              </div>
            </div>
            
            {/* Upcoming Assignments */}
            <div className="section-container">
              <div className="section-header">
                <h3>Upcoming Assignments</h3>
                <button className="view-all-button" onClick={() => setActiveSection('assignments')}>
                  View All
                </button>
              </div>
              <div className="assignments-list">
                {assignments
                  .filter(assignment => assignment.status !== 'completed')
                  .slice(0, 3)
                  .map(assignment => (
                    <div 
                      key={assignment.id} 
                      className={`assignment-item ${assignment.status === 'overdue' ? 'overdue' : ''}`}
                    >
                      <div className="assignment-info">
                        <h4>{assignment.title}</h4>
                        <p className="course-name">{assignment.course}</p>
                      </div>
                      <div className="assignment-meta">
                        <p className="due-date">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                        <span className={`status-badge ${assignment.status}`}>
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
        
        {activeSection === 'courses' && (
          <div className="section-courses animate-fade-in">
            <h2>My Courses</h2>
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.id} className="course-card full">
                  <h3>{course.name}</h3>
                  <p className="instructor">{course.instructor}</p>
                  <p className="course-description">{course.description}</p>
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                    </div>
                    <span className="progress-text">{course.progress}%</span>
                  </div>
                  <p className="next-lesson">Next: {course.nextLesson}</p>
                  <div className="course-actions">
                    <button className="primary-button">Continue</button>
                    <button 
                      className="secondary-button" 
                      onClick={() => handleUploadMaterials(course.id)}
                    >
                      Materials
                    </button>
                  </div>
                  
                  {/* Display uploaded materials */}
                  {uploadedMaterials[course.id] && uploadedMaterials[course.id].length > 0 && (
                    <div className="course-materials">
                      <h4>Course Materials</h4>
                      <ul className="materials-list">
                        {uploadedMaterials[course.id].map(file => (
                          <li key={file.id} className="material-item">
                            <div className="material-info">
                              <span className="material-icon">📄</span>
                              <div className="material-details">
                                <a href={file.url} target="_blank" rel="noopener noreferrer">
                                  {file.name}
                                </a>
                                <span className="material-meta">
                                  {formatBytes(file.size)} • {new Date(file.uploadDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <button 
                              className="delete-material" 
                              onClick={() => handleDeleteMaterial(course.id, file.id)}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeSection === 'assignments' && (
          <div className="section-assignments animate-fade-in">
            <div className="assignments-header">
              <h2>Assignments</h2>
              <button className="add-assignment-button" onClick={handleAddAssignment}>
                + Add Assignment
              </button>
            </div>
            
            <div className="assignments-controls">
              <div className="assignment-filters">
                <button 
                  className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All
                </button>
                <button 
                  className={`filter-button ${activeFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('pending')}
                >
                  Pending
                </button>
                <button 
                  className={`filter-button ${activeFilter === 'overdue' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('overdue')}
                >
                  Overdue
                </button>
                <button 
                  className={`filter-button ${activeFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveFilter('completed')}
                >
                  Completed
                </button>
              </div>
              
              <div className="assignment-search">
                <input 
                  type="text" 
                  placeholder="Search assignments..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="view-toggle">
                <button 
                  className={`view-button ${taskView === 'list' ? 'active' : ''}`}
                  onClick={() => setTaskView('list')}
                >
                  📋 List
                </button>
                <button 
                  className={`view-button ${taskView === 'calendar' ? 'active' : ''}`}
                  onClick={() => setTaskView('calendar')}
                >
                  📅 Calendar
                </button>
              </div>
            </div>
            
            {taskView === 'list' ? (
              <div className="assignments-table">
                <div className="table-header">
                  <div className="header-cell">Title</div>
                  <div className="header-cell">Course</div>
                  <div className="header-cell">Due Date</div>
                  <div className="header-cell">Priority</div>
                  <div className="header-cell">Status</div>
                  <div className="header-cell">Actions</div>
                </div>
                {filteredAssignments.length === 0 ? (
                  <div className="no-assignments">No assignments match your filters</div>
                ) : (
                  filteredAssignments.map(assignment => (
                    <div 
                      key={assignment.id} 
                      className={`table-row ${assignment.status === 'overdue' ? 'overdue-row' : ''}`}
                    >
                      <div className="cell">{assignment.title}</div>
                      <div className="cell">{assignment.course}</div>
                      <div className="cell">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                      <div className="cell">
                        <span className={`priority-badge ${assignment.priority}`}>
                          {assignment.priority}
                        </span>
                      </div>
                      <div className="cell">
                        <span className={`status-badge ${assignment.status}`}>
                          {assignment.status}
                        </span>
                      </div>
                      <div className="cell">
                        <button className="action-button" title="View Details">👁️</button>
                        {assignment.status !== 'completed' && (
                          <button className="action-button submit" title="Submit Assignment">📤</button>
                        )}
                        <button className="action-button" title="Edit Assignment">✏️</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="calendar-view">
                <p>Calendar view is not implemented in this demo.</p>
              </div>
            )}
          </div>
        )}
        
        {activeSection === 'contacts' && (
          <div className="section-contacts animate-fade-in">
            <h2>Contacts</h2>
            <div className="contacts-search">
              <input type="text" placeholder="Search contacts..." />
            </div>
            <div className="contacts-list">
              {contactsData.map(contact => (
                <div key={contact.userId} className="contact-card">
                  <div className="contact-avatar">
                    <span className="avatar-icon">{contact.avatar}</span>
                    <span className={`status-indicator ${contact.status}`}></span>
                  </div>
                  <div className="contact-info">
                    <h4>{contact.name}</h4>
                    <p className="contact-role">{contact.role}</p>
                    <p className="last-message">{contact.lastMessage}</p>
                  </div>
                  <div className="contact-actions">
                    <button 
                      className="contact-button message" 
                      onClick={() => navigateToChat(contact.userId)}
                    >
                      💬
                      {contact.unread > 0 && (
                        <span className="contact-badge">{contact.unread}</span>
                      )}
                    </button>
                    <button 
                      className="contact-button call" 
                      onClick={() => startVideoCall(contact.userId)}
                    >
                      📹
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Sidebar Navigation */}
      <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">🎓 EduDash</div>
          <button className="close-menu" onClick={() => setMenuOpen(false)}>×</button>
        </div>
        <div className="user-profile">
          <div className="user-avatar">
            {user?.avatar || '👤'}
          </div>
          <div className="user-info">
            <h3>{user?.name || 'Student Name'}</h3>
            <p>{user?.role || 'Student'}</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className={activeSection === 'overview' ? 'active' : ''}>
              <button onClick={() => {
                setActiveSection('overview');
                setMenuOpen(false);
              }}>
                📊 Overview
              </button>
            </li>
            <li className={activeSection === 'courses' ? 'active' : ''}>
              <button onClick={() => {
                setActiveSection('courses');
                setMenuOpen(false);
              }}>
                📚 My Courses
              </button>
            </li>
            <li className={activeSection === 'assignments' ? 'active' : ''}>
              <button onClick={() => {
                setActiveSection('assignments');
                setMenuOpen(false);
              }}>
                ✅ Assignments
              </button>
            </li>
            <li className={activeSection === 'contacts' ? 'active' : ''}>
              <button onClick={() => {
                setActiveSection('contacts');
                setMenuOpen(false);
              }}>
                👥 Contacts
              </button>
              <a
  href="https://slrtech-chatapp.onrender.com/register"
  target="_blank"
  rel="noopener noreferrer"
>
  <button> 💬  Chat with friends</button>
</a>

            </li>
  
            <li>
              <button>📋 Calendar</button>
            </li>
            <li>
              <button>📊 Grades</button>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button className="settings-button">⚙️ Settings</button>
          <button className="help-button">❓ Help</button>
        </div>
      </div>
      
      {/* Backdrop for mobile */}
      {menuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)}></div>
      )}

      {/* Add Assignment Modal */}
      {showAddAssignmentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Assignment</h2>
              <button className="close-modal" onClick={() => setShowAddAssignmentModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitNewAssignment}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={newAssignment.title}
                  onChange={handleAssignmentInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Course</label>
                <select
                  name="course"
                  value={newAssignment.course}
                  onChange={handleAssignmentInputChange}
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.name}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={newAssignment.dueDate}
                    onChange={handleAssignmentInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Est. Time</label>
                  <input
                    type="text"
                    name="estimatedTime"
                    placeholder="e.g. 2 hours"
                    value={newAssignment.estimatedTime}
                    onChange={handleAssignmentInputChange}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Priority</label>
                <div className="priority-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="priority"
                      value="low"
                      checked={newAssignment.priority === 'low'}
                      onChange={handleAssignmentInputChange}
                    />
                    Low
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="priority"
                      value="medium"
                      checked={newAssignment.priority === 'medium'}
                      onChange={handleAssignmentInputChange}
                    />
                    Medium
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="priority"
                      value="high"
                      checked={newAssignment.priority === 'high'}
                      onChange={handleAssignmentInputChange}
                    />
                    High
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={newAssignment.description}
                  onChange={handleAssignmentInputChange}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowAddAssignmentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Add Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Materials Modal */}
      {showUploadMaterialModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Upload Course Materials</h2>
              <button className="close-modal" onClick={() => setShowUploadMaterialModal(false)}>×</button>
            </div>
            <div className="upload-area">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <div 
                className="dropzone"
                onClick={() => fileInputRef.current.click()}
              >
                <span className="upload-icon">📤</span>
                <p>Click to select files or drag and drop them here</p>
                <p className="upload-hint">Supported files: PDF, DOC, DOCX, PPT, PPTX, etc.</p>
              </div>
            </div>
            <div className="form-actions">
              <button className="cancel-button" onClick={() => setShowUploadMaterialModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="chat-modal">
          <div className="chat-header">
            <h3>
              {currentChatUser ? `Chat with ${currentChatUser.name}` : 'Chat'}
            </h3>
            <button className="close-chat" onClick={handleChatClose}>×</button>
          </div>
          <div className="chat-content">
            <iframe 
              src={chatURL}
              title="Chat Application"
              ref={chatIframeRef}
              className="chat-iframe"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;