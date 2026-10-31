
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import AdminReminder from "@/models/admin/adminDetails/AdminReminder";
import User from "@/models/admin/User";
import { getAuthUser } from "@/lib/getAuthUser";

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 330 * 60 * 1000;

const VALID_PRESETS = new Set([
  "today",
  "yesterday",
  "tomorrow",
  "custom",
]);

/**
 * Returns the start of today in IST, represented as a UTC Date.
 */
function getTodayStartIST() {
  const now = new Date();
  const nowIST = new Date(now.getTime() + IST_OFFSET_MS);

  const startOfTodayIST = Date.UTC(
    nowIST.getUTCFullYear(),
    nowIST.getUTCMonth(),
    nowIST.getUTCDate(),
  );

  return new Date(startOfTodayIST - IST_OFFSET_MS);
}

/**
 * Validates YYYY-MM-DD and parses midnight IST.
 *
 * Do not compare date.toISOString().slice(0, 10) with the
 * input string: midnight IST belongs to the previous UTC date.
 */
function parseISTDate(dateString) {
  if (typeof dateString !== "string") {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  // Validate the calendar date independently of the timezone.
  const calendarDate = new Date(Date.UTC(year, month - 1, day));

  if (
    calendarDate.getUTCFullYear() !== year ||
    calendarDate.getUTCMonth() !== month - 1 ||
    calendarDate.getUTCDate() !== day
  ) {
    return null;
  }

  return new Date(`${dateString}T00:00:00+05:30`);
}

/**
 * Date presets:
 * today     -> today in IST
 * yesterday -> yesterday in IST
 * tomorrow  -> tomorrow in IST
 * custom    -> inclusive custom date range
 *
 * The end boundary is exclusive.
 */
function getReminderRange(preset, fromStr, toStr) {
  const today = getTodayStartIST();

  if (preset === "yesterday") {
    return {
      from: new Date(today.getTime() - DAY_MS),
      to: today,
    };
  }

  if (preset === "tomorrow") {
    return {
      from: new Date(today.getTime() + DAY_MS),
      to: new Date(today.getTime() + 2 * DAY_MS),
    };
  }

  if (preset === "custom") {
    if (!fromStr) {
      return {
        error: "Please select a start date for the custom range.",
      };
    }

    const from = parseISTDate(fromStr);
    const endDate = parseISTDate(toStr || fromStr);

    if (!from || !endDate) {
      return {
        error: "Please select valid custom dates.",
      };
    }

    if (endDate < from) {
      return {
        error: "The end date cannot be earlier than the start date.",
      };
    }

    return {
      from,
      // Include the entire selected end date in IST.
      to: new Date(endDate.getTime() + DAY_MS),
    };
  }

  // Default preset: today
  return {
    from: today,
    to: new Date(today.getTime() + DAY_MS),
  };
}

export async function GET(req) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);

    if (!authUser?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = authUser._id;
    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Authenticated user not found",
        },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(req.url);

    const preset = searchParams.get("preset") || "today";
    const fromStr = searchParams.get("from") || "";
    const toStr = searchParams.get("to") || "";

    if (!VALID_PRESETS.has(preset)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reminder date preset.",
        },
        { status: 400 },
      );
    }

    const range = getReminderRange(preset, fromStr, toStr);

    if (range.error) {
      return NextResponse.json(
        {
          success: false,
          message: range.error,
        },
        { status: 400 },
      );
    }

    const { from, to } = range;

    // Fetch only the authenticated user's personal reminders.
    const record = await AdminReminder.findOne({ userId })
      .select("reminder")
      .lean();

    // Filter by date before sorting and limiting.
    const reminders = Array.isArray(record?.reminder)
      ? record.reminder
          .filter((item) => {
            const reminderDate = new Date(item.reminderAt);

            return (
              !Number.isNaN(reminderDate.getTime()) &&
              reminderDate >= from &&
              reminderDate < to
            );
          })
          .sort(
            (a, b) =>
              new Date(a.reminderAt).getTime() -
              new Date(b.reminderAt).getTime(),
          )
          .slice(0, 20)
      : [];

    return NextResponse.json(
      {
        success: true,
        message: "Reminders fetched successfully",
        data: {
          reminder: reminders,
        },
        range: {
          preset,
          from,
          to,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Manager reminder GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const authUser = await getAuthUser(req);

    if (!authUser?._id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = authUser._id;
    const userExists = await User.exists({ _id: userId });

    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Authenticated user not found",
        },
        { status: 404 },
      );
    }

    const body = await req.json();
    const { reminder } = body;

    if (!Array.isArray(reminder) || reminder.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "A reminder is required",
        },
        { status: 400 },
      );
    }

    const normalizedReminders = [];

    for (const item of reminder) {
      const description =
        typeof item?.description === "string"
          ? item.description.trim()
          : "";

      const reminderDate = new Date(item?.reminderAt);

      if (
        !description ||
        !item?.reminderAt ||
        Number.isNaN(reminderDate.getTime())
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Each reminder requires a description and a valid reminder date",
          },
          { status: 400 },
        );
      }

      normalizedReminders.push({
        description,
        reminderAt: reminderDate,
        cc_email: Array.isArray(item.cc_email) ? item.cc_email : [],
      });
    }

    const result = await AdminReminder.findOneAndUpdate(
      { userId },
      {
        $push: {
          reminder: {
            $each: normalizedReminders,
          },
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    );

    return NextResponse.json(
      {
        success: true,
        message: "Manager reminder saved successfully",
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Manager reminder POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    );
  }
}
