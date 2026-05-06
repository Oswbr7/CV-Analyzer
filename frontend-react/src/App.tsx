import { useState } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Briefcase,
  LoaderCircle,
  X,
  User,
  BadgeCheck
} from "lucide-react";

export default function App() {
  const [jobText, setJobText] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const dropped = Array.from(e.dataTransfer.files);

    setFiles((prev) => [...prev, ...dropped]);
    setDragActive(false);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const analyze = async () => {
    const formData = new FormData();

    formData.append("jobText", jobText);

    files.forEach((file) => {
      formData.append("files", file);
    });

    setLoading(true);

    const response = await fetch(
      "http://localhost:5139/cv/rank-pdfs",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    setResults(data.ranking);
    setLoading(false);
  };

  const getInterviewQuestions = (candidate: any) => {
    if (!candidate) return [];

    const questions = [];

    questions.push(
      "Tell us about a recent project you are most proud of."
    );

    if (candidate.missing_skills.includes("Docker")) {
      questions.push(
        "How would you deploy an application using Docker containers?"
      );
    }

    if (candidate.missing_skills.includes("Azure")) {
      questions.push(
        "What Azure services have you used in production?"
      );
    }

    if (candidate.missing_skills.includes("SQL")) {
      questions.push(
        "How do you optimize slow SQL queries?"
      );
    }

    if (candidate.score >= 75) {
      questions.push(
        "How do you mentor junior developers in a team?"
      );
    } else if (candidate.score >= 45) {
      questions.push(
        "How would you close your current skill gaps quickly?"
      );
    } else {
      questions.push(
        "Why are you interested in transitioning into this role?"
      );
    }

    questions.push(
      "How do you handle tight deadlines and changing priorities?"
    );

    return questions.slice(0, 5);
  };

  const openCandidate = async (candidate:any) => {

    setSelectedCandidate(candidate);

    setInsightLoading(true);

    const res = await fetch(
      "http://localhost:8000/candidate-insights",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          candidate,
          job: jobText
        })
      }
    );

    const data = await res.json();

    setInsight(data.insight);

    setInsightLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">

      <div className="max-w-5xl mx-auto">

        <div className="mb-10">

          <h1 className="text-5xl font-bold mb-2">
            AI Recruiter Dashboard
          </h1>

          <p className="text-slate-400 text-lg">
            Smart CV ranking powered by AI
          </p>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-7 shadow-2xl mb-10">

          <label className="flex items-center gap-2 mb-3 font-semibold">
            <Briefcase size={18} />
            Job Description
          </label>

          <textarea
            className="w-full bg-slate-800 rounded-2xl p-4 mb-6 outline-none"
            rows={4}
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-200 mb-6 ${
              dragActive
                ? "border-blue-400 bg-slate-800 scale-[1.02]"
                : "border-slate-700 bg-slate-900"
            }`}
          >

            <Upload className="mx-auto mb-3" size={34} />

            <p className="text-lg font-semibold mb-2">
              {dragActive
                ? "Drop files now"
                : "Drag & Drop PDF CVs"}
            </p>

            <p className="text-sm text-slate-400 mb-4">
              or choose files manually
            </p>

            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={(e) =>
                setFiles((prev) => [
                  ...prev,
                  ...Array.from(e.target.files || [])
                ])
              }
            />

          </div>

          {files.length > 0 && (

            <div className="bg-slate-800 rounded-2xl p-4 mb-6">

              <p className="font-semibold mb-4">
                {files.length} file(s) selected
              </p>

              <div className="space-y-3">

                {files.map((file, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between bg-slate-900 px-4 py-3 rounded-xl"
                  >

                    <div className="flex items-center gap-3 min-w-0">

                      <FileText size={18} />

                      <span className="truncate">
                        {file.name}
                      </span>

                    </div>

                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                ))}

              </div>

            </div>

          )}

          <button
            onClick={analyze}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-lg transition-all"
          >

            {loading ? (
              <span className="flex justify-center items-center gap-3">
                <LoaderCircle className="animate-spin" />
                Analyzing Candidates...
              </span>
            ) : (
              "Run AI Ranking"
            )}

          </button>

        </div>

        {/* // Show ranked candidates with visual score bars and matched/missing skills */}
        {results.length > 0 && (

          <div>

            <h2 className="text-3xl font-bold mb-6">
              Top Candidates
            </h2>

            <div className="space-y-5">

              {results.map((item, index) => (

                <div
                  key={index}
                  // onClick={() => setSelectedCandidate(item)
                  onClick={() => openCandidate(item)}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg animate-fadeIn cursor-pointer hover:border-blue-500 hover:scale-[1.01] transition-all"
                >

                  <div className="flex justify-between mb-4">

                    <div>
                      <h3 className="text-2xl font-bold">
                        {item.name}
                      </h3>

                      <p className="text-slate-400">
                        AI Ranked Candidate
                      </p>
                    </div>

                    <div className="text-3xl font-bold">
                      {item.score}%
                    </div>

                  </div>

                  <div className="w-full bg-slate-800 h-3 rounded-full mb-4">

                    <div
                      className={`h-3 rounded-full ${
                        item.score >= 75
                          ? "bg-green-500"
                          : item.score >= 45
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${item.score}%`
                      }}
                    />

                  </div>

                  <p className="mb-2">
                    <strong>Matched:</strong>{" "}
                    {item.matched_skills.join(", ") || "None"}
                  </p>

                  <p>
                    <strong>Missing:</strong>{" "}
                    {item.missing_skills.join(", ") || "None"}
                  </p>

                </div>

              ))}

            </div>

          </div>

        )}
        
        {/* // Modal for detailed candidate view with AI summary and interview questions */}
        {selectedCandidate && (

          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-5">

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-2xl w-full relative animate-fadeIn">

              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X />
              </button>

              <div className="flex items-center gap-4 mb-6">

                <div className="bg-blue-600 p-3 rounded-2xl">
                  <User />
                </div>

                <div>
                  <h2 className="text-3xl font-bold">
                    {selectedCandidate.name}
                  </h2>

                  <p className="text-slate-400">
                    Candidate Profile
                  </p>
                </div>

              </div>

              <div className="text-5xl font-bold mb-4">
                {selectedCandidate.score}%
              </div>

              <div className="w-full bg-slate-800 h-3 rounded-full mb-6">

                <div
                  className={`h-3 rounded-full ${
                    selectedCandidate.score >= 75
                      ? "bg-green-500"
                      : selectedCandidate.score >= 45
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${selectedCandidate.score}%`
                  }}
                />

              </div>

              <div className="space-y-4">

                <div>
                  <p className="font-semibold mb-2">
                    Matched Skills
                  </p>

                  <p className="text-slate-300">
                    {selectedCandidate.matched_skills.join(", ") || "None"}
                  </p>
                </div>

                <div>
                  <p className="font-semibold mb-2">
                    Missing Skills
                  </p>

                  <p className="text-slate-300">
                    {selectedCandidate.missing_skills.join(", ") || "None"}
                  </p>
                </div>

                <div className="bg-slate-800 rounded-2xl p-5 mt-5">

                  <p className="font-semibold mb-3">
                    GPT Candidate Insights
                  </p>

                  {insightLoading ? (
                    <p className="text-slate-400">
                      Generating insight...
                    </p>
                  ) : (
                    <p className="text-slate-300 whitespace-pre-line leading-7">
                      {insight}
                    </p>
                  )}

                </div>

                {/* // Show AI-generated interview questions based on candidate's profile and score */}
                <div className="bg-slate-800 rounded-2xl p-5 mt-5">

                  <p className="font-semibold mb-4">
                    AI Interview Questions
                  </p>

                  <div className="space-y-3">

                    {getInterviewQuestions(selectedCandidate).map(
                      (question, index) => (

                      <div
                        key={index}
                        className="bg-slate-900 rounded-xl p-4 text-slate-300"
                      >
                        <strong className="text-white mr-2">
                          {index + 1}.
                        </strong>

                        {question}
                      </div>

                    ))}

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

        

      </div>

    </div>
  );
}