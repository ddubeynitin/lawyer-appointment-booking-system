const connectDB = require("../src/config/db");
const Admin = require("../src/models/admin.model");

const getArgValue = (flag) => {
  const idx = process.argv.indexOf(flag);
  if (idx === -1 || idx === process.argv.length - 1) return "";
  return String(process.argv[idx + 1] || "").trim();
};

const getInput = (key, fallbackFlag) =>
  String(process.env[key] || getArgValue(fallbackFlag) || "").trim();

const createFirstAdmin = async () => {
  const name = getInput("ADMIN_NAME", "--name");
  const email = getInput("ADMIN_EMAIL", "--email").toLowerCase();
  const password = getInput("ADMIN_PASSWORD", "--password");

  if (!name || !email || !password) {
    throw new Error(
      "Missing required values. Provide ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD or pass --name, --email, and --password.",
    );
  }

  const existingCount = await Admin.countDocuments();
  if (existingCount > 0) {
    throw new Error("An admin already exists. Use the normal admin login and create-admin route instead.");
  }

  const admin = await Admin.create({
    name,
    email,
    password,
    role: "admin",
  });

  console.log("First admin created successfully:");
  console.log(
    JSON.stringify(
      {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
      null,
      2,
    ),
  );
};

const main = async () => {
  try {
    await connectDB();
    await createFirstAdmin();
  } catch (err) {
    console.error("Failed to bootstrap admin:", err.message);
    process.exitCode = 1;
  }
};

main();
