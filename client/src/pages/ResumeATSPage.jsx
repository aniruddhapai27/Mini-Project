import ResumeATS from "../components/ResumeATS";

const ResumeATSPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Resume ATS Analysis
            </h1>
            <p className="text-gray-400 text-lg">
              Get instant ATS compatibility scores and personalized improvement suggestions for your resume
            </p>
          </div>
          <ResumeATS />
        </div>
      </div>
    </div>
  );
};

export default ResumeATSPage;
