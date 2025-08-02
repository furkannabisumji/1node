import type { Route } from "./+types/onboarding";
import { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router";
import { User, Globe, Bell, Wallet, Check, LogIn } from "lucide-react";
import { ProgressBar } from "../components/onboarding/ProgressBar";
import { FormCard } from "../components/onboarding/FormCard";
import { NavigationButtons } from "../components/onboarding/NavigationButtons";
import { Step1Form } from "../components/onboarding/Step1Form";
import { Step2Form } from "../components/onboarding/Step2Form";
import { Step3Form } from "../components/onboarding/Step3Form";
import { ConnectKitButton } from "connectkit";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { useAuth } from "~/auth/AuthProvider";
import axiosInstance from "~/lib/axios";
import axios from "axios";
import { Bounce, toast } from "react-toastify";


// --- New: ConnectWalletStep component ---
function ConnectWalletStep({
  onConnect,
  onAlreadyRegisteredSignIn,
  showAlreadyRegistered,
  registering,
}: {
  onConnect: () => void;
  onAlreadyRegisteredSignIn: () => void;
  showAlreadyRegistered?: boolean;
  registering?: boolean;
}) {

  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      onConnect();
    }
  }, [isConnected]);

  return (
    <FormCard icon={<Wallet size={30} />} title="Connect Your Wallet">
      <div className="flex flex-col items-center gap-6 py-4">
        <p className="text-neutral-500 text-center">
          To get started, please connect your crypto wallet. This will allow you to interact with DeFi automations.
        </p>
        <ConnectKitButton.Custom>
          {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
            return (
              <>
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${isConnected
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-neutral-800 hover:bg-neutral-700 text-white cursor-pointer"
                    }`}
                  onClick={show}
                  disabled={isConnected}
                >
                  <Wallet className="w-5 h-5" />
                  {isConnected ? "Wallet Connected" : "Connect Wallet"}
                  {isConnected && <Check className="w-5 h-5 text-green-300" />}
                </button>
                {isConnected && (
                  <div className="text-green-500 text-sm flex items-center gap-1">
                    <Check className="w-4 h-4" /> Connected!
                  </div>
                )}
              </>
            );
          }}
        </ConnectKitButton.Custom>


      </div>
    </FormCard>
  );
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Onboarding - 1Node DeFi Automations" },
    { name: "description", content: "Set up your account for automated DeFi strategies" },
  ];
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [registering, setRegistering] = useState(false);
  const [userRegisterError, setUserRegisterError] = useState('');
  const [showAlreadyRegistered, setShowAlreadyRegistered] = useState(false);
  
  // Hooks
  const { isConnected, address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user]);

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

  const handleConnectWallet = () => {
    setWalletConnected(true);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const TOTAL_STEPS = 4;

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form and redirect to dashboard
      await signIn();
      // TODO: Send data to backend
      // Redirect to dashboard after successful onboarding
      // navigate('/dashboard');
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

  // New: Only sign in (skip registration) for already registered users
  const signInOnly = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first.', {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
// force red background
      });
      return;
    }
    const message = `Sign this message to authenticate. Timestamp: ${Date.now()}`;
    try {
      setRegistering(true);
      const signature = await signMessageAsync({ message });

      const { data: AuthenticationSuccess } = await axiosInstance.post(
        '/auth/connect-wallet',
        {
          walletAddress: address,
          signature,
          message,
        }
      );
      if (AuthenticationSuccess) {
        setRegistering(false);
        navigate('/dashboard');
      }
    } catch (err) {
      setRegistering(false);
      if (axios.isAxiosError(err)) {
        setUserRegisterError(err.response?.data?.error);
      } else {
        setUserRegisterError('Unexpected error during sign in.');
      }
    }
  };

  const signIn = async () => {
    const message = `Sign this message to authenticate. Timestamp: ${Date.now()}`;
    try {
      setRegistering(true);
      const signature = await signMessageAsync({ message });

      // First, register the user (with email, username, etc.), then connect-wallet for authentication
      const { data: registerRes, status } = await axiosInstance.post('/auth/register', {
        walletAddress: address,
        email: step1Data.email,
        username: step1Data.username,
        riskTolerance: step1Data.riskTolerance,
        preferredChains: step2Data,
        notificationPrefs: step3Data,
        signature: signature,
        message: message,
      });

      // If user already exists (409), show Already registered? Sign in button
      if (status === 409) {
        setShowAlreadyRegistered(true);
        setRegistering(false);
        setUserRegisterError('You are already registered. Please sign in.');
        return;
      }

      if (status !== 201 && status !== 409) {
        // status 201 is "Created" (successful registration)
        throw new Error(registerRes?.error || 'Registration failed');
      }

      const { data: AuthenticationSuccess } = await axiosInstance.post(
        '/auth/connect-wallet',
        {
          walletAddress: address,
          signature,
          message,
        }
      );
      if (AuthenticationSuccess) {
        setUser(registerRes.user);
        setRegistering(false);
        navigate('/dashboard');
      }
    } catch (err) {
      setRegistering(false);
      if (axios.isAxiosError(err)) {
        // If error is user already exists, show Already registered? Sign in button
        if (err.response?.status === 409) {
          setShowAlreadyRegistered(true);
          setUserRegisterError('You are already registered. Please sign in.');
        } else {
          setUserRegisterError(err.response?.data?.error);
        }
      } else {
        setUserRegisterError('Unexpected error during registration.');
      }
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ConnectWalletStep
            onConnect={handleConnectWallet}
            onAlreadyRegisteredSignIn={signInOnly}
            showAlreadyRegistered={showAlreadyRegistered}
            registering={registering}
          />
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
            <Step3Form formData={step3Data} onUpdate={handleStep3Update} error={userRegisterError} />
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

        {/* Already registered? Sign in button */}

        <div className="flex flex-row items-center gap-2 mt-4">
          <span className="text-neutral-500 text-sm">Already registered?</span>
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer rounded-md hover:bg-neutral-800 text-white font-medium transition-colors disabled:opacity-60"
            onClick={signInOnly}
            disabled={registering}
            type="button"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </button>
        </div>
        {/* Navigation */}
        <NavigationButtons
          onPrevious={handlePrevious}
          onNext={handleNext}
          previousDisabled={currentStep === 1}
          nextDisabled={isNextDisabled()}
          isLastStep={currentStep === TOTAL_STEPS}
          loading={registering}
        />
      </div>
    </main>
  );
}