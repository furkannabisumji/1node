import { type ReactNode } from "react";

interface FormCardProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}

export function FormCard({ icon, title, children }: FormCardProps) {
  return (
    <div className="border-neutral-50 bg-neutral-900/50 rounded-xl p-8 shadow-lg">
      <div className={`flex items-center mb-6 ${title === 'Connect Your Wallet' ? 'justify-center' : ''}`}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3">
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-black dark:text-white">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}