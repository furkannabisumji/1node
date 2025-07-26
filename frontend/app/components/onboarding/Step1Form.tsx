import { User } from "lucide-react";

interface Step1Data {
  username: string;
  email: string;
  timezone: string;
  riskTolerance: string;
}

interface Step1FormProps {
  formData: Step1Data;
  onUpdate: (field: keyof Step1Data, value: string) => void;
}

export function Step1Form({ formData, onUpdate }: Step1FormProps) {
  return (
    <div className="space-y-6">
      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-black dark:text-white mb-2">
          Username
        </label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => onUpdate('username', e.target.value)}
          placeholder="Enter username"
          className="w-full px-4 py-3 bg-neutral-900 border dark:border-neutral-500 text-black dark:text-white rounded-lg focus:outline-none focus:ring-0"
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
          onChange={(e) => onUpdate('email', e.target.value)}
          placeholder="Enter email address"
          className="w-full px-4 py-3 bg-neutral-900 border dark:border-neutral-500 text-black dark:text-white rounded-lg focus:outline-none focus:ring-0"
        />
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-black dark:text-white mb-2">
          Timezone
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => onUpdate('timezone', e.target.value)}
          className="w-full px-4 py-3 bg-neutral-900 border dark:border-neutral-500 text-black dark:text-white rounded-lg focus:outline-none focus:ring-0"
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
              onClick={() => onUpdate('riskTolerance', risk)}
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
  );
}