import { db } from "../src/lib/db";

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@ekamai.in").toLowerCase().trim();

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", status: "ACTIVE" },
    create: {
      email: adminEmail,
      name: "EKAM Admin",
      role: "ADMIN",
      plan: "ENTERPRISE",
      credits: 1000,
      status: "ACTIVE",
    },
  });
  console.log("Admin user:", admin.email, "(", admin.role, ")");

  const defaults: Record<string, string> = {
    "flag.flow": "true",
    "flag.pentest": "true",
    "flag.search": "true",
    "flag.signup": "true",
    "flag.team": "true",
    "announcement.active": "false",
    "pricing.currency": "usd",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await db.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  await db.announcement.upsert({
    where: { id: "welcome" },
    update: {},
    create: {
      id: "welcome",
      title: "Welcome to EKAM AI",
      body: "Your dashboard is ready. Create a project, run a scan, or research a market.",
      level: "info",
      active: false,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
