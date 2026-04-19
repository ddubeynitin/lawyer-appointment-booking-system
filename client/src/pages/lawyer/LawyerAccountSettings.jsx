import { useState } from "react";
import { ChevronDown, Bell, Lock, Eye, FileText, Clock, DollarSign, Shield } from "lucide-react";
import LawyerHeader from "../../components/common/LawyerHeader";
import { useAuth } from "../../context/AuthContext";

const LawyerAccountSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [expandedSection, setExpandedSection] = useState(null);

  // Account Settings State
  const [accountSettings, setAccountSettings] = useState({
    email: user?.email || "",
    phone: user?.phone || "",
    emergencyContact: "",
    timezone: "Asia/Kolkata",
  });

  // Professional Settings State
  const [professionalSettings, setProfessionalSettings] = useState({
    specialization: user?.specialization || "",
    licenseNumber: "",
    barCouncil: "",
    yearsOfExperience: "",
    language: "English",
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailBookingConfirmation: true,
    emailRescheduleRequest: true,
    emailReviewNotification: true,
    smsBookingAlert: false,
    smsAppointmentReminder: true,
    inAppNotifications: true,
  });

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true,
    showAverageRating: true,
  });

  // Service Settings State
  const [serviceSettings, setServiceSettings] = useState({
    consultationFee: "500",
    minConsultationDuration: "30",
    maxDailyAppointments: "8",
    acceptOnlineAppointments: true,
    acceptInPersonAppointments: true,
    autoAcceptAppointments: false,
    appointmentBufferTime: "15",
  });

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAccountChange = (field, value) => {
    setAccountSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleProfessionalChange = (field, value) => {
    setProfessionalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleServiceChange = (field, value) => {
    setServiceSettings(prev => ({ ...prev, [field]: value }));
  };

  const SettingSection = ({ title, description, icon: Icon, isExpanded, onToggle, children }) => (
    <div className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon size={20} className="text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`text-slate-400 transition transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="p-5 space-y-4 border-t border-slate-200">
          {children}
        </div>
      )}
    </div>
  );

  const InputField = ({ label, type = "text", value, onChange, placeholder }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );

  const SelectField = ({ label, value, onChange, options }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  const ToggleSwitch = ({ label, description, checked, onChange }) => (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-b-0">
      <div>
        <p className="font-medium text-slate-700">{label}</p>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 font-barlow">
      <LawyerHeader />

      <main className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <section className="mb-8">
          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <h1 className="text-3xl font-bold text-slate-800">Account Settings</h1>
            <p className="mt-2 text-slate-500">Manage your profile, preferences, and notification settings</p>
          </div>
        </section>

        {/* Settings Content */}
        <div className="space-y-4">
          {/* Account Information Section */}
          <SettingSection
            title="Account Information"
            description="Manage your basic account details"
            icon={Shield}
            isExpanded={expandedSection === "account"}
            onToggle={() => toggleSection("account")}
          >
            <div className="grid gap-4">
              <InputField
                label="Email Address"
                type="email"
                value={accountSettings.email}
                onChange={(e) => handleAccountChange("email", e.target.value)}
                placeholder="your@email.com"
              />
              <InputField
                label="Phone Number"
                type="tel"
                value={accountSettings.phone}
                onChange={(e) => handleAccountChange("phone", e.target.value)}
                placeholder="+91 98765 43210"
              />
              <InputField
                label="Emergency Contact"
                type="tel"
                value={accountSettings.emergencyContact}
                onChange={(e) => handleAccountChange("emergencyContact", e.target.value)}
                placeholder="Emergency contact number"
              />
              <SelectField
                label="Timezone"
                value={accountSettings.timezone}
                onChange={(e) => handleAccountChange("timezone", e.target.value)}
                options={[
                  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
                  { value: "Asia/Dubai", label: "Asia/Dubai (GST)" },
                  { value: "Asia/Bangkok", label: "Asia/Bangkok (ICT)" },
                  { value: "UTC", label: "UTC" },
                ]}
              />
              <button className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition">
                Save Changes
              </button>
            </div>
          </SettingSection>

          {/* Professional Information Section */}
          <SettingSection
            title="Professional Information"
            description="Update your legal credentials and expertise"
            icon={FileText}
            isExpanded={expandedSection === "professional"}
            onToggle={() => toggleSection("professional")}
          >
            <div className="grid gap-4">
              <SelectField
                label="Specialization"
                value={professionalSettings.specialization}
                onChange={(e) => handleProfessionalChange("specialization", e.target.value)}
                options={[
                  { value: "", label: "Select specialization" },
                  { value: "Civil Law", label: "Civil Law" },
                  { value: "Criminal Law", label: "Criminal Law" },
                  { value: "Corporate Law", label: "Corporate Law" },
                  { value: "Family Law", label: "Family Law" },
                  { value: "Intellectual Property", label: "Intellectual Property" },
                  { value: "Labor Law", label: "Labor Law" },
                ]}
              />
              <InputField
                label="License Number"
                value={professionalSettings.licenseNumber}
                onChange={(e) => handleProfessionalChange("licenseNumber", e.target.value)}
                placeholder="Enter your license number"
              />
              <InputField
                label="Bar Council Registration"
                value={professionalSettings.barCouncil}
                onChange={(e) => handleProfessionalChange("barCouncil", e.target.value)}
                placeholder="Enter your bar council"
              />
              <InputField
                label="Years of Experience"
                type="number"
                value={professionalSettings.yearsOfExperience}
                onChange={(e) => handleProfessionalChange("yearsOfExperience", e.target.value)}
                placeholder="Enter years of experience"
              />
              <SelectField
                label="Preferred Language"
                value={professionalSettings.language}
                onChange={(e) => handleProfessionalChange("language", e.target.value)}
                options={[
                  { value: "English", label: "English" },
                  { value: "Hindi", label: "Hindi" },
                  { value: "Spanish", label: "Spanish" },
                  { value: "French", label: "French" },
                ]}
              />
              <button className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition">
                Save Changes
              </button>
            </div>
          </SettingSection>

          {/* Service Settings Section */}
          <SettingSection
            title="Service Settings"
            description="Configure your consultation fees and appointment preferences"
            icon={DollarSign}
            isExpanded={expandedSection === "service"}
            onToggle={() => toggleSection("service")}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Consultation Fee (Rs)"
                type="number"
                value={serviceSettings.consultationFee}
                onChange={(e) => handleServiceChange("consultationFee", e.target.value)}
                placeholder="500"
              />
              <InputField
                label="Min Consultation Duration (mins)"
                type="number"
                value={serviceSettings.minConsultationDuration}
                onChange={(e) => handleServiceChange("minConsultationDuration", e.target.value)}
                placeholder="30"
              />
              <InputField
                label="Max Daily Appointments"
                type="number"
                value={serviceSettings.maxDailyAppointments}
                onChange={(e) => handleServiceChange("maxDailyAppointments", e.target.value)}
                placeholder="8"
              />
              <InputField
                label="Appointment Buffer Time (mins)"
                type="number"
                value={serviceSettings.appointmentBufferTime}
                onChange={(e) => handleServiceChange("appointmentBufferTime", e.target.value)}
                placeholder="15"
              />
            </div>

            <div className="mt-4 space-y-3 pt-4 border-t border-slate-200">
              <ToggleSwitch
                label="Accept Online Appointments"
                description="Allow clients to book online consultations"
                checked={serviceSettings.acceptOnlineAppointments}
                onChange={(val) => handleServiceChange("acceptOnlineAppointments", val)}
              />
              <ToggleSwitch
                label="Accept In-Person Appointments"
                description="Allow clients to book in-person meetings"
                checked={serviceSettings.acceptInPersonAppointments}
                onChange={(val) => handleServiceChange("acceptInPersonAppointments", val)}
              />
              <ToggleSwitch
                label="Auto-Accept Appointments"
                description="Automatically accept new appointment requests"
                checked={serviceSettings.autoAcceptAppointments}
                onChange={(val) => handleServiceChange("autoAcceptAppointments", val)}
              />
            </div>

            <button className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition">
              Save Changes
            </button>
          </SettingSection>

          {/* Notification Preferences Section */}
          <SettingSection
            title="Notification Preferences"
            description="Control how you receive notifications"
            icon={Bell}
            isExpanded={expandedSection === "notifications"}
            onToggle={() => toggleSection("notifications")}
          >
            <div className="space-y-3 pt-2">
              <div>
                <h4 className="font-medium text-slate-800 mb-3">Email Notifications</h4>
                <div className="space-y-2">
                  <ToggleSwitch
                    label="Booking Confirmation"
                    checked={notificationSettings.emailBookingConfirmation}
                    onChange={(val) => handleNotificationChange("emailBookingConfirmation", val)}
                  />
                  <ToggleSwitch
                    label="Reschedule Requests"
                    checked={notificationSettings.emailRescheduleRequest}
                    onChange={(val) => handleNotificationChange("emailRescheduleRequest", val)}
                  />
                  <ToggleSwitch
                    label="Review Notifications"
                    checked={notificationSettings.emailReviewNotification}
                    onChange={(val) => handleNotificationChange("emailReviewNotification", val)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-800 mb-3">SMS Alerts</h4>
                <div className="space-y-2">
                  <ToggleSwitch
                    label="Booking Alert"
                    checked={notificationSettings.smsBookingAlert}
                    onChange={(val) => handleNotificationChange("smsBookingAlert", val)}
                  />
                  <ToggleSwitch
                    label="Appointment Reminder"
                    checked={notificationSettings.smsAppointmentReminder}
                    onChange={(val) => handleNotificationChange("smsAppointmentReminder", val)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-medium text-slate-800 mb-3">In-App Notifications</h4>
                <ToggleSwitch
                  label="Enable In-App Notifications"
                  description="Receive notifications within the application"
                  checked={notificationSettings.inAppNotifications}
                  onChange={(val) => handleNotificationChange("inAppNotifications", val)}
                />
              </div>
            </div>

            <button className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition">
              Save Changes
            </button>
          </SettingSection>

          {/* Privacy Settings Section */}
          <SettingSection
            title="Privacy Settings"
            description="Control your profile visibility and data sharing"
            icon={Eye}
            isExpanded={expandedSection === "privacy"}
            onToggle={() => toggleSection("privacy")}
          >
            <div className="grid gap-4">
              <SelectField
                label="Profile Visibility"
                value={privacySettings.profileVisibility}
                onChange={(e) => handlePrivacyChange("profileVisibility", e.target.value)}
                options={[
                  { value: "public", label: "Public - Visible to everyone" },
                  { value: "private", label: "Private - Visible only to contacts" },
                  { value: "verified", label: "Verified Users - Visible only to verified users" },
                ]}
              />

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <ToggleSwitch
                  label="Show Email Address"
                  description="Allow clients to see your email"
                  checked={privacySettings.showEmail}
                  onChange={(val) => handlePrivacyChange("showEmail", val)}
                />
                <ToggleSwitch
                  label="Show Phone Number"
                  description="Allow clients to see your phone number"
                  checked={privacySettings.showPhone}
                  onChange={(val) => handlePrivacyChange("showPhone", val)}
                />
                <ToggleSwitch
                  label="Allow Direct Messages"
                  description="Let clients send you direct messages"
                  checked={privacySettings.allowDirectMessages}
                  onChange={(val) => handlePrivacyChange("allowDirectMessages", val)}
                />
                <ToggleSwitch
                  label="Show Average Rating"
                  description="Display your average rating on profile"
                  checked={privacySettings.showAverageRating}
                  onChange={(val) => handlePrivacyChange("showAverageRating", val)}
                />
              </div>
            </div>

            <button className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition">
              Save Changes
            </button>
          </SettingSection>

          {/* Security Settings Section */}
          <SettingSection
            title="Security Settings"
            description="Manage your account security and password"
            icon={Lock}
            isExpanded={expandedSection === "security"}
            onToggle={() => toggleSection("security")}
          >
            <div className="grid gap-4">
              <InputField
                label="Current Password"
                type="password"
                placeholder="Enter your current password"
              />
              <InputField
                label="New Password"
                type="password"
                placeholder="Enter new password"
              />
              <InputField
                label="Confirm Password"
                type="password"
                placeholder="Confirm new password"
              />

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700 mt-4">
                <p className="font-medium">Password Requirements:</p>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li>At least 8 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include at least one number</li>
                  <li>Include at least one special character</li>
                </ul>
              </div>

              <button className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 transition">
                Update Password
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="font-semibold text-slate-800 mb-3">Active Sessions</h4>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">Chrome on Windows</p>
                    <p className="text-sm text-slate-500">Last active today at 2:30 PM</p>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700 font-medium">Logout</button>
                </div>
              </div>
              <button className="mt-3 text-sm text-slate-600 hover:text-slate-700 font-medium">
                Logout from all other sessions
              </button>
            </div>
          </SettingSection>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Need help? <a href="/contact-us" className="text-blue-600 hover:underline">Contact our support team</a></p>
        </div>
      </main>
    </div>
  );
};

export default LawyerAccountSettings;
