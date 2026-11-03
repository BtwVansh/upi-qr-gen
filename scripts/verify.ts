import assert from "node:assert/strict";
import {
  buildPaymentHref,
  buildPaymentPath,
  buildPaymentUrl,
  buildUpiUri,
  formatAmountInr,
  normalizeUpiId,
  readAmountParam,
  readUpiRouteParam,
  validateAmount,
  validateUpiId,
} from "@/lib/upi";
import { getAppLaunchUrl, PAYMENT_APPS } from "@/lib/payment-apps";
import { detectDeviceFromSignals, type DeviceSignals } from "@/lib/device";

let passed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed += 1;
    console.log(`  ✓ ${name}`);
  } catch (error) {
    console.error(`  ✗ ${name}`);
    throw error;
  }
}

console.log("\nUPI ID normalisation and validation");
test("trims surrounding whitespace", () => {
  assert.equal(normalizeUpiId("  name@okaxis  "), "name@okaxis");
});
test("accepts the documented examples", () => {
  for (const id of ["name@okaxis", "username@ybl", "number@paytm", "a@ybl"]) {
    assert.equal(validateUpiId(id).valid, true, id);
  }
});
test("preserves case", () => {
  assert.deepEqual(validateUpiId("ABCD@OKAXIS"), {
    valid: true,
    upiId: "ABCD@OKAXIS",
  });
});
test("rejects empty input", () => {
  assert.equal(validateUpiId("   ").valid, false);
});
test("rejects internal whitespace", () => {
  assert.equal(validateUpiId("na me@okaxis").valid, false);
});
test("rejects a missing @", () => {
  assert.equal(validateUpiId("nameokaxis").valid, false);
});
test("rejects multiple @ characters", () => {
  assert.equal(validateUpiId("name@@okaxis").valid, false);
  assert.equal(validateUpiId("name@ok@axis").valid, false);
});
test("rejects invalid local-part characters", () => {
  assert.equal(validateUpiId("na/me@okaxis").valid, false);
  assert.equal(validateUpiId("na%40me@okaxis").valid, false);
});
test("rejects invalid separators at the edges", () => {
  assert.equal(validateUpiId(".name@okaxis").valid, false);
  assert.equal(validateUpiId("name.@okaxis").valid, false);
  assert.equal(validateUpiId("name@-okaxis").valid, false);
});
test("rejects a missing or too-short bank handle", () => {
  assert.equal(validateUpiId("name@").valid, false);
  assert.equal(validateUpiId("name@a").valid, false);
});
test("route params are decoded exactly once", () => {
  // Next.js 15 delivers dynamic params percent-encoded.
  assert.deepEqual(readUpiRouteParam("name%40okaxis"), {
    valid: true,
    upiId: "name@okaxis",
  });
  // A runtime that already decoded the value still works.
  assert.deepEqual(readUpiRouteParam("name@okaxis"), {
    valid: true,
    upiId: "name@okaxis",
  });
  // A deliberately double-encoded URL is not decoded twice: the literal
  // percent sequence remains and fails syntax validation.
  assert.equal(readUpiRouteParam("name%2540okaxis").valid, false);
  assert.equal(readUpiRouteParam("%E0%A4%A").valid, false);
});

console.log("\nOptional payment amount");
test("treats a blank amount as an open amount", () => {
  assert.deepEqual(validateAmount(""), { valid: true, amount: null });
  assert.deepEqual(validateAmount("   "), { valid: true, amount: null });
  assert.deepEqual(readAmountParam(undefined), { valid: true, amount: null });
});
test("accepts positive amounts with up to two decimals", () => {
  assert.deepEqual(validateAmount("500"), { valid: true, amount: "500.00" });
  assert.deepEqual(validateAmount("12.5"), { valid: true, amount: "12.50" });
  assert.deepEqual(validateAmount("0.99"), { valid: true, amount: "0.99" });
  assert.deepEqual(validateAmount(" ₹ 1250.75 "), {
    valid: true,
    amount: "1250.75",
  });
});
test("rejects zero, negative and malformed amounts", () => {
  for (const value of ["0", "0.00", "-5", "1.234", "abc", "1e3", "1,000"]) {
    assert.equal(validateAmount(value).valid, false, value);
  }
});
test("rejects repeated amount query params", () => {
  assert.equal(readAmountParam(["500", "600"]).valid, false);
  assert.deepEqual(readAmountParam("500"), { valid: true, amount: "500.00" });
});
test("formats the amount as Indian rupees", () => {
  assert.match(formatAmountInr("500"), /500\.00/);
});
test("encodes the amount in the UPI URI when set", () => {
  assert.equal(
    buildUpiUri("ABCD@OKAXIS", "500.00"),
    "upi://pay?pa=ABCD%40OKAXIS&am=500.00&cu=INR",
  );
  assert.equal(
    buildUpiUri("ABCD@OKAXIS"),
    "upi://pay?pa=ABCD%40OKAXIS&cu=INR",
  );
});
test("carries the amount in the shareable payment URL", () => {
  assert.equal(
    buildPaymentHref("ABCD@OKAXIS", "500.00"),
    "/pay/ABCD%40OKAXIS?amount=500.00",
  );
  assert.equal(
    buildPaymentUrl("ABCD@OKAXIS", "500.00"),
    "https://upigenerator.netlify.app/pay/ABCD%40OKAXIS?amount=500.00",
  );
  assert.equal(
    buildPaymentHref("ABCD@OKAXIS"),
    "/pay/ABCD%40OKAXIS",
  );
});

console.log("\nUPI URI and payment URL construction");
test("encodes @ exactly once", () => {
  assert.equal(
    buildUpiUri("ABCD@OKAXIS"),
    "upi://pay?pa=ABCD%40OKAXIS&cu=INR",
  );
});
test("does not include an amount unless one is set", () => {
  assert.equal(buildUpiUri("name@okaxis").includes("am="), false);
});
test("uses INR", () => {
  assert.match(buildUpiUri("name@okaxis"), /[?&]cu=INR(&|$)/);
});
test("payment path encodes @ once", () => {
  assert.equal(buildPaymentPath("ABCD@OKAXIS"), "/pay/ABCD%40OKAXIS");
  assert.equal(buildPaymentPath("ABCD@OKAXIS").includes("%2540"), false);
});
test("payment URL targets the production domain", () => {
  assert.equal(
    buildPaymentUrl("name@okaxis"),
    "https://upigenerator.netlify.app/pay/name%40okaxis",
  );
});

console.log("\nPlatform-specific payment application launches");
const upiUri = buildUpiUri("name@okaxis");
const fallback = buildPaymentUrl("name@okaxis");
const googlePayApp = PAYMENT_APPS[0];
const phonePeApp = PAYMENT_APPS[1];
const paytmApp = PAYMENT_APPS[2];

test("Android uses package-targeted UPI intents for all three apps", () => {
  const packageByApp: Record<string, string> = {
    "google-pay": "com.google.android.apps.nbu.paisa.user",
    phonepe: "com.phonepe.app",
    paytm: "net.one97.paytm",
  };
  for (const app of PAYMENT_APPS) {
    const url = getAppLaunchUrl(app, "android", upiUri, fallback);
    assert.ok(url, `${app.name} should have a URL`);
    assert.match(url, /^intent:\/\/pay\?/);
    assert.match(url, /#Intent;/);
    assert.match(url, /scheme=upi/);
    assert.match(url, new RegExp(`package=${packageByApp[app.id]}`));
    assert.match(url, /pa=name%40okaxis/);
    assert.match(url, /cu=INR/);
    assert.match(url, /S\.browser_fallback_url=https%3A%2F%2F/);
    assert.equal(url.includes("gpay://"), false);
    assert.equal(url.includes("phonepe://"), false);
    assert.equal(url.includes("paytmmp://"), false);
  }
});
test("iOS uses each app's own scheme, never Android intents", () => {
  const gpay = getAppLaunchUrl(googlePayApp, "ios", upiUri, fallback);
  const phonepe = getAppLaunchUrl(phonePeApp, "ios", upiUri, fallback);
  const paytm = getAppLaunchUrl(paytmApp, "ios", upiUri, fallback);

  assert.equal(gpay, "gpay://upi/pay?pa=name%40okaxis&cu=INR");
  assert.equal(phonepe, "phonepe://pay?pa=name%40okaxis&cu=INR");
  assert.equal(paytm, "paytmmp://pay?pa=name%40okaxis&cu=INR");

  for (const url of [gpay, phonepe, paytm]) {
    assert.equal(url?.includes("intent://"), false);
  }
});
test("app launch URLs keep the same amount", () => {
  const amountUri = buildUpiUri("name@okaxis", "500.00");
  const android = getAppLaunchUrl(googlePayApp, "android", amountUri, fallback);
  const ios = getAppLaunchUrl(googlePayApp, "ios", amountUri, fallback);

  assert.match(android ?? "", /am=500\.00/);
  assert.match(ios ?? "", /am=500\.00/);
});
test("desktop and unknown platforms never receive a mobile launch URL", () => {
  for (const platform of ["windows", "macos", "linux", "other", "unknown"] as const) {
    for (const app of PAYMENT_APPS) {
      assert.equal(getAppLaunchUrl(app, platform, upiUri, fallback), null);
    }
  }
});

console.log("\nDevice and platform detection");
const androidPhone: DeviceSignals = {
  userAgent:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  platform: "Linux armv8l",
  uaPlatform: "Android",
  maxTouchPoints: 5,
};
const androidTablet: DeviceSignals = {
  ...androidPhone,
  userAgent:
    "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};
const iphone: DeviceSignals = {
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  platform: "iPhone",
  uaPlatform: "iOS",
  maxTouchPoints: 5,
};
const ipad: DeviceSignals = {
  userAgent:
    "Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  platform: "iPad",
  uaPlatform: "iOS",
  maxTouchPoints: 5,
};
const ipadDesktopUA: DeviceSignals = {
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  platform: "MacIntel",
  uaPlatform: "macOS",
  maxTouchPoints: 5,
};
const windows: DeviceSignals = {
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  platform: "Win32",
  uaPlatform: "Windows",
  maxTouchPoints: 0,
};
const mac: DeviceSignals = {
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
  platform: "MacIntel",
  uaPlatform: "macOS",
  maxTouchPoints: 0,
};
const linux: DeviceSignals = {
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  platform: "Linux x86_64",
  uaPlatform: "Linux",
  maxTouchPoints: 0,
};

test("detects Android phones and tablets", () => {
  for (const signals of [androidPhone, androidTablet]) {
    const device = detectDeviceFromSignals(signals);
    assert.equal(device.platform, "android");
    assert.equal(device.isMobile, true);
    assert.equal(device.supportsAppLaunch, true);
  }
});
test("detects iPhones and iPads", () => {
  const phone = detectDeviceFromSignals(iphone);
  assert.equal(phone.platform, "ios");
  assert.equal(phone.label, "iPhone");
  assert.equal(phone.isMobile, true);
  assert.equal(phone.supportsAppLaunch, true);
  assert.equal(phone.isIPad, false);

  for (const signals of [ipad, ipadDesktopUA]) {
    const device = detectDeviceFromSignals(signals);
    assert.equal(device.platform, "ios");
    assert.equal(device.label, "iPad");
    assert.equal(device.isMobile, true);
    assert.equal(device.supportsAppLaunch, true);
    assert.equal(device.isIPad, true);
  }
});
test("detects Windows, macOS and Linux as desktops", () => {
  for (const [signals, platform] of [
    [windows, "windows"],
    [mac, "macos"],
    [linux, "linux"],
  ] as const) {
    const device = detectDeviceFromSignals(signals);
    assert.equal(device.platform, platform);
    assert.equal(device.isDesktop, true);
    assert.equal(device.isMobile, false);
    assert.equal(device.supportsAppLaunch, false);
  }
});
test("detects ChromeOS as an unsupported platform", () => {
  const device = detectDeviceFromSignals({
    userAgent:
      "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    platform: "Linux x86_64",
    uaPlatform: "Chrome OS",
    maxTouchPoints: 0,
  });
  assert.equal(device.platform, "other");
  assert.equal(device.supportsAppLaunch, false);
});
test("falls back safely for unknown platforms", () => {
  const device = detectDeviceFromSignals({
    userAgent: "SomeUnusualConsole/1.0",
    platform: "",
    maxTouchPoints: 0,
  });
  assert.equal(device.platform, "other");
  assert.equal(device.supportsAppLaunch, false);
});

console.log(`\n${passed} checks passed.\n`);
