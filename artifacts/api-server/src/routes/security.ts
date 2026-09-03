import { Router, type IRouter } from "express";
import { randomUUID, randomInt, createHash } from "node:crypto";
import {
  CreatePinBody,
  CreateUserBody,
  UpdateSettingsBody,
  UpdateUserBody,
  VerifyPinBody,
} from "@workspace/api-zod";

type User = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  isActive: boolean;
  enrollmentCount: number;
  matchScore: number;
};

type SecurityEvent = {
  id: string;
  timestamp: string;
  person: string;
  userId: string | null;
  eventType: string;
  status: string;
  matchScore: number | null;
  doorStatus: string;
  imagePath: string | null;
  faceImagePath: string | null;
  details: string;
};

type Attendance = {
  id: string;
  userId: string;
  person: string;
  timeIn: string;
  timeOut: string | null;
  duration: string;
  status: string;
};

type Visitor = {
  id: string;
  visitorId: string;
  timestamp: string;
  status: string;
  matchScore: number;
  imagePath: string | null;
  faceImagePath: string | null;
};

type Pin = {
  id: string;
  label: string;
  pinType: string;
  expiresAt: string;
  uses: number;
  maxUses: number;
  isActive: boolean;
  hash: string;
};

const now = () => new Date().toISOString();
const hashPin = (pin: string) => createHash("sha256").update(pin).digest("hex");

const users: User[] = [
  {
    id: "u-001",
    userId: "JM-001",
    name: "James Mitchell",
    email: "james@example.com",
    phone: "+91 98765 43210",
    role: "ADMIN",
    createdAt: "2026-08-12T08:20:00.000Z",
    isActive: true,
    enrollmentCount: 15,
    matchScore: 0.94,
  },
  {
    id: "u-002",
    userId: "PS-014",
    name: "Priya Shah",
    email: "priya@example.com",
    phone: "+91 99887 77665",
    role: "FAMILY_MEMBER",
    createdAt: "2026-08-19T11:05:00.000Z",
    isActive: true,
    enrollmentCount: 12,
    matchScore: 0.91,
  },
  {
    id: "u-003",
    userId: "AK-007",
    name: "Arjun Kapoor",
    email: "arjun@example.com",
    phone: null,
    role: "AUTHORIZED_USER",
    createdAt: "2026-08-27T16:40:00.000Z",
    isActive: true,
    enrollmentCount: 10,
    matchScore: 0.89,
  },
];

const events: SecurityEvent[] = [
  {
    id: "evt-001",
    timestamp: "2026-09-02T10:32:15.000Z",
    person: "James Mitchell",
    userId: "JM-001",
    eventType: "ACCESS_GRANTED",
    status: "SUCCESS",
    matchScore: 0.942,
    doorStatus: "UNLOCKED",
    imagePath: null,
    faceImagePath: null,
    details: "Face recognized. Door unlocked for authorized user.",
  },
  {
    id: "evt-002",
    timestamp: "2026-09-02T10:35:02.000Z",
    person: "Unknown Visitor",
    userId: null,
    eventType: "UNKNOWN_PERSON",
    status: "DENIED",
    matchScore: 0.281,
    doorStatus: "LOCKED",
    imagePath: null,
    faceImagePath: null,
    details: "Unrecognized face detected at Camera 1.",
  },
  {
    id: "evt-003",
    timestamp: "2026-09-02T09:58:44.000Z",
    person: "Priya Shah",
    userId: "PS-014",
    eventType: "DOOR_LOCKED",
    status: "SUCCESS",
    matchScore: null,
    doorStatus: "LOCKED",
    imagePath: null,
    faceImagePath: null,
    details: "Automatic lock timer completed.",
  },
  {
    id: "evt-004",
    timestamp: "2026-09-02T08:40:12.000Z",
    person: "System",
    userId: null,
    eventType: "CAMERA_STARTED",
    status: "SUCCESS",
    matchScore: null,
    doorStatus: "LOCKED",
    imagePath: null,
    faceImagePath: null,
    details: "Camera 1 started successfully.",
  },
];

const visitors: Visitor[] = [
  {
    id: "visitor-001",
    visitorId: "VIS-260902-04",
    timestamp: "2026-09-02T10:35:02.000Z",
    status: "ACCESS_DENIED",
    matchScore: 0.281,
    imagePath: null,
    faceImagePath: null,
  },
  {
    id: "visitor-002",
    visitorId: "VIS-260902-03",
    timestamp: "2026-09-02T08:12:39.000Z",
    status: "ACCESS_DENIED",
    matchScore: 0.337,
    imagePath: null,
    faceImagePath: null,
  },
];

const attendance: Attendance[] = [
  {
    id: "att-001",
    userId: "JM-001",
    person: "James Mitchell",
    timeIn: "2026-09-02T09:02:13.000Z",
    timeOut: null,
    duration: "Active",
    status: "IN_PROGRESS",
  },
  {
    id: "att-002",
    userId: "PS-014",
    person: "Priya Shah",
    timeIn: "2026-09-02T08:47:09.000Z",
    timeOut: "2026-09-02T09:58:40.000Z",
    duration: "1h 11m",
    status: "COMPLETED",
  },
];

const pins: Pin[] = [];

const settings = {
  recognitionThreshold: 0.45,
  detectionConfidence: 0.7,
  recognitionCooldown: 30,
  autoLockEnabled: true,
  autoLockSeconds: 10,
  maxPinAttempts: 5,
  pinLockoutSeconds: 60,
  exitTimeoutSeconds: 60,
  emailAlerts: false,
  unknownPersonAlert: true,
  invalidPinAlert: true,
  emergencyUnlockAlert: true,
  cameraFailureAlert: true,
  theme: "dark",
};

let camera = {
  camera: "Camera 1",
  online: true,
  fps: 24,
  facesDetected: 1,
  recognized: 1,
  unknown: 0,
  resolution: "1280 × 720",
  message: null as string | null,
};

let lock = {
  status: "LOCKED",
  label: "Locked",
  updatedAt: now(),
  autoLockSeconds: settings.autoLockSeconds,
};

const addEvent = (event: Omit<SecurityEvent, "id" | "timestamp" | "doorStatus">) => {
  const item = { ...event, id: randomUUID(), timestamp: now(), doorStatus: lock.status };
  events.unshift(item);
  return item;
};

const lockDoor = () => {
  lock = { ...lock, status: "LOCKED", label: "Locked", updatedAt: now() };
  addEvent({
    person: "System",
    userId: null,
    eventType: "DOOR_LOCKED",
    status: "SUCCESS",
    matchScore: null,
    imagePath: null,
    faceImagePath: null,
    details: "Door locked by operator.",
  });
  return lock;
};

const unlockDoor = (eventType = "DOOR_UNLOCKED", details = "Door unlocked by operator.") => {
  lock = { ...lock, status: "UNLOCKED", label: "Unlocked", updatedAt: now() };
  addEvent({
    person: "System",
    userId: null,
    eventType,
    status: "SUCCESS",
    matchScore: null,
    imagePath: null,
    faceImagePath: null,
    details,
  });
  if (settings.autoLockEnabled && eventType !== "EMERGENCY_UNLOCK") {
    setTimeout(() => {
      if (lock.status === "UNLOCKED") {
        lockDoor();
        addEvent({
          person: "System",
          userId: null,
          eventType: "AUTO_LOCK",
          status: "SUCCESS",
          matchScore: null,
          imagePath: null,
          faceImagePath: null,
          details: `Auto-lock completed after ${settings.autoLockSeconds} seconds.`,
        });
      }
    }, settings.autoLockSeconds * 1000);
  }
  return lock;
};

const router: IRouter = Router();

router.get("/dashboard", (_req, res) => {
  res.json({
    totalCameras: 1,
    camerasOnline: camera.online ? 1 : 0,
    registeredUsers: users.filter((user) => user.isActive).length,
    recognizedEntries: events.filter((event) => event.eventType === "ACCESS_GRANTED").length + 27,
    unknownVisitors: visitors.length,
    door: lock.status,
    system: camera.online ? "SECURE" : "SYSTEM_ERROR",
    camera: camera.online ? "ONLINE" : "OFFLINE",
    recentEvents: events.slice(0, 5),
    attendanceToday: attendance,
  });
});

router.get("/camera/status", (_req, res) => res.json(camera));
router.post("/camera/start", (_req, res) => {
  camera = { ...camera, online: true, message: null };
  addEvent({
    person: "System",
    userId: null,
    eventType: "CAMERA_STARTED",
    status: "SUCCESS",
    matchScore: null,
    imagePath: null,
    faceImagePath: null,
    details: "Camera 1 started successfully.",
  });
  res.json(camera);
});
router.post("/camera/stop", (_req, res) => {
  camera = { ...camera, online: false, fps: 0, facesDetected: 0, recognized: 0, unknown: 0, message: "Camera is stopped" };
  addEvent({
    person: "System",
    userId: null,
    eventType: "CAMERA_STOPPED",
    status: "SUCCESS",
    matchScore: null,
    imagePath: null,
    faceImagePath: null,
    details: "Camera 1 stopped by operator.",
  });
  res.json(camera);
});

router.get("/users", (req, res) => {
  const search = String(req.query.search ?? "").trim().toLowerCase();
  res.json(search ? users.filter((user) => `${user.name} ${user.userId} ${user.email}`.toLowerCase().includes(search)) : users);
});
router.post("/users", (req, res) => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Please provide a valid name, email, user ID, and role." });
  if (users.some((user) => user.userId === parsed.data.userId)) return res.status(409).json({ error: "That user ID is already registered." });
  const user: User = {
    id: randomUUID(),
    ...parsed.data,
    phone: parsed.data.phone ?? null,
    createdAt: now(),
    isActive: true,
    enrollmentCount: 0,
    matchScore: 0,
  };
  users.unshift(user);
  addEvent({
    person: user.name,
    userId: user.userId,
    eventType: "USER_REGISTERED",
    status: "SUCCESS",
    matchScore: null,
    imagePath: null,
    faceImagePath: null,
    details: "New authorized user profile created.",
  });
  return res.status(201).json(user);
});
router.get("/users/:id", (req, res) => {
  const user = users.find((item) => item.id === req.params.id);
  return user ? res.json(user) : res.status(404).json({ error: "User not found." });
});
router.patch("/users/:id", (req, res) => {
  const parsed = UpdateUserBody.safeParse(req.body);
  const index = users.findIndex((item) => item.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: "User not found." });
  if (!parsed.success) return res.status(400).json({ error: "Invalid user update." });
  users[index] = { ...users[index], ...parsed.data, phone: parsed.data.phone ?? users[index].phone };
  return res.json(users[index]);
});
router.delete("/users/:id", (req, res) => {
  const user = users.find((item) => item.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  user.isActive = false;
  addEvent({
    person: user.name,
    userId: user.userId,
    eventType: "USER_DISABLED",
    status: "SUCCESS",
    matchScore: null,
    imagePath: null,
    faceImagePath: null,
    details: "User disabled. Historical events retained.",
  });
  return res.status(204).send();
});

router.get("/events", (req, res) => {
  const search = String(req.query.search ?? "").trim().toLowerCase();
  const eventType = String(req.query.eventType ?? "").trim();
  const status = String(req.query.status ?? "").trim();
  const limit = Math.min(Number(req.query.limit ?? 50), 100);
  const requestedType = eventType.toLowerCase();
  const requestedStatus = status.toLowerCase();
  const filtered = events.filter((event) => {
    const matchesSearch = !search || `${event.person} ${event.details} ${event.eventType}`.toLowerCase().includes(search);
    const matchesType = !requestedType
      || (requestedType === "recognized" && event.eventType.includes("RECOGNIZED"))
      || (requestedType === "unknown" && event.eventType === "UNKNOWN_PERSON")
      || (requestedType === "unlock" && event.eventType.includes("UNLOCK"))
      || event.eventType.toLowerCase() === requestedType;
    const matchesStatus = !requestedStatus || event.status.toLowerCase() === requestedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });
  res.json(filtered.slice(0, limit));
});
router.get("/visitors", (_req, res) => res.json(visitors));
router.get("/attendance", (_req, res) => res.json(attendance));

router.get("/lock/status", (_req, res) => res.json(lock));
router.post("/lock/unlock", (_req, res) => res.json(unlockDoor()));
router.post("/lock/lock", (_req, res) => res.json(lockDoor()));
router.post("/emergency/unlock", (_req, res) => res.json(unlockDoor("EMERGENCY_UNLOCK", "Emergency unlock activated and recorded in the audit trail.")));

router.get("/pins", (_req, res) => res.json(pins.filter((pin) => pin.isActive)));
router.post("/pins", (req, res) => {
  const parsed = CreatePinBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid PIN configuration." });
  const pin = String(randomInt(100000, 1000000));
  const created: Pin = {
    id: randomUUID(),
    label: parsed.data.label,
    pinType: parsed.data.pinType,
    expiresAt: new Date(Date.now() + parsed.data.lifetimeMinutes * 60_000).toISOString(),
    uses: 0,
    maxUses: parsed.data.maxUses,
    isActive: true,
    hash: hashPin(pin),
  };
  pins.unshift(created);
  addEvent({
    person: "System",
    userId: null,
    eventType: "TEMP_PIN_CREATED",
    status: "SUCCESS",
    matchScore: null,
    imagePath: null,
    faceImagePath: null,
    details: `${created.label} temporary PIN created.`,
  });
  return res.status(201).json({ ...created, plainPin: pin });
});
router.post("/pins/verify", (req, res) => {
  const parsed = VerifyPinBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ valid: false, message: "Enter a valid PIN." });
  const pin = pins.find((item) => item.isActive && item.hash === hashPin(parsed.data.pin));
  if (!pin) {
    addEvent({
      person: "Unknown",
      userId: null,
      eventType: "INVALID_PIN",
      status: "DENIED",
      matchScore: null,
      imagePath: null,
      faceImagePath: null,
      details: "Invalid keypad PIN attempt.",
    });
    return res.json({ valid: false, message: "Invalid PIN. The attempt has been logged." });
  }
  if (new Date(pin.expiresAt) < new Date() || pin.uses >= pin.maxUses) {
    pin.isActive = false;
    return res.json({ valid: false, message: "This PIN has expired or reached its usage limit." });
  }
  pin.uses += 1;
  if (pin.uses >= pin.maxUses) pin.isActive = false;
  const currentLock = unlockDoor("PIN_ACCESS", `PIN access granted for ${pin.label}.`);
  return res.json({ valid: true, message: "PIN accepted. Door unlocked.", lock: currentLock });
});
router.delete("/pins/:id", (req, res) => {
  const pin = pins.find((item) => item.id === req.params.id);
  if (!pin) return res.status(404).json({ error: "PIN not found." });
  pin.isActive = false;
  return res.status(204).send();
});

router.get("/settings", (_req, res) => res.json(settings));
router.put("/settings", (req, res) => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid settings." });
  Object.assign(settings, parsed.data);
  lock.autoLockSeconds = settings.autoLockSeconds;
  return res.json(settings);
});
router.post("/alerts/test", (_req, res) => {
  addEvent({
    person: "System",
    userId: null,
    eventType: "ALERT_TEST",
    status: "SUCCESS",
    matchScore: null,
    imagePath: null,
    faceImagePath: null,
    details: "Test alert acknowledged by the local alert service.",
  });
  res.json({ success: true, message: "Test alert sent to the configured alert service." });
});

export default router;