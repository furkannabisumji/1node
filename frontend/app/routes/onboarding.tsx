import type { Route } from "./+types/onboarding";
import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Globe, Bell, Wallet, Check } from "lucide-react";
import { ProgressBar } from "../components/onboarding/ProgressBar";
import { FormCard } from "../components/onboarding/FormCard";
import { NavigationButtons } from "../components/onboarding/NavigationButtons";
import { Step1Form } from "../components/onboarding/Step1Form";
import { Step2Form } from "../components/onboarding/Step2Form";
import { Step3Form } from "../components/onboarding/Step3Form";

// --- New: ConnectWalletStep component ---
function ConnectWalletStep({ connected, onConnect }: { connected: boolean; onConnect: () => void }) {
  return (
    <FormCard icon={<Wallet size={30} />} title="Connect Your Wallet">
      <div className="flex flex-col items-center gap-6 py-4">
        <p className="text-neutral-500 text-center">
          To get started, please connect your crypto wallet. This will allow you to interact with DeFi automations.
        </p>
        <button
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            connected
              ? "bg-green-600 text-white cursor-default"
              : "bg-neutral-800 hover:bg-neutral-700 text-white"
          }`}
          onClick={onConnect}
          disabled={connected}
        >
          <Wallet className="w-5 h-5" />
          {connected ? "Wallet Connected" : "Connect Wallet"}
          {connected && <Check className="w-5 h-5 text-green-300" />}
        </button>
        {connected && (
          <div className="text-green-500 text-sm flex items-center gap-1">
            <Check className="w-4 h-4" /> Connected!
          </div>
        )}
      </div>
    </FormCard>
  );
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Onboarding - 1Node DeFi Automations" },
    { name: "description", content: "Set up your account for automated DeFi strategies" },
  ];
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // New: Wallet connection state
  const [walletConnected, setWalletConnected] = useState(false);

  const [step1Data, setStep1Data] = useState({
    username: '',
    email: '',
    timezone: 'UTC',
    riskTolerance: ''
  });
  const [step2Data, setStep2Data] = useState<string[]>([]);
  const [step3Data, setStep3Data] = useState({
    emailNotifications: false,
    notificationEmail: ''
  });

  const handleStep1Update = (field: keyof typeof step1Data, value: string) => {
    setStep1Data(prev => ({ ...prev, [field]: value }));
  };

  const handleStep2Update = (chains: string[]) => {
    setStep2Data(chains);
  };

  const handleStep3Update = (field: keyof typeof step3Data, value: boolean | string) => {
    setStep3Data(prev => ({ ...prev, [field]: value }));
  };

  // New: Simulate wallet connect (replace with real wallet connect logic)
  const handleConnectWallet = () => {
    setWalletConnected(true);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const TOTAL_STEPS = 4;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form and redirect to dashboard
      console.log('Submit', { step1Data, step2Data, step3Data });
      // TODO: Send data to backend
      // Redirect to dashboard after successful onboarding
      navigate('/dashboard');
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      return !walletConnected;
    }
    if (currentStep === 2) {
      return !step1Data.username || !step1Data.email || !step1Data.riskTolerance;
    }
    if (currentStep === 3) {
      return step2Data.length === 0;
    }
    if (currentStep === 4) {
      return step3Data.emailNotifications && !step3Data.notificationEmail;
    }
    return false;
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ConnectWalletStep connected={walletConnected} onConnect={handleConnectWallet} />
        );
      case 2:
        return (
          <FormCard 
            icon={<User size={30} />}
            title="Basic Information"
          >
            <Step1Form formData={step1Data} onUpdate={handleStep1Update} />
          </FormCard>
        );
      case 3:
        return (
          <FormCard 
            icon={<Globe size={30} />}
            title="Preferred Chains"
          >
            <Step2Form selectedChains={step2Data} onUpdate={handleStep2Update} />
          </FormCard>
        );
      case 4:
        return (
          <FormCard 
            icon={<Bell size={30} />}
            title="Notification Channels"
          >
            <Step3Form formData={step3Data} onUpdate={handleStep3Update} />
          </FormCard>
        );
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
            Welcome to 1Node
          </h1>
          <p className="text-lg text-neutral-500 ">
            Let's set up your account for automated DeFi strategies
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />

        {/* Dynamic Form Content */}
        {getStepContent()}

        {/* Navigation */}
        <NavigationButtons 
          onPrevious={handlePrevious}
          onNext={handleNext}
          previousDisabled={currentStep === 1}
          nextDisabled={isNextDisabled()}
          isLastStep={currentStep === TOTAL_STEPS}
        />
      </div>
    </main>
  );
}