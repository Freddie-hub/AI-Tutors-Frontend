import { useState, useEffect } from 'react';

// Model
interface GCSECourse {
    id: string;
    name: string;
    description: string;
    duration: string;
    level: string;
    subjects: string[];
}

// Data
const gcseCourses: GCSECourse[] = [
    {
        id: '1',
        name: 'Mathematics',
        description: 'Comprehensive GCSE Mathematics course covering algebra, geometry, and statistics',
        duration: '2 years',
        level: 'Foundation/Higher',
        subjects: ['Algebra', 'Geometry', 'Statistics', 'Number']
    },
    {
        id: '2',
        name: 'English Language',
        description: 'GCSE English Language focusing on reading, writing, and communication skills',
        duration: '2 years',
        level: 'Foundation/Higher',
        subjects: ['Reading', 'Writing', 'Speaking', 'Listening']
    },
    {
        id: '3',
        name: 'Science (Combined)',
        description: 'Triple science covering Biology, Chemistry, and Physics fundamentals',
        duration: '2 years',
        level: 'Foundation/Higher',
        subjects: ['Biology', 'Chemistry', 'Physics']
    },
    {
        id: '4',
        name: 'History',
        description: 'GCSE History exploring key historical periods and analytical skills',
        duration: '2 years',
        level: 'Higher',
        subjects: ['Modern History', 'Medieval History', 'Source Analysis']
    }
];

// View Components
const CourseCard = ({ course, onViewCourse }: { course: GCSECourse; onViewCourse: (course: GCSECourse) => void }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{course.name}</h3>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500">Duration: {course.duration}</span>
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {course.level}
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                {course.subjects.map((subject, index) => (
                    <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                    >
                        {subject}
                    </span>
                ))}
            </div>
            <button 
                onClick={() => onViewCourse(course)}
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
                View Course
            </button>
        </div>
    );
};

const MotivationalModal = ({ isOpen, onClose, onClick}: { isOpen: boolean; onClose: () => void; onClick: () => void }) => {
    const [step, setStep] = useState(0);
    
    const motivationalSteps = [
        {
            emoji: "🎯",
            title: "Hi, we see you are ready to achieve excellence, continued learning",
            message: "Your future starts with the decisions you make today. You are the sum of your actions."
        },
        {
            emoji: "🚀",
            title: "Welcome, join thousands of successful people ",
            message: "78% of our users achieve their target grades or higher, and have gone on to become leaders in their fields."
        },
        {
            emoji: "💡",
            title: "Don't Wait to Start Your Journey",
            message: "The best time to invest in your education is now! Every moment you delay is a missed opportunity to excel."
        },
        {
            emoji: "📚",
            title: "Unlock Your Potential. Join the elite today, where you belong.",
            message: "Education is the most powerful weapon to change the world. Start your lifelong learning journey with us?"
        }
    ];

    useEffect(() => {
        if (isOpen && step < motivationalSteps.length - 1) {
            const timer = setTimeout(() => {
                setStep(s => s + 1);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, step]);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const currentStep = motivationalSteps[step];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform animate-bounce-in">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">{currentStep.emoji}</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3">{currentStep.title}</h2>
                    <p className="text-gray-600 mb-6">{currentStep.message}</p>
                    
                    <div className="flex gap-2 justify-center mb-4">
                        {motivationalSteps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                                    idx === step ? 'bg-blue-600 w-8' : 'bg-gray-300'
                                }`}
                            />
                        ))}
                    </div>

                    {step === motivationalSteps.length - 1 && (
                        <div className="space-y-3 animate-fade-in">
                            <button 
                            onClick={onClick}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105">
                                Start an adaptive course right now
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full bg-gray-100 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                I will look at the current provided courses and see what fits me best
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes bounce-in {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
                
                .animate-bounce-in {
                    animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
                }
            `}</style>
        </div>
    );
};



// Main Component
export default function GCSECoursesPage() {
    const [showModal, setShowModal] = useState(false);
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<GCSECourse | null>(null);
    const [courseData, setCourseData] = useState({
        name: '',
        description: '',
        duration: '',
        level: '',
        subjects: [] as string[]
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowModal(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleStartGeneratingNewCourse = () => {
        setShowCourseForm(true);
        setShowModal(false);
    };

    const handleViewCourse = (course: GCSECourse) => {
        setSelectedCourse(course);
        console.log('Viewing course:', course);
        // Here you can add navigation logic or show course details
        // For example: router.push(`/courses/${course.id}`)
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCourseData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubjectAdd = (subject: string) => {
        if (subject && !courseData.subjects.includes(subject)) {
            setCourseData(prev => ({
                ...prev,
                subjects: [...prev.subjects, subject]
            }));
        }
    };

    const handleSubjectRemove = (subjectToRemove: string) => {
        setCourseData(prev => ({
            ...prev,
            subjects: prev.subjects.filter(subject => subject !== subjectToRemove)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('New course data:', courseData);
        // Here you would typically send the data to your backend
        setShowCourseForm(false);
        setCourseData({
            name: '',
            description: '',
            duration: '',
            level: '',
            subjects: []
        });
    };

    // Course Generation Form Component
    const CourseGenerationForm = () => {
        const [newSubject, setNewSubject] = useState('');

        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Your Custom Course</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Course Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={courseData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={courseData.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Duration
                                </label>
                                <select
                                    name="duration"
                                    value={courseData.duration}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select duration</option>
                                    <option value="1 year">1 year</option>
                                    <option value="2 years">2 years</option>
                                    <option value="3 years">3 years</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Level
                                </label>
                                <select
                                    name="level"
                                    value={courseData.level}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select level</option>
                                    <option value="Foundation">Foundation</option>
                                    <option value="Higher">Higher</option>
                                    <option value="Foundation/Higher">Foundation/Higher</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subjects
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={newSubject}
                                    onChange={(e) => setNewSubject(e.target.value)}
                                    placeholder="Add a subject"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSubjectAdd(newSubject);
                                            setNewSubject('');
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSubjectAdd(newSubject);
                                        setNewSubject('');
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {courseData.subjects.map((subject, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                    >
                                        {subject}
                                        <button
                                            type="button"
                                            onClick={() => handleSubjectRemove(subject)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Create Course
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCourseForm(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">GCSE Courses</h1>
                <p className="text-gray-600">
                    Explore our comprehensive GCSE course offerings designed to help you succeed
                </p>
            </div>

            <MotivationalModal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)} 
                onClick={handleStartGeneratingNewCourse} 
            />

            {showCourseForm && <CourseGenerationForm />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gcseCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onViewCourse={handleViewCourse} />
                ))}
            </div>
        </div>
    );
}


