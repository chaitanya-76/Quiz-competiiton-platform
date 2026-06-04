import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [fileKey, setFileKey] = useState(Date.now());
  const [questionFile, setQuestionFile] = useState(null);
  const [questionResult, setQuestionResult] = useState(null);
  const [questionStats, setQuestionStats] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearQuestions, setYearQuestions] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [studentStats, setStudentStats] = useState(null);
  const [yearStudents, setYearStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");
  const [selectedStudentYear, setSelectedStudentYear] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const navigate = useNavigate();

  const filteredStudents = yearStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.enrollment_no.includes(studentSearch),
  );

  const filteredQuestions = yearQuestions.filter((question) =>
    question.question_text.toLowerCase().includes(questionSearch.toLowerCase()),
  );

  const viewQuestions = async (year) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/quiz/questions/${year}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedYear(year);

      setYearQuestions(response.data);

      setShowQuestionModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchStudentStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/auth/student-stats/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStudentStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const viewStudents = async (year) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get(`/auth/students/${year}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedStudentYear(year);

      setYearStudents(response.data);

      setShowStudentModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchQuestionStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/quiz/question-stats/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data);

      setQuestionStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteQuestions = async (year) => {
    const confirmDelete = window.confirm(`Delete all Year ${year} questions?`);

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      const response = await api.delete(`/quiz/delete-questions/${year}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert(response.data.message);
    } catch (error) {
      console.log(error);
    }
    await fetchQuestionStats();
  };

  const handleQuestionImport = async () => {
    if (!questionFile) {
      alert("Please select a CSV file");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", questionFile);

      const response = await api.post("/quiz/bulk-question-import/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuestionResult(response.data);
      setQuestionFile(null);
      await fetchQuestionStats();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to import questions. Check your CSV format.";
      alert(message);
      console.error(error);
    }
  };

  const handleBulkImport = async () => {
    if (!selectedFile) {
      alert("Please select a CSV file");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await api.post("/auth/bulk-import/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setImportResult(response.data);

      await Promise.fetchStats();
      (await Promise.fetchLeaderboard(), setSelectedFile(null));
      setSelectedFile(null);
      setFileKey(Date.now());
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to import students. Check your CSV format.";
      alert(message);
      console.error(error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLeaderboard();
      fetchStats();
      fetchQuestionStats();
      fetchStudentStats();
    }, 10000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const isAdmin = localStorage.getItem("is_admin_user");

    if (isAdmin !== "true") {
      navigate("/dashboard");
      return;
    }

    const loadData = async () => {
      await Promise.all([
        fetchStats(),
        fetchLeaderboard(),
        fetchQuestionStats(),
        fetchStudentStats(),
      ]);

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/quiz/admin-stats/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/quiz/leaderboard/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLeaderboard(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleExport = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      "http://127.0.0.1:8000/api/quiz/export-results/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "quiz_results.csv";

    document.body.appendChild(a);

    a.click();

    a.remove();
  };

  const filteredLeaderboard = leaderboard.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.enrollment_no.includes(search),
  );

  if (loading) {
    return (
      <div className="h-screen w-full bg-[#171717] flex justify-center items-center">
        <div className="flex flex-col items-center gap-6">
          <div className="h-16 w-16 border-4 border-[#ff4000] border-t-transparent rounded-full animate-spin"></div>

          <h1 className="text-[#ff4000] text-2xl font-bold">
            Loading Admin Dashboard...
          </h1>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#171717] text-white p-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-5xl font-bold text-[#ff4000]">
          Conquer Mind Admin
        </h1>
        <div className="flex gap-[3vh]">
          <p className="text-green-400 text-sm content-center">
            ● Auto Refresh Every 10 Seconds
          </p>
          <button
            onClick={handleExport}
            className="bg-[#ff4000] px-4 py-2 rounded-lg cursor-pointer"
          >
            Export Results
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded-lg cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-[#0a0a0a] p-5 rounded-xl mb-8 flex items-center">
        <div className="w-1/2">
          <h2 className="text-2xl font-bold mb-4 text-[#ff4000]">
            Bulk Import Students
          </h2>

          <div className="flex gap-4 items-center">
            <input
              key={fileKey}
              type="file"
              accept=".csv"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="bg-[#171717] p-3 rounded-lg cursor-pointer"
            />

            <button
              onClick={handleBulkImport}
              className="bg-[#ff4000] text-black px-5 py-3 rounded-lg font-semibold cursor-pointer"
            >
              Import Students
            </button>
          </div>

          {importResult && (
            <div className="mt-4 text-green-400">
              Created: {importResult.created} | Skipped: {importResult.skipped}
            </div>
          )}
        </div>
        <div className="bg-[#0a0a0a] p-5 rounded-xl mb-8 w-1/2">
          <h2 className="text-2xl font-bold text-[#ff4000] mb-5 text-center">
            Student Bank
          </h2>

          <div className="flex justify-evenly">
            <div className="bg-[#171717] p-4 rounded-lg">
              <p>First Year</p>
              <p className="text-3xl font-bold">{studentStats?.year_1 ?? 0}</p>

              <button
                onClick={() => viewStudents("1")}
                className="mt-3 bg-[#ff4000] text-black px-3 py-1 rounded cursor-pointer"
              >
                View
              </button>
            </div>

            <div className="bg-[#171717] p-4 rounded-lg">
              <p>Second Year</p>
              <p className="text-3xl font-bold">{studentStats?.year_2 ?? 0}</p>

              <button
                onClick={() => viewStudents("2")}
                className="mt-3 bg-[#ff4000] text-black px-3 py-1 rounded cursor-pointer"
              >
                View
              </button>
            </div>

            <div className="bg-[#171717] p-4 rounded-lg">
              <p>Third Year</p>
              <p className="text-3xl font-bold">{studentStats?.year_3 ?? 0}</p>

              <button
                onClick={() => viewStudents("3")}
                className="mt-3 bg-[#ff4000] text-black px-3 py-1 rounded cursor-pointer"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] p-5 rounded-xl mb-8 flex items-center">
        <div className="w-1/2">
          <h2 className="text-2xl font-bold text-[#ff4000] mb-4">
            Bulk Import Questions
          </h2>

          <input
            key={fileKey}
            type="file"
            accept=".csv"
            onChange={(e) => setQuestionFile(e.target.files[0])}
            className="bg-[#171717] p-3 rounded-lg cursor-pointer"
          />

          <button
            onClick={handleQuestionImport}
            className="bg-[#ff4000] text-black px-5 py-2 rounded-lg ml-4 cursor-pointer"
          >
            Import Questions
          </button>

          {questionResult && (
            <p className="mt-3 text-green-400">
              Questions Imported:
              {questionResult.created}
            </p>
          )}
        </div>
        <div className="bg-[#0a0a0a] p-5 rounded-xl mb-8 w-1/2">
          <h2 className="text-2xl font-bold text-[#ff4000] mb-5 text-center">
            Question Bank
          </h2>

          <div className="flex justify-evenly">
            <div className="bg-[#171717] p-4 rounded-lg">
              <p>First Year</p>
              <p className="text-3xl font-bold">{questionStats?.year_1 ?? 0}</p>

              <button
                onClick={() => viewQuestions("1")}
                className="mt-3 bg-[#ff4000] text-black px-3 py-1 rounded cursor-pointer"
              >
                View
              </button>
            </div>

            <div className="bg-[#171717] p-4 rounded-lg">
              <p>Second Year</p>
              <p className="text-3xl font-bold">{questionStats?.year_2 ?? 0}</p>

              <button
                onClick={() => viewQuestions("2")}
                className="mt-3 bg-[#ff4000] text-black px-3 py-1 rounded cursor-pointer"
              >
                View
              </button>
            </div>

            <div className="bg-[#171717] p-4 rounded-lg">
              <p>Third Year</p>
              <p className="text-3xl font-bold">{questionStats?.year_3 ?? 0}</p>

              <button
                onClick={() => viewQuestions("3")}
                className="mt-3 bg-[#ff4000] text-black px-3 py-1 rounded cursor-pointer"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] p-5 rounded-xl mb-8">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Delete Questions
        </h2>

        <div className="flex gap-4">
          <button
            onClick={() => deleteQuestions("1")}
            className="bg-red-600 px-4 py-2 rounded-lg cursor-pointer"
          >
            Delete Year 1
          </button>

          <button
            onClick={() => deleteQuestions("2")}
            className="bg-red-600 px-4 py-2 rounded-lg cursor-pointer"
          >
            Delete Year 2
          </button>

          <button
            onClick={() => deleteQuestions("3")}
            className="bg-red-600 px-4 py-2 rounded-lg cursor-pointer"
          >
            Delete Year 3
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-10">
        <div className="bg-[#0a0a0a] p-5 rounded-xl">
          <h2 className="text-gray-400">Total Students</h2>
          <p className="text-4xl font-bold">{stats?.total_students ?? 0}</p>
        </div>

        <div className="bg-[#0a0a0a] p-5 rounded-xl">
          <h2 className="text-gray-400">Submissions</h2>
          <p className="text-4xl font-bold">{stats?.total_submissions ?? 0}</p>
        </div>

        <div className="bg-[#0a0a0a] p-5 rounded-xl">
          <h2 className="text-gray-400">Highest Score</h2>
          <p className="text-4xl font-bold">{stats?.highest_score ?? 0}</p>
        </div>

        <div className="bg-[#0a0a0a] p-5 rounded-xl">
          <h2 className="text-gray-400">Average Score</h2>
          <p className="text-4xl font-bold">{stats?.average_score ?? 0}</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] rounded-xl p-5">
        <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
        <input
          type="text"
          placeholder="Search by name or enrollment"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#171717] border border-[#ff4000] rounded-lg p-3 mb-5"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3">Rank</th>
                <th className="p-3">Name</th>
                <th className="p-3">Enrollment</th>
                <th className="p-3">Year</th>
                <th className="p-3">Score</th>
                <th className="p-3">Violations</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeaderboard.map((student) => (
                <tr
                  key={student.enrollment_no}
                  className={`border-b border-gray-800 hover:bg-[#171717]
                  ${student.rank === 1 ? "bg-yellow-500/10" : ""}
                  ${student.rank === 2 ? "bg-gray-400/10" : ""}
                  ${student.rank === 3 ? "bg-orange-500/10" : ""}
                `}
                >
                  <td className="p-3 font-bold">
                    {student.rank === 1 && "🥇"}
                    {student.rank === 2 && "🥈"}
                    {student.rank === 3 && "🥉"}
                    {student.rank > 3 && `#${student.rank}`}
                  </td>
                  <td className="p-3">{student.name}</td>
                  <td className="p-3">{student.enrollment_no}</td>
                  <td className="p-3">{student.year}</td>
                  <td
                    className={`p-3 font-bold
                    ${student.rank <= 3 ? "text-yellow-400" : "text-[#ff4000]"}`}
                  >
                    {student.score}
                  </td>
                  <td
                    className={`p-3 font-bold
                      ${
                        student.violations === 0
                          ? "text-green-400"
                          : student.violations <= 2
                            ? "text-yellow-400"
                            : "text-red-500"
                      }
                    `}
                    >
                    {student.violations}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[9999]">
          <div className="bg-[#0a0a0a] w-[80%] h-[80%] rounded-xl p-6 overflow-y-auto">
            <div className="flex justify-between mb-5 items-center">
              <h2 className="text-3xl font-bold text-[#ff4000]">
                Year {selectedYear} Questions
              </h2>
              <input
                type="text"
                placeholder="Search Question"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                className="w-full bg-[#171717] border border-[#ff4000] rounded-lg p-3"
              />
              <button
                onClick={() => {
                  setShowQuestionModal(false);
                  setQuestionSearch("");
                }}
                className="bg-red-600 px-4 py-2 rounded ml-[1vh] cursor-pointer"
              >
                Close
              </button>
            </div>

            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="bg-[#171717] p-4 rounded-lg mb-4"
              >
                <p className="font-semibold">{question.question_text}</p>

                <p className="text-[#ff4000] mt-2">
                  Correct: {question.correct_option}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[9999]">
          <div className="bg-[#0a0a0a] w-[80%] h-[80%] rounded-xl p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-3xl font-bold text-[#ff4000]">
                Year {selectedStudentYear} Students
              </h2>
              <input
                type="text"
                placeholder="Search by name or enrollment"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full bg-[#171717] border border-[#ff4000] rounded-lg p-3 "
              />
              <button
                onClick={() => {
                  setShowStudentModal(false);
                  setStudentSearch("");
                }}
                className="bg-red-600 px-4 py-2 rounded ml-[1vh] cursor-pointer"
              >
                Close
              </button>
            </div>

            {filteredStudents.map((student) => (
              <div
                key={student.enrollment_no}
                className="bg-[#171717] p-4 rounded-lg mb-4"
              >
                <p className="font-semibold">{student.name}</p>

                <p>{student.enrollment_no}</p>

                <p className="text-[#ff4000]">
                  {student.attempted ? "Submitted" : "Not Attempted"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
