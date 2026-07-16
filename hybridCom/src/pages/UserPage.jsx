import { useContext, useMemo, useState } from "react";
import { Calendar, Mail, MapPin, Pencil, Phone, Save, User, X } from "lucide-react";
import { UserContext } from "../context/UserContext";

function UserPage() {
  const { user, setUser } = useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dob: user?.dob || "",
  });

  const avatarInitial = useMemo(() => {
    return (user?.username?.trim()?.charAt(0) || "U").toUpperCase();
  }, [user?.username]);

  const addressLines = [
    user?.address?.line1,
    user?.address?.line2,
    [user?.address?.city, user?.address?.state, user?.address?.pincode]
      .filter(Boolean)
      .join(", "),
  ].filter(Boolean);

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const saveUserInfo = () => {
    setUser((current) => ({
      ...current,
      ...formData,
    }));
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phone || "",
      dob: user?.dob || "",
    });
    setIsEditing(false);
  };

  return (
    <div className="h-full overflow-y-auto bg-black px-5 py-8 pb-28 text-zinc-100">
      <main className="mx-auto flex max-w-4xl flex-col gap-6">
        <section className="rounded-2xl border border-zinc-800 bg-[#1b1b1d] p-5 sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-400/30 bg-zinc-900 text-3xl font-bold text-amber-400">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.username || "User"} avatar`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarInitial
                )}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase text-amber-400">
                  My Account
                </p>
                <h1 className="truncate text-3xl font-bold text-zinc-100">
                  {user?.username}
                </h1>
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-3">
                <button
                  onClick={cancelEditing}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-zinc-700 text-zinc-300 transition hover:bg-zinc-800"
                  aria-label="Cancel editing"
                  title="Cancel"
                >
                  <X size={18} />
                </button>
                <button
                  onClick={saveUserInfo}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-amber-400 text-black transition hover:bg-amber-300"
                  aria-label="Save user details"
                  title="Save"
                >
                  <Save size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-zinc-800 text-amber-400 transition hover:bg-zinc-700"
                aria-label="Edit user details"
                title="Edit"
              >
                <Pencil size={18} />
              </button>
            )}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <ProfileField
            icon={<User size={18} />}
            label="Username"
            value={formData.username}
            isEditing={isEditing}
            onChange={(value) => updateField("username", value)}
          />
          <ProfileField
            icon={<Mail size={18} />}
            label="Email"
            type="email"
            value={formData.email}
            isEditing={isEditing}
            onChange={(value) => updateField("email", value)}
          />
          <ProfileField
            icon={<Phone size={18} />}
            label="Phone no"
            type="tel"
            value={formData.phone}
            isEditing={isEditing}
            onChange={(value) => updateField("phone", value)}
          />
          <ProfileField
            icon={<Calendar size={18} />}
            label="DOB"
            type="date"
            value={formData.dob}
            isEditing={isEditing}
            onChange={(value) => updateField("dob", value)}
          />
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-[#1b1b1d] p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-amber-400">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Address</h2>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black/30 p-4">
            <p className="font-semibold text-zinc-100">{user?.address?.label || "Home"}</p>
            <div className="mt-2 space-y-1 text-sm text-zinc-400">
              {addressLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function ProfileField({ icon, label, type = "text", value, isEditing, onChange }) {
  const inputId = `profile-${label.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-[#1b1b1d] p-5">
      <label htmlFor={inputId} className="mb-3 flex items-center gap-3 text-sm font-semibold text-zinc-400">
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-amber-400">
            {icon}
          </span>
        )}
        {label}
      </label>

      {isEditing ? (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 outline-none transition focus:border-amber-400"
        />
      ) : (
        <p className="min-h-12 break-words rounded-xl bg-black/30 px-4 py-3 text-lg font-semibold text-zinc-100">
          {type === "date" && value ? new Date(value).toLocaleDateString("en-IN") : value}
        </p>
      )}
    </div>
  );
}

export default UserPage;
