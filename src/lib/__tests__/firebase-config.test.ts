import { describe, it, expect } from "vitest";
import {
  validateFirebaseConfig,
  type FirebaseConfig,
} from "@/lib/firebase";

// -----------------------------------------------------------------------------
// validateFirebaseConfig
// -----------------------------------------------------------------------------

describe("validateFirebaseConfig", () => {
  const validConfig: FirebaseConfig = {
    apiKey: "AIzaSyTestKey123",
    authDomain: "my-project.firebaseapp.com",
    projectId: "my-project",
    storageBucket: "my-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123",
    measurementId: "G-TEST123",
  };

  it("returns empty array for a fully valid config", () => {
    expect(validateFirebaseConfig(validConfig)).toEqual([]);
  });

  it("detects missing apiKey", () => {
    const config = { ...validConfig, apiKey: "" };
    expect(validateFirebaseConfig(config)).toContain("apiKey");
  });

  it("detects missing authDomain", () => {
    const config = { ...validConfig, authDomain: "" };
    expect(validateFirebaseConfig(config)).toContain("authDomain");
  });

  it("detects missing projectId", () => {
    const config = { ...validConfig, projectId: "" };
    expect(validateFirebaseConfig(config)).toContain("projectId");
  });

  it("detects missing appId", () => {
    const config = { ...validConfig, appId: "" };
    expect(validateFirebaseConfig(config)).toContain("appId");
  });

  it("reports all missing required fields at once", () => {
    const config: FirebaseConfig = {
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
      measurementId: "",
    };
    const missing = validateFirebaseConfig(config);
    expect(missing).toEqual(["apiKey", "authDomain", "projectId", "appId"]);
  });

  it("does not require optional fields (storageBucket, messagingSenderId, measurementId)", () => {
    const config: FirebaseConfig = {
      ...validConfig,
      storageBucket: "",
      messagingSenderId: "",
      measurementId: "",
    };
    expect(validateFirebaseConfig(config)).toEqual([]);
  });
});
