import DotLottieLoader from "./DotLottieLoader";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <DotLottieLoader 
        size="lg" 
        text={message} 
        layout="vertical"
        color="blue"
      />
    </div>
  );
};

export default Loading;
