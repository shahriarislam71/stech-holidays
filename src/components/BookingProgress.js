const BookingProgress = ({ currentStep }) => {
  const steps = [
    { id: "select", name: "Select Flight" },
    { id: "user-info", name: "Traveler Info" },
    { id: "payment", name: "Payment" },
    { id: "confirmation", name: "Confirmation" },
  ];

  return (
    <div className="bg-white py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between relative">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === step.id
                    ? "bg-[#5A53A7] text-white"
                    : currentStep === "payment" && step.id === "user-info"
                    ? "bg-green-100 text-green-800"
                    : steps.findIndex((s) => s.id === currentStep) > index
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`mt-2 text-sm font-medium ${
                  currentStep === step.id
                    ? "text-[#5A53A7]"
                    : steps.findIndex((s) => s.id === currentStep) > index
                    ? "text-green-800"
                    : "text-gray-600"
                }`}
              >
                {step.name}
              </span>
            </div>
          ))}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 mx-10">
            <div
              className="h-full bg-[#5A53A7] transition-all duration-300"
              style={{
                width: `${(steps.findIndex((step) => step.id === currentStep) / (steps.length - 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingProgress;