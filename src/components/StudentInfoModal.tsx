import React, { useState, useEffect } from 'react';
import { Student, CivilStatus, EnrollmentStatus, Language } from '../types';
import { t } from '../utils/i18n';
import {
  User as UserIcon,
  Phone,
  MapPin,
  Users,
  AlertTriangle,
  Calendar,
  Heart,
  ShieldCheck,
  Edit3,
  Save,
  X,
  Printer,
  CheckCircle2,
  Building,
  Briefcase,
  GraduationCap,
  Sparkles,
  Info,
  ShieldAlert,
  IdCard,
} from 'lucide-react';

interface StudentInfoModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStudent?: (updated: Student) => void;
  currentLang?: Language;
}

export const StudentInfoModal: React.FC<StudentInfoModalProps> = ({
  student,
  isOpen,
  onClose,
  onUpdateStudent,
  currentLang = 'en',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'family' | 'emergency' | 'academics'>('profile');
  const [formData, setFormData] = useState<Student | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData(JSON.parse(JSON.stringify(student)));
      setIsEditing(false);
      setSaveSuccess(false);
    }
  }, [student, isOpen]);

  if (!isOpen || !student || !formData) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStudent && formData) {
      onUpdateStudent(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1200);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const civilStatusOptions: CivilStatus[] = ['Single', 'Married', 'Widowed', 'Separated'];
  const enrollmentStatusOptions: EnrollmentStatus[] = [
    'Enrolled',
    'Regular',
    'Irregular',
    'LOA',
    'Graduating',
    'Transferee',
    'Probationary',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-slate-900 p-6 text-white relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md text-white font-black text-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                {formData.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">{formData.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white border border-white/20">
                    {formData.studentNo}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono ${
                      formData.enrollmentStatus === 'Regular' || formData.enrollmentStatus === 'Enrolled'
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                        : formData.enrollmentStatus === 'Graduating'
                        ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                        : 'bg-rose-500/20 text-rose-200 border border-rose-400/30'
                    }`}
                  >
                    {formData.enrollmentStatus}
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-1">
                  {formData.program} • {formData.yearLevel} • {formData.department}
                </p>
                <div className="flex items-center space-x-4 text-[11px] text-blue-200 mt-1 font-mono">
                  <span>LRN: {formData.lrn || '109283746500'}</span>
                  <span>•</span>
                  <span>Civil Status: {formData.civilStatus}</span>
                  <span>•</span>
                  <span>GPA: {formData.gpa.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center space-x-2 shrink-0 print:hidden">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/20 transition"
                  title="Edit student information"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit Details</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition"
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition"
                title="Print student record"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-rose-500/80 text-white rounded-xl border border-white/20 transition"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center space-x-2 mt-5 border-t border-white/15 pt-3 overflow-x-auto print:hidden">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Personal & PH Address</span>
            </button>

            <button
              onClick={() => setActiveTab('family')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'family'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Parents & Guardian</span>
            </button>

            <button
              onClick={() => setActiveTab('emergency')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'emergency'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
              <span>Emergency Contact (PH)</span>
            </button>

            <button
              onClick={() => setActiveTab('academics')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                activeTab === 'academics'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic & Status</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="bg-emerald-500 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between animate-fade-in shrink-0">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Student record updated and synchronized across SIS cloud!</span>
            </div>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* TAB 1: PERSONAL & PHILIPPINE ADDRESS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-2 mb-4">
                  <UserIcon className="w-4 h-4" />
                  <span>Personal Demographics & Civil Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Full Legal Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">{formData.name}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Civil Status
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.civilStatus}
                        onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value as CivilStatus })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      >
                        {civilStatusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {formData.civilStatus}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.birthDate || ''}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Sex / Gender
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.gender || 'Male'}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">{formData.gender || 'Not specified'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Blood Type
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.bloodType || 'O+'}
                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        placeholder="e.g. O+, A+, B+"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-mono font-bold text-rose-600 dark:text-rose-400">{formData.bloodType || 'O+'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Citizenship / Nationality
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.nationality || 'Filipino'}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">{formData.nationality || 'Filipino'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Religion / Affiliation
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.religion || 'Roman Catholic'}
                        onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">{formData.religion || 'Roman Catholic'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Learner Reference Number (LRN)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.lrn || ''}
                        onChange={(e) => setFormData({ ...formData, lrn: e.target.value })}
                        maxLength={12}
                        placeholder="12-digit LRN"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{formData.lrn || '109283746501'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Philippine Contact & Residential Address Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-2 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>Philippine Residential Address & Contact Numbers</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Philippine Mobile Number (PH Format)
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={formData.contactNumber}
                          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                          placeholder="+63 9XX XXX XXXX or 09XX-XXX-XXXX"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                          required
                        />
                      </div>
                    ) : (
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm flex items-center space-x-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{formData.contactNumber}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Institutional Email
                    </label>
                    <div className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{formData.email}</div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      House / Unit No. & Street
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address?.street || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, street: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">{formData.address?.street}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Barangay
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address?.barangay || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, barangay: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">{formData.address?.barangay}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      City / Municipality
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address?.city || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, city: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">{formData.address?.city}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Province / Region
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address?.province || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, province: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formData.address?.province} ({formData.address?.region || 'PH'})
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Postal / ZIP Code
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.address?.zipCode || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, zipCode: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-mono font-bold text-blue-600 dark:text-blue-400">{formData.address?.zipCode}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARENTS & FAMILY */}
          {activeTab === 'family' && (
            <div className="space-y-6">
              {/* Father's Profile */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-2 mb-3">
                  <UserIcon className="w-4 h-4" />
                  <span>Father's Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Father's Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.parents?.fatherName || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parents: { ...formData.parents, fatherName: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">{formData.parents?.fatherName || 'N/A'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Father's Contact (PH)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.parents?.fatherContact || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parents: { ...formData.parents, fatherContact: e.target.value },
                          })
                        }
                        placeholder="+63 9XX XXX XXXX"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formData.parents?.fatherContact || 'N/A'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Occupation
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.parents?.fatherOccupation || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parents: { ...formData.parents, fatherOccupation: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="text-slate-800 dark:text-slate-200">{formData.parents?.fatherOccupation || 'N/A'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mother's Profile */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-2 mb-3">
                  <UserIcon className="w-4 h-4" />
                  <span>Mother's (Maiden) Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Mother's Maiden Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.parents?.motherName || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parents: { ...formData.parents, motherName: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">{formData.parents?.motherName || 'N/A'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Mother's Contact (PH)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.parents?.motherContact || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parents: { ...formData.parents, motherContact: e.target.value },
                          })
                        }
                        placeholder="+63 9XX XXX XXXX"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formData.parents?.motherContact || 'N/A'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Occupation
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.parents?.motherOccupation || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parents: { ...formData.parents, motherOccupation: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="text-slate-800 dark:text-slate-200">{formData.parents?.motherOccupation || 'N/A'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Guardian Profile */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-2 mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorized Legal Guardian (if different from parents)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Guardian Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.parents?.guardianName || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parents: { ...formData.parents, guardianName: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">{formData.parents?.guardianName || 'N/A'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Relationship
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.parents?.guardianRelationship || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parents: { ...formData.parents, guardianRelationship: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="text-slate-800 dark:text-slate-200">{formData.parents?.guardianRelationship || 'N/A'}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Guardian Phone (PH)
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.parents?.guardianContact || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parents: { ...formData.parents, guardianContact: e.target.value },
                          })
                        }
                        placeholder="+63 9XX XXX XXXX"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formData.parents?.guardianContact || 'N/A'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EMERGENCY CONTACT (PH) */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div className="bg-rose-50/70 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/40">
                <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-black text-xs uppercase tracking-wider mb-4">
                  <ShieldAlert className="w-5 h-5" />
                  <span>24/7 Primary Emergency Contact Person</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Emergency Contact Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.emergencyContact?.name || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                        required
                      />
                    ) : (
                      <div className="font-black text-base text-slate-900 dark:text-white">
                        {formData.emergencyContact?.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Relationship to Student
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.emergencyContact?.relationship || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, relationship: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                        required
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formData.emergencyContact?.relationship}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      24/7 Mobile Hotline Number (PH)
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <Phone className="w-4 h-4 text-rose-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={formData.emergencyContact?.contactNumber || ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              emergencyContact: { ...formData.emergencyContact, contactNumber: e.target.value },
                            })
                          }
                          placeholder="+63 9XX XXX XXXX"
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-rose-600 dark:text-rose-400"
                          required
                        />
                      </div>
                    ) : (
                      <div className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-rose-500" />
                        <span>{formData.emergencyContact?.contactNumber}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Alternate / Landline Number
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.emergencyContact?.alternateContact || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, alternateContact: e.target.value },
                          })
                        }
                        placeholder="(02) 8XXX-XXXX"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {formData.emergencyContact?.alternateContact || 'None Listed'}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                      Emergency Physical Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.emergencyContact?.address || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: { ...formData.emergencyContact, address: e.target.value },
                          })
                        }
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      />
                    ) : (
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formData.emergencyContact?.address || formData.address?.street + ', ' + formData.address?.city}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACADEMICS & ENROLLMENT STATUS */}
          {activeTab === 'academics' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70">
                <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-2 mb-4">
                  <GraduationCap className="w-4 h-4" />
                  <span>Academic Standing & Status</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Official Enrollment Status
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.enrollmentStatus}
                        onChange={(e) => setFormData({ ...formData, enrollmentStatus: e.target.value as EnrollmentStatus })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        {enrollmentStatusOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-lg text-xs font-extrabold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                        {formData.enrollmentStatus}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Academic Department
                    </label>
                    <div className="font-bold text-slate-900 dark:text-white">{formData.department}</div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Degree Program & Year Level
                    </label>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formData.program} ({formData.yearLevel})
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Admission Date
                    </label>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {formData.admissionDate || 'June 2024'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Cumulative GPA
                    </label>
                    <div className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                      {formData.gpa.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Semester Attendance Rate
                    </label>
                    <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {formData.overallAttendance}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          {isEditing && (
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Student Record</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
