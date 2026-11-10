// Firebase web app settings, from Firebase console → Project settings →
// General → Your apps → SDK setup and configuration → "Config".
//
// These values are not secrets: they identify the project to the browser and
// are visible in any deployed Firebase site. Access is controlled by
// `firestore.rules`, not by hiding this config.
//
// While `apiKey` is empty, feedback buttons fall back to `feedbackForm` in
// `feedback-config.ts` (the Google Form).
export const firebaseConfig = {
  apiKey: "AIzaSyBCC6L46Dc5nSuJsJ6EDBv-rba9UOU3rEk",
  authDomain: "kor-startup-us-gov-guide.firebaseapp.com",
  projectId: "kor-startup-us-gov-guide",
  appId: "1:82923168311:web:29adff50610cdbb795d5b2",
}

export const firebaseEnabled = firebaseConfig.apiKey !== ""
