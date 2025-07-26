import { Mail } from "lucide-react";

interface Step3Data {
  emailNotifications: boolean;
  notificationEmail: string;
}

interface Step3FormProps {
  formData: Step3Data;
  onUpdate: (field: keyof Step3Data, value: boolean | string) => void;
}

export function Step3Form({ formData, onUpdate }: Step3FormProps) {
  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="border border-neutral-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-green-500" />
            <div>
              <h3 className="text-white font-medium">Email</h3>
              <p className="text-neutral-500 text-sm">Receive alerts via email</p>
            </div>
          </div>
          <button
            onClick={() => onUpdate('emailNotifications', !formData.emailNotifications)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.emailNotifications ? 'bg-white' : 'bg-neutral-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                formData.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {formData.emailNotifications && (
          <input
            type="email"
            value={formData.notificationEmail}
            onChange={(e) => onUpdate('notificationEmail', e.target.value)}
            placeholder="Email address for notification"
            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-500 text-white rounded-lg focus:outline-none focus:ring-0"
          />
        )}
      </div>
    </div>
  );
}