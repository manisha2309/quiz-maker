import React, { useState } from 'react';
import { Plus, Trash2, Edit, Play, List, Home, User, LogOut, BookOpen } from 'lucide-react';

const QuizMaker = () => {
  const [currentPage, setCurrentPage] = useState('auth');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizInProgress, setQuizInProgress] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizResults, setQuizResults] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [authMode, setAuthMode] = useState('login');
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });

  const handleRegister = (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (users.find(u => u.username === registerForm.username)) {
      alert('Username already exists!');
      return;
    }
    const newUser = { id: Date.now(), username: registerForm.username, password: registerForm.password };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setCurrentPage('home');
    setRegisterForm({ username: '', password: '', confirmPassword: '' });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.username === loginForm.username && u.password === loginForm.password);
    if (user) {
      setCurrentUser(user);
      setCurrentPage('home');
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Invalid credentials!');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('auth');
  };

  const addQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    }));
  };

  const removeQuestion = (index) => {
    setQuizForm(prev => ({ ...prev, questions: prev.questions.filter((_, i) => i !== index) }));
  };

  const updateQuestion = (qIndex, field, value) => {
    setQuizForm(prev => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex] = { ...newQuestions[qIndex], [field]: value };
      return { ...prev, questions: newQuestions };
    });
  };

  const updateOption = (qIndex, optIndex, value) => {
    setQuizForm(prev => {
      const newQuestions = [...prev.questions];
      const newOptions = [...newQuestions[qIndex].options];
      newOptions[optIndex] = value;
      newQuestions[qIndex] = { ...newQuestions[qIndex], options: newOptions };
      return { ...prev, questions: newQuestions };
    });
  };

  const saveQuiz = () => {
    if (!quizForm.title || quizForm.questions.some(q => !q.question || q.options.some(o => !o))) {
      alert('Please fill all fields!');
      return;
    }
    const newQuiz = {
      id: currentQuiz ? currentQuiz.id : Date.now(),
      ...quizForm,
      createdBy: currentUser.username,
      createdAt: new Date().toISOString()
    };
    if (currentQuiz) {
      setQuizzes(prev => prev.map(q => q.id === currentQuiz.id ? newQuiz : q));
    } else {
      setQuizzes(prev => [...prev, newQuiz]);
    }
    setQuizForm({ title: '', description: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] });
    setCurrentQuiz(null);
    setCurrentPage('list');
  };

  const deleteQuiz = (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      setQuizzes(prev => prev.filter(q => q.id !== id));
    }
  };

  const editQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setQuizForm({ title: quiz.title, description: quiz.description, questions: quiz.questions });
    setCurrentPage('create');
  };

  const startQuiz = (quiz) => {
    setQuizInProgress(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizResults(null);
    setCurrentPage('taking');
  };

  const selectAnswer = (answerIndex) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = answerIndex;
      return newAnswers;
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quizInProgress.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = () => {
    let score = 0;
    quizInProgress.questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswer) score++;
    });
    setQuizResults({
      score,
      total: quizInProgress.questions.length,
      percentage: ((score / quizInProgress.questions.length) * 100).toFixed(2)
    });
    setCurrentPage('results');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <BookOpen className="w-16 h-16 mx-auto text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800">Quiz Maker</h1>
            <p className="text-gray-600">Create and take quizzes online</p>
          </div>
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button onClick={() => setAuthMode('login')} className={`flex-1 py-2 rounded-md transition ${authMode === 'login' ? 'bg-white shadow' : ''}`}>Login</button>
            <button onClick={() => setAuthMode('register')} className={`flex-1 py-2 rounded-md transition ${authMode === 'register' ? 'bg-white shadow' : ''}`}>Register</button>
          </div>
          {authMode === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input type="text" value={loginForm.username} onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input type="password" value={loginForm.password} onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Login</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input type="text" value={registerForm.username} onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input type="password" value={registerForm.confirmPassword} onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <button onClick={handleRegister} className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">Register</button>
            </div>
          )}
          <div className="mt-6 text-center">
            <button onClick={() => { setCurrentUser({ id: 0, username: 'Guest' }); setCurrentPage('home'); }} className="text-blue-600 hover:underline text-sm">Continue as Guest</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">Quiz Maker</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentPage('home')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentPage === 'home' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}><Home className="w-5 h-5" /><span className="hidden sm:inline">Home</span></button>
              <button onClick={() => setCurrentPage('create')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentPage === 'create' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}><Plus className="w-5 h-5" /><span className="hidden sm:inline">Create</span></button>
              <button onClick={() => setCurrentPage('list')} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${currentPage === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}><List className="w-5 h-5" /><span className="hidden sm:inline">Quizzes</span></button>
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg"><User className="w-5 h-5 text-gray-600" /><span className="text-gray-800 hidden sm:inline">{currentUser.username}</span></div>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"><LogOut className="w-5 h-5" /><span className="hidden sm:inline">Logout</span></button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'home' && (
          <div className="text-center">
            <div className="mb-8">
              <BookOpen className="w-24 h-24 mx-auto text-blue-600 mb-4" />
              <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Quiz Maker</h1>
              <p className="text-xl text-gray-600 mb-2">Hello, {currentUser.username}!</p>
              <p className="text-gray-500">Create amazing quizzes or test your knowledge</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button onClick={() => setCurrentPage('create')} className="bg-blue-600 text-white p-8 rounded-lg hover:bg-blue-700 transition shadow-lg"><Plus className="w-12 h-12 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Create Quiz</h3><p className="text-blue-100">Build your own custom quiz</p></button>
              <button onClick={() => setCurrentPage('list')} className="bg-purple-600 text-white p-8 rounded-lg hover:bg-purple-700 transition shadow-lg"><List className="w-12 h-12 mx-auto mb-4" /><h3 className="text-xl font-semibold mb-2">Take Quiz</h3><p className="text-purple-100">Browse and take available quizzes</p></button>
            </div>
            <div className="mt-12 bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Platform Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg"><p className="text-3xl font-bold text-blue-600">{quizzes.length}</p><p className="text-gray-600">Total Quizzes</p></div>
                <div className="bg-white p-4 rounded-lg"><p className="text-3xl font-bold text-purple-600">{users.length}</p><p className="text-gray-600">Registered Users</p></div>
              </div>
            </div>
          </div>
        )}
        {currentPage === 'create' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{currentQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h2>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Title</label>
                <input type="text" value={quizForm.title} onChange={(e) => setQuizForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter quiz title" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={quizForm.description} onChange={(e) => setQuizForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter quiz description" rows="3" />
              </div>
            </div>
            {quizForm.questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-white rounded-lg shadow p-6 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Question {qIndex + 1}</h3>
                  {quizForm.questions.length > 1 && (<button onClick={() => removeQuestion(qIndex)} className="text-red-600 hover:text-red-800"><Trash2 className="w-5 h-5" /></button>)}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                  <input type="text" value={q.question} onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Enter your question" />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Answer Options</label>
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-3">
                      <input type="radio" name={`correct-${qIndex}`} checked={q.correctAnswer === optIndex} onChange={() => updateQuestion(qIndex, 'correctAnswer', optIndex)} className="w-5 h-5 text-blue-600" />
                      <input type="text" value={opt} onChange={(e) => updateOption(qIndex, optIndex, e.target.value)} className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={`Option ${optIndex + 1}`} />
                      <span className="text-sm text-gray-500 w-20">{q.correctAnswer === optIndex && '✓ Correct'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex gap-4">
              <button onClick={addQuestion} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"><Plus className="w-5 h-5" />Add Question</button>
              <button onClick={saveQuiz} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Save Quiz</button>
              <button onClick={() => { setCurrentPage('list'); setCurrentQuiz(null); setQuizForm({ title: '', description: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }] }); }} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Cancel</button>
            </div>
          </div>
        )}
        {currentPage === 'list' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Available Quizzes</h2>
            {quizzes.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 mb-4">No quizzes available yet</p>
                <button onClick={() => setCurrentPage('create')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Create First Quiz</button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {quizzes.map((quiz) => (
                  <div key={quiz.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{quiz.title}</h3>
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span>{quiz.questions.length} Questions</span>
                      <span>•</span>
                      <span>By {quiz.createdBy}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startQuiz(quiz)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex-1"><Play className="w-4 h-4" />Take Quiz</button>
                      {currentUser.username === quiz.createdBy && (
                        <>
                          <button onClick={() => editQuiz(quiz)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => deleteQuiz(quiz.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {currentPage === 'taking' && quizInProgress && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{quizInProgress.title}</h2>
                <span className="text-gray-600">Question {currentQuestionIndex + 1} of {quizInProgress.questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / quizInProgress.questions.length) * 100}%` }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-6">{quizInProgress.questions[currentQuestionIndex].question}</h3>
              <div className="space-y-3">
                {quizInProgress.questions[currentQuestionIndex].options.map((opt, index) => (
                  <button key={index} onClick={() => selectAnswer(index)} className={`w-full text-left px-6 py-4 rounded-lg border-2 transition ${userAnswers[currentQuestionIndex] === index ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${userAnswers[currentQuestionIndex] === index ? 'border-blue-600 bg-blue-600' : 'border-gray-400'}`}>
                        {userAnswers[currentQuestionIndex] === index && (<div className="w-3 h-3 bg-white rounded-full" />)}
                      </div>
                      <span className="text-gray-800">{opt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={previousQuestion} disabled={currentQuestionIndex === 0} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              {currentQuestionIndex === quizInProgress.questions.length - 1 ? (
                <button onClick={submitQuiz} disabled={userAnswers.length !== quizInProgress.questions.length} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">Submit Quiz</button>
              ) : (
                <button onClick={nextQuestion} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Next</button>
              )}
            </div>
          </div>
        )}
        {currentPage === 'results' && quizResults && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
              <div className="mb-6">
                <p className={`text-6xl font-bold mb-2 ${parseFloat(quizResults.percentage) >= 90 ? 'text-green-600' : parseFloat(quizResults.percentage) >= 80 ? 'text-green-500' : parseFloat(quizResults.percentage) >= 70 ? 'text-blue-600' : parseFloat(quizResults.percentage) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{quizResults.percentage}%</p>
                <p className="text-2xl text-gray-600 mb-2">{parseFloat(quizResults.percentage) >= 90 ? 'Excellent!' : parseFloat(quizResults.percentage) >= 80 ? 'Great job!' : parseFloat(quizResults.percentage) >= 70 ? 'Good work!' : parseFloat(quizResults.percentage) >= 60 ? 'Not bad!' : 'Keep practicing!'}</p>
                <p className="text-xl text-gray-700">You scored {quizResults.score} out of {quizResults.total}</p>
              </div>
              <div className="inline-block bg-gray-100 rounded-lg p-4 mb-6">
                <p className={`text-4xl font-bold ${parseFloat(quizResults.percentage) >= 90 ? 'text-green-600' : parseFloat(quizResults.percentage) >= 80 ? 'text-green-500' : parseFloat(quizResults.percentage) >= 70 ? 'text-blue-600' : parseFloat(quizResults.percentage) >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>Grade: {parseFloat(quizResults.percentage) >= 90 ? 'A+' : parseFloat(quizResults.percentage) >= 80 ? 'A' : parseFloat(quizResults.percentage) >= 70 ? 'B' : parseFloat(quizResults.percentage) >= 60 ? 'C' : 'D'}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Review Answers</h3>
              {quizInProgress.questions.map((q, index) => (
                <div key={index} className="mb-6 pb-6 border-b last:border-b-0">
                  <p className="font-semibold text-gray-800 mb-3">{index + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className={`px-4 py-2 rounded-lg ${optIndex === q.correctAnswer ? 'bg-green-100 border-2 border-green-500' : userAnswers[index] === optIndex ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-50'}`}>
                        <span className="text-gray-800">{opt}</span>
                        {optIndex === q.correctAnswer && (<span className="ml-2 text-green-600 font-semibold">✓ Correct Answer</span>)}
                        {userAnswers[index] === optIndex && optIndex !== q.correctAnswer && (<span className="ml-2 text-red-600 font-semibold">✗ Your Answer</span>)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button onClick={() => startQuiz(quizInProgress)} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Retake Quiz</button>
              <button onClick={() => { setCurrentPage('list'); setQuizInProgress(null); }} className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Back to Quizzes</button>
            </div>
          </div>
        )}
      </main>
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600">Quiz Maker Platform © 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default QuizMaker;