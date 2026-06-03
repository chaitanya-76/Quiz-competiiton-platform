import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "remixicon/fonts/remixicon.css";

const Quiz = () => {
  const QUIZ_DURATION = 60 * 60;
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [warnings, setWarnings] = useState(0);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (isSubmitting) return;
      if (!document.fullscreenElement) {
        setWarnings((prev) => prev + 1);
        setShowFullscreenModal(true);
        recordViolation();
      } else {
        setShowFullscreenModal(false);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isSubmitting]);

  useEffect(() => {
    const savedAnswers = localStorage.getItem("quizAnswers");

    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("quizAnswers", JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setWarnings((prev) => prev + 1);
        recordViolation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    if (warnings >= 3) {
      setShowViolationModal(true);

      setTimeout(() => {
        handleSubmit(true);
      }, 3000);
    }
  }, [warnings]);

  useEffect(() => {
    window.onbeforeunload = () => true;

    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.get("/quiz/questions/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setQuestions(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.log(err);
      }
    };

    enterFullscreen();
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await api.get("/quiz/status/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.attempted) {
          navigate("/attempted");
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkStatus();
  }, []);

  const recordViolation = async () => {
    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/quiz/record-violation/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleOptionSelect = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const reEnterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setShowFullscreenModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    setIsSubmitting(true);
    console.log("Submitting quiz with answers:", answers);

    try {
      // Check if user answered any questions
      if (Object.keys(answers).length === 0) {
        alert("Please answer at least one question before submitting.");
        setIsSubmitting(false);
        return;
      }

      let token = localStorage.getItem("token");
      console.log("Token:", token);

      if (!token) {
        console.error("No token found");
        alert("Authentication error. Please login again.");
        navigate("/");
        return;
      }

      const formattedAnswers = Object.entries(answers).map(
        ([questionId, selectedOption]) => ({
          question_id: Number(questionId),
          selected_option: selectedOption,
        }),
      );

      console.log("Formatted answers:", formattedAnswers);

      try {
        const response = await api.post(
          "/quiz/submit/",
          {
            answers: formattedAnswers,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("Submit response:", response.data);
        localStorage.removeItem("quizAnswers");
        navigate("/submitted");
      } catch (error) {
        // If token is invalid/expired, redirect to login
        if (error.response?.status === 401) {
          console.error("Token expired or invalid, redirecting to login");
          localStorage.removeItem("token");
          localStorage.removeItem("quizAnswers");
          alert("Your session has expired. Please login again.");
          navigate("/");
          return;
        }
        // If duplicate submission (UNIQUE constraint)
        if (
          error.response?.status === 500 &&
          error.response?.data?.includes?.("UNIQUE")
        ) {
          console.error("Quiz already submitted");
          alert(
            "You have already submitted this quiz. You cannot submit twice.",
          );
          navigate("/dashboard");
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error("Submit error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert(
        "Error submitting quiz: " +
          (error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const question = questions[currentQuestion];

  if (loading) {
    return (
      <div className="h-screen bg-[#171717] flex justify-center items-center">
        <div className="text-center">
          <div className="h-14 w-14 mx-auto border-4 border-[#ff4000] border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-white mt-4">Loading Questions...</h2>
        </div>
      </div>
    );
  }
  return (
    <div className="h-screen w-ful bg-[#171717] flex justify-center items-center gap-[3vh] py-[5vh]">
      <div className="h-full w-1/5 bg-[#0a0a0a] rounded-[2vh] flex flex-col justify-around items-center">
        <h2 className="text-center text-[5vh] font-archivo">
          Time Left <br />
          <span className="">{formatTime(timeLeft)}</span>
        </h2>
        <h3 className="text-center text-[3vh] font-archivo leading-[4vh] tracking-[0.5vh]">
          Answered
          <br />
          {Object.keys(answers).length}/
          <span className="text-[#ff4000]">{questions.length}</span>
        </h3>
      </div>
      <div className="h-full w-3/5 flex flex-col items-center gap-[5vh]">
        <h2 className="text-[3vh] font-lato font-extrabold tracking-[0.5vh] ">
          Question {currentQuestion + 1} of {questions.length}
        </h2>
        <div className="h-[0.5vh] w-[35vh] bg-linear-to-r from-transparent via-[#ff4000] to-transparent mt-[-4vh]" />
        <div className="bg-[#0a0a0a] min-h-[45vh] overflow-y-auto w-[90vh] py-[5vh] px-[3vh] flex flex-col justify-between rounded-[1vh] shadow-2xl">
          <h1 className="text-[3vh] font-bold mb-4">
            {question.question_text.split("|")[0]}
          </h1>

          <pre className="font-mono whitespace-pre-wrap text-[2.2vh]">
            {question.question_text.split("|").slice(1).join("\n")}
          </pre>
          <div className="flex flex-col text-[2.3vh] font-light">
            <label className="cursor-pointer hover:scale-101 transition-all text-[2.2vh]">
              <input
                type="radio"
                checked={answers[question.id] === "A"}
                onChange={() => handleOptionSelect(question.id, "A")}
              />
              {question.option_a}
            </label>

            <br />

            <label className="cursor-pointer hover:scale-101 transition-all text-[2.2vh]">
              <input
                type="radio"
                checked={answers[question.id] === "B"}
                onChange={() => handleOptionSelect(question.id, "B")}
              />
              {question.option_b}
            </label>

            <br />

            <label className="cursor-pointer hover:scale-101 transition-all text-[2.2vh]">
              <input
                type="radio"
                checked={answers[question.id] === "C"}
                onChange={() => handleOptionSelect(question.id, "C")}
              />
              {question.option_c}
            </label>

            <br />

            <label className="cursor-pointer hover:scale-101 transition-all text-[2.2vh]">
              <input
                type="radio"
                checked={answers[question.id] === "D"}
                onChange={() => handleOptionSelect(question.id, "D")}
              />
              {question.option_d}
            </label>
          </div>
          <br />
        </div>
        <div className="w-[50vh] h-[7vh] flex justify-center gap-[10vh] text-[3vh] font-lato font-bold">
          <button
            className="bg-[#34a9ec] w-[30vh] px-[3vh] rounded-[1vh] cursor-pointer "
            onClick={handlePrevious}
          >
            <i class="ri-arrow-left-line"></i> Previous
          </button>
          <button
            className="bg-[#32ce21] w-[20vh] px-[3vh] rounded-[1vh] cursor-pointer "
            onClick={handleNext}
          >
            Next <i class="ri-arrow-right-line"></i>
          </button>
        </div>
        <button
          className="bg-[#e30000] w-[20vh] h-[5vh] text-[2vh] font-bold rounded-[1vh] mt-[10vh] cursor-pointer"
          onClick={() => setShowSubmitModal(true)}
        >
          Submit Quiz
        </button>
      </div>
      <div className="h-full w-1/5 bg-[#0a0a0a] rounded-[2vh] flex justify-center items-center p-[2vh]">
        <div className="flex flex-wrap gap-[2vh] text-black  border-[#ff4000] border-y-[0.1vh] py-[2vh] px-[1vh] rounded-[0.2vh]">
          {questions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => setCurrentQuestion(index)}
              className={`h-[4vh] w-[4vh] rounded-full border-none cursor-pointer ${
                currentQuestion === index
                  ? "bg-purple-600 text-white"
                  : answers[question.id]
                    ? "bg-green-600 text-white"
                    : "bg-white border"
              } 
          `}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      {showFullscreenModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[9999]">
          <div className="bg-[#111] p-8 rounded-xl w-[450px] text-center border border-[#ff4000]">
            <h2 className="text-3xl font-bold text-[#ff4000] mb-4">
              Fullscreen Required
            </h2>

            <p className="mb-6 text-gray-300">
              You exited fullscreen mode. Please re-enter fullscreen to continue
              the quiz.
            </p>

            <p className="mb-2 text-red-400 font-bold">Warning {warnings}/3</p>

            <p className="mb-6 text-gray-300">
              You exited fullscreen mode. After 3 violations your quiz will be
              automatically submitted.
            </p>

            <button
              onClick={reEnterFullscreen}
              className="bg-[#ff4000] px-6 py-3 rounded-lg font-bold"
            >
              Re-enter Fullscreen
            </button>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[9999]">
          <div className="bg-[#111] p-8 rounded-xl w-[450px] text-center">
            <h2 className="text-3xl font-bold mb-4">Submit Quiz?</h2>

            <p className="text-gray-300 mb-6">
              Are you sure you want to submit your quiz?
            </p>

            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-600 px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                className="bg-red-600 px-6 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  handleSubmit();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showViolationModal && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[10000]">
          <div className="bg-[#111] border border-red-600 p-8 rounded-xl w-[500px] text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-4">
              Quiz Terminated
            </h2>

            <p className="text-gray-300 text-lg mb-4">
              Maximum violations reached.
            </p>

            <p className="text-red-400 font-semibold">
              Your quiz is being submitted automatically...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
