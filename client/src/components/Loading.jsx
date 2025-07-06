import FailsafeDotLottieLoader from "./FailsafeDotLottieLoader";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <FailsafeDotLottieLoader
        size="w-20 h-20"
        text={message}
        layout="vertical"
        textSize="text-lg"
        textColor="text-gray-600 dark:text-gray-300"
      />
    </div>
  );
};

export default Loading;
