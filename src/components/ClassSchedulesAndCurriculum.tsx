import React, { useState, useMemo } from 'react';
import {
  Student,
  Course,
  Instructor,
  ClassScheduleItem,
  Department,
  User,
  AuditLogEntry,
} from '../types';
import {
  Calendar,
  Clock,
  BookOpen,
  UserCheck,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  ChevronDown,
  Building2,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Layers,
  Edit2,
  Trash2,
  Users,
  Eye,
} from 'lucide-react';

interface ClassSchedulesAndCurriculumProps {
  students: Student[];
  courses: Course[];
  instructors: Instructor[];
  departmentSchedules: Record<Department, ClassScheduleItem[]>;
  currentUser: User | null;
  selectedDepartment: string;
  onAddCourse: (course: Course) => void;
  onAddInstructor: (instructor: Instructor) => void;
  onUpdateCourse?: (course: Course) => void;
  onDeleteCourse?: (courseCode: string) => void;
  onAddAuditLog: (action: string, details: string) => void;
  onSelectStudentProfile?: (studentId: string) => void;
}

export const ClassSchedulesAndCurriculum: React.FC<ClassSchedulesAndCurriculumProps> = ({
  students,
  courses,
  instructors,
  departmentSchedules,
  currentUser,
  selectedDepartment,
  onAddCourse,
  onAddInstructor,
  onUpdateCourse,
  onDeleteCourse,
  onAddAuditLog,
  onSelectStudentProfile,
}) => {
  // Navigation sub-tab inside Schedules & Curriculum
  const [activeSubTab, setActiveSubTab] = useState<'schedules' | 'subjects' | 'instructors'>('schedules');

  // Filter states
  const [deptFilter, setDeptFilter] = useState<string>(
    selectedDepartment === 'All Departments' ? 'All' : selectedDepartment
  );

  React.useEffect(() => {
    setDeptFilter(selectedDepartment === 'All Departments' ? 'All' : selectedDepartment);
  }, [selectedDepartment]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Modal states
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddInstructorModal, setShowAddInstructorModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Subject Form State
  const [newSubject, setNewSubject] = useState({
    code: '',
    name: '',
    department: 'BS Criminology' as Department,
    units: 3,
    schedule: 'Mon / Wed 09:00 - 10:30 AM',
    room: 'Justice Hall 204',
    facultyId: '',
    facultyName: '',
    semester: '1st Semester AY 2026-2027',
    description: '',
    prerequisites: 'None',
  });

  // New Instructor Form State
  const [newInstructor, setNewInstructor] = useState({
    name: '',
    title: 'Assistant Professor',
    department: 'BS Criminology' as Department,
    email: '',
    phone: '+63 9',
    officeLocation: 'Justice Hall Room 201',
    consultationHours: 'Tue & Thu 1:00 PM - 3:00 PM',
    specialization: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchDept = deptFilter === 'All' || s.department === deptFilter;
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchSearch;
    });
  }, [students, deptFilter, searchQuery]);

  // Selected Student Object
  const currentStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || filteredStudents[0] || students[0];
  }, [students, selectedStudentId, filteredStudents]);

  // Student Schedule Items derived from their department curriculum
  const studentScheduleItems = useMemo(() => {
    if (!currentStudent) return [];
    const dept = currentStudent.department as Department;
    const baseItems = departmentSchedules[dept] || [];
    if (selectedDay === 'All') return baseItems;
    return baseItems.filter((item) => item.day === selectedDay);
  }, [currentStudent, departmentSchedules, selectedDay]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchDept = deptFilter === 'All' || c.department === deptFilter;
      const matchSearch =
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.room && c.room.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchDept && matchSearch;
    });
  }, [courses, deptFilter, searchQuery]);

  // Filtered Instructors
  const filteredInstructors = useMemo(() => {
    return instructors.filter((inst) => {
      const matchDept = deptFilter === 'All' || inst.department === deptFilter;
      const matchSearch =
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inst.specialization && inst.specialization.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchDept && matchSearch;
    });
  }, [instructors, deptFilter, searchQuery]);

  // Handle Add Subject Submit
  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.code.trim() || !newSubject.name.trim()) {
      alert('Please fill out Subject Code and Subject Title');
      return;
    }

    const assignedInst = instructors.find((i) => i.id === newSubject.facultyId);

    const createdCourse: Course = {
      code: newSubject.code.trim().toUpperCase(),
      name: newSubject.name.trim(),
      department: newSubject.department,
      units: Number(newSubject.units) || 3,
      schedule: newSubject.schedule.trim() || 'TBA',
      room: newSubject.room.trim() || 'TBA',
      facultyId: newSubject.facultyId || 'inst-1',
      facultyName: assignedInst ? assignedInst.name : newSubject.facultyName || 'Staff Assigned',
      enrolledCount: 0,
      semester: newSubject.semester,
      description: newSubject.description.trim() || 'Curriculum course for ' + newSubject.department,
      prerequisites: newSubject.prerequisites.trim() || 'None',
    };

    onAddCourse(createdCourse);
    onAddAuditLog(
      'CURRICULUM_SUBJECT_ADDED',
      `Added new subject ${createdCourse.code} (${createdCourse.name}) for ${createdCourse.department}`
    );
    showToast(`Subject ${createdCourse.code} successfully added to ${createdCourse.department} curriculum!`);
    setShowAddSubjectModal(false);

    // Reset Form
    setNewSubject({
      code: '',
      name: '',
      department: 'BS Criminology',
      units: 3,
      schedule: 'Mon / Wed 09:00 - 10:30 AM',
      room: 'Justice Hall 204',
      facultyId: '',
      facultyName: '',
      semester: '1st Semester AY 2026-2027',
      description: '',
      prerequisites: 'None',
    });
  };

  // Handle Add Instructor Submit
  const handleAddInstructorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstructor.name.trim() || !newInstructor.email.trim()) {
      alert('Please fill out Instructor Name and Institutional Email');
      return;
    }

    const createdInstructor: Instructor = {
      id: `inst-${Date.now()}`,
      name: newInstructor.name.trim(),
      title: newInstructor.title.trim(),
      department: newInstructor.department,
      email: newInstructor.email.trim(),
      phone: newInstructor.phone.trim(),
      officeLocation: newInstructor.officeLocation.trim(),
      consultationHours: newInstructor.consultationHours.trim(),
      specialization: newInstructor.specialization.trim(),
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
      assignedCourseCodes: [],
    };

    onAddInstructor(createdInstructor);
    onAddAuditLog(
      'INSTRUCTOR_APPOINTED',
      `Appointed new faculty member ${createdInstructor.name} (${createdInstructor.title}) to ${createdInstructor.department}`
    );
    showToast(`Instructor ${createdInstructor.name} successfully registered in ${createdInstructor.department}!`);
    setShowAddInstructorModal(false);

    // Reset Form
    setNewInstructor({
      name: '',
      title: 'Assistant Professor',
      department: 'BS Criminology',
      email: '',
      phone: '+63 9',
      officeLocation: 'Justice Hall Room 201',
      consultationHours: 'Tue & Thu 1:00 PM - 3:00 PM',
      specialization: '',
    });
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  const daysOfWeek = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400 flex items-center space-x-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Card */}
      <div className="bg-[#111827] text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Official Academic Timetable & Faculty Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Student Class Schedules & Curriculum
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Authorized Staff & Administrator Portal: Inspect individual student class schedules, maintain accredited curriculum subjects for CRIM, BSBA, and BSIT, and appoint academic instructors.
            </p>
          </div>

          {/* Quick Action Buttons for Staff/Admin */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center space-x-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
            <button
              onClick={() => setShowAddInstructorModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center space-x-2 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Add Instructor</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('schedules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'schedules'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Student Class Schedules</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-slate-300 font-mono">
              {students.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('subjects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'subjects'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum Subjects Catalog</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-slate-300 font-mono">
              {courses.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('instructors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'instructors'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Faculty & Instructors</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] bg-slate-900 text-slate-300 font-mono">
              {instructors.length}
            </span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Department Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-500 flex items-center space-x-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Department:</span>
          </span>
          {['All', 'BS Criminology', 'BS Business Administration', 'BS Information Technology'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                deptFilter === dept
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {dept === 'All' ? 'All Departments' : dept.replace('BS ', '')}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeSubTab === 'schedules'
                ? 'Search student name or ID...'
                : activeSubTab === 'subjects'
                ? 'Search course code or title...'
                : 'Search faculty name or title...'
            }
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: STUDENT CLASS SCHEDULES */}
      {/* ========================================================================= */}
      {activeSubTab === 'schedules' && (
        <div className="space-y-5">
          {/* Student Selector Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Student Dropdown & Switcher */}
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                  Select Enrolled Student to View Schedule:
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full sm:w-80 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {filteredStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.studentNo}) - {s.department.replace('BS ', '')} ({s.yearLevel})
                      </option>
                    ))}
                  </select>

                  {currentStudent && onSelectStudentProfile && (
                    <button
                      onClick={() => onSelectStudentProfile(currentStudent.id)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      <span>View Full Profile</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Day Filter Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl overflow-x-auto shrink-0">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedDay === day
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Print / Export Action */}
              <button
                onClick={handlePrintSchedule}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Schedule</span>
              </button>
            </div>

            {/* Active Student Card Banner */}
            {currentStudent && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0 overflow-hidden">
                    {currentStudent.avatar ? (
                      <img src={currentStudent.avatar} alt={currentStudent.name} className="w-full h-full object-cover" />
                    ) : (
                      currentStudent.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {currentStudent.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                        {currentStudent.studentNo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {currentStudent.program} • {currentStudent.yearLevel} • Section 2A
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
                    Total Subjects: {studentScheduleItems.length}
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-bold">
                    Units: {studentScheduleItems.reduce((acc, curr) => acc + (curr.units || 3), 0)} Units
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-mono font-bold">
                    GPA: {currentStudent.gpa.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Schedule Grid View */}
          {studentScheduleItems.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No classes scheduled for {selectedDay}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No active lectures or laboratory periods found for {currentStudent?.name} on this day. Try switching to another day or select "All".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentScheduleItems.map((item, idx) => (
                <div
                  key={`${item.code}-${item.day}-${idx}`}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition space-y-4 relative overflow-hidden group"
                >
                  {/* Color Accent Indicator Bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {item.code}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mt-2 leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      {item.day}
                    </span>
                  </div>

                  {/* Schedule Details Badge Cluster */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{item.timeRange}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{item.room}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-mono font-semibold text-slate-500">{item.section}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white truncate">{item.instructor}</span>
                    </div>
                  </div>

                  {/* Footer Pill */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 font-mono">Units: {item.units || 3}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      Regular Lecture
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: CURRICULUM SUBJECTS CATALOG & MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'subjects' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Accredited Curriculum Subjects ({filteredCourses.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official course subjects for Criminology, Business Administration, and Information Technology.
              </p>
            </div>
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Subject</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((c) => (
              <div
                key={c.code}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {c.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {c.units || 3} Units
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {c.name}
                  </h4>

                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {c.department}
                  </span>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {c.description || 'Core departmental subject providing foundational principles and laboratory competencies.'}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono text-[11px]">{c.schedule}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11px]">{c.room || 'TBA'}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-semibold text-[11px] truncate">{c.facultyName}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 font-mono">
                    <span>Prereq: {c.prerequisites || 'None'}</span>
                    <span>Enrolled: {c.enrolledCount} students</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: INSTRUCTORS & FACULTY DIRECTORY & MANAGEMENT */}
      {/* ========================================================================= */}
      {activeSubTab === 'instructors' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Faculty Members & Instructors ({filteredInstructors.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official faculty profiles, department chairs, consultation schedules, and specializations.
              </p>
            </div>
            <button
              onClick={() => setShowAddInstructorModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Add Instructor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInstructors.map((inst) => (
              <div
                key={inst.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0 overflow-hidden">
                    {inst.avatar ? (
                      <img src={inst.avatar} alt={inst.name} className="w-full h-full object-cover" />
                    ) : (
                      inst.name.charAt(0)
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug truncate">
                      {inst.name}
                    </h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold line-clamp-1">
                      {inst.title}
                    </p>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {inst.department.replace('BS ', '')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono text-[11px] truncate">{inst.email}</span>
                  </div>

                  {inst.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-mono text-[11px]">{inst.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="text-[11px] truncate">{inst.officeLocation || 'Main Faculty Center'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[11px] truncate">Hours: {inst.consultationHours || 'By Appointment'}</span>
                  </div>

                  {inst.specialization && (
                    <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Expertise: </span>
                      {inst.specialization}
                    </div>
                  )}
                </div>

                {inst.assignedCourseCodes && inst.assignedCourseCodes.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                      Subjects Taught:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {inst.assignedCourseCodes.map((cc) => (
                        <span
                          key={cc}
                          className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-mono font-bold"
                        >
                          {cc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW SUBJECT */}
      {/* ========================================================================= */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5" />
                <h3 className="text-base font-black tracking-tight">Add New Curriculum Subject</h3>
              </div>
              <button
                onClick={() => setShowAddSubjectModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSubjectSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Course / Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject.code}
                    onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
                    placeholder="e.g. CRIM 2 or BA-MKTG 2"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={newSubject.department}
                    onChange={(e) => setNewSubject({ ...newSubject, department: e.target.value as Department })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BS Criminology">BS Criminology</option>
                    <option value="BS Business Administration">BS Business Administration</option>
                    <option value="BS Information Technology">BS Information Technology</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Title *
                </label>
                <input
                  type="text"
                  required
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                  placeholder="e.g. Special Crime Investigation with Legal Medicine"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Units
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newSubject.units}
                    onChange={(e) => setNewSubject({ ...newSubject, units: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    value={newSubject.room}
                    onChange={(e) => setNewSubject({ ...newSubject, room: e.target.value })}
                    placeholder="e.g. Crime Lab 2"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    value={newSubject.semester}
                    onChange={(e) => setNewSubject({ ...newSubject, semester: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Schedule (Days & Time Range)
                </label>
                <input
                  type="text"
                  value={newSubject.schedule}
                  onChange={(e) => setNewSubject({ ...newSubject, schedule: e.target.value })}
                  placeholder="e.g. Tue / Thu 01:00 - 02:30 PM"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assign Faculty / Instructor
                </label>
                <select
                  value={newSubject.facultyId}
                  onChange={(e) => {
                    const inst = instructors.find((i) => i.id === e.target.value);
                    setNewSubject({
                      ...newSubject,
                      facultyId: e.target.value,
                      facultyName: inst ? inst.name : '',
                    });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  <option value="">-- Select Instructor --</option>
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} - {inst.title} ({inst.department.replace('BS ', '')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Course Description & Competencies
                </label>
                <textarea
                  rows={2}
                  value={newSubject.description}
                  onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                  placeholder="Brief description of course modules and Philippine CHED learning outcomes..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Subject</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW INSTRUCTOR */}
      {/* ========================================================================= */}
      {showAddInstructorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5" />
                <h3 className="text-base font-black tracking-tight">Appoint New Faculty Member</h3>
              </div>
              <button
                onClick={() => setShowAddInstructorModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddInstructorSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name & Title / Honorific *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInstructor.name}
                    onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
                    placeholder="e.g. Major Jose P. Laurel, RCrim"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Rank / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInstructor.title}
                    onChange={(e) => setNewInstructor({ ...newInstructor, title: e.target.value })}
                    placeholder="e.g. Associate Professor / Lead Investigator"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Department *
                  </label>
                  <select
                    value={newInstructor.department}
                    onChange={(e) => setNewInstructor({ ...newInstructor, department: e.target.value as Department })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BS Criminology">BS Criminology</option>
                    <option value="BS Business Administration">BS Business Administration</option>
                    <option value="BS Information Technology">BS Information Technology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newInstructor.email}
                    onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                    placeholder="e.g. j.laurel@tcc.edu"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={newInstructor.phone}
                    onChange={(e) => setNewInstructor({ ...newInstructor, phone: e.target.value })}
                    placeholder="+63 9XX XXX XXXX"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Office Location
                  </label>
                  <input
                    type="text"
                    value={newInstructor.officeLocation}
                    onChange={(e) => setNewInstructor({ ...newInstructor, officeLocation: e.target.value })}
                    placeholder="e.g. Justice Hall Room 201"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Consultation Hours
                </label>
                <input
                  type="text"
                  value={newInstructor.consultationHours}
                  onChange={(e) => setNewInstructor({ ...newInstructor, consultationHours: e.target.value })}
                  placeholder="e.g. Mon & Wed 1:00 PM - 4:00 PM"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Specialization & Field of Expertise
                </label>
                <textarea
                  rows={2}
                  value={newInstructor.specialization}
                  onChange={(e) => setNewInstructor({ ...newInstructor, specialization: e.target.value })}
                  placeholder="e.g. Dactyloscopy, Criminal Investigation, Ballistics, Fingerprint Classification..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddInstructorModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register Instructor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
