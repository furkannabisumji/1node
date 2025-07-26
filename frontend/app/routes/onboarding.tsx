import type { Route } from "./+types/onboarding";
import { useState } from "react";
import {User, User2, User2Icon} from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Onboarding - 1Node DeFi Automations" },
    { name: "description", content: "Set up your account for automated DeFi strategies" },
  ];
}

export default function Onboarding() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    timezone: 'UTC',
    riskTolerance: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // TODO: Navigate to step 2
    console.log('Next step', formData);
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-500 ">Step 1 of 3</span>
          </div>
          <div className="w-full bg-neutral-900 rounded-full h-2.5 border border-white ">
            <div className="bg-white h-2 rounded-full" style={{width: '33.33%'}}></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="  border-neutral-50 bg-neutral-900/50 rounded-xl p-8 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
             <User size={30} />
            </div>
            <h2 className="text-xl font-semibold text-black dark:text-white">
              Basic Information
            </h2>
          </div>

          <div className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 bg-neutral-900 border dark:border-neutral-500 text-black dark:text-white rounded-lg focus:outline-none focus:ring-0 "
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-3 bg-neutral-900 border dark:border-neutral-500 text-black dark:text-white rounded-lg focus:outline-none focus:ring-0 "
              />
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-4 py-3 bg-neutral-900 border dark:border-neutral-500 text-black dark:text-white rounded-lg focus:outline-none focus:ring-0 "
              >
                <option value="UTC">UTC</option>
                <option value="EST">EST</option>
                <option value="PST">PST</option>
                <option value="CET">CET</option>
                <option value="JST">JST</option>
              </select>
            </div>

            {/* Risk Tolerance */}
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-4">
                Risk Tolerance
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['Conservative', 'Moderate', 'Aggressive'].map((risk) => (
                  <button
                    key={risk}
                    onClick={() => handleInputChange('riskTolerance', risk)}
                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                      formData.riskTolerance === risk
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-black dark:text-white border-gray-300 dark:border-neutral-800 hover:border-white'
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button className="px-6 py-3 border border-gray-300 dark:border-neutral-800 cursor-pointer text-black dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-neutral-900 transition-all">
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-white cursor-pointer hover:bg-white text-black rounded-lg font-medium transition-all flex items-center gap-2"
          >
            Next
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}