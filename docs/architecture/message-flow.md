# Message Flow

## `START_SCAN`

- Sender: `popup.js`
- Receiver: `background.js`
- Purpose: Begin a scan of the current LinkedIn page
- Payload: none
- Expected response: `{ success: boolean, message: string }`

## `DETECT_PAGE`

- Sender: `background.js`
- Receiver: `content.js`
- Purpose: Determine whether the active tab is a supported LinkedIn page
- Payload: none
- Expected response: `{ success: true, pageType: "search" | "company-people" | "profile" | "activity" | "company" | "feed" | "unknown" }`

## `SCAN_SEARCH_RESULTS`

- Sender: `background.js`
- Receiver: `content.js`
- Purpose: Extract visible profile cards from the current page
- Payload: none
- Expected response: `{ success: boolean, profiles?: Array<Profile> }`

## `PROFILE_PAGE_READY`

- Sender: `content.js`
- Receiver: `background.js` listeners in `verificationWorker.js`
- Purpose: Signal that a profile page has loaded and is ready for verification
- Payload: `{ profileUrl }`
- Expected response: none

## `VERIFY_PROFILE`

- Sender: `verificationWorker.js`
- Receiver: `content.js`
- Purpose: Ask the profile page to extract identity and experience data
- Payload: `{ profileUrl }`
- Expected response: none on the direct send; `PROFILE_VERIFIED` arrives asynchronously

## `PROFILE_VERIFIED`

- Sender: `content.js`
- Receiver: `verificationWorker.js`
- Purpose: Return verified profile data
- Payload: `{ profileUrl, fullName, verified, headline, currentCompany, location, currentRole, currentlyWorking, employmentConfidence, experience }`
- Expected response: none

## `ACTIVITY_PAGE_READY`

- Sender: `content.js`
- Receiver: `verificationWorker.js`
- Purpose: Signal that the activity page is ready for extraction
- Payload: none
- Expected response: none

## `EXTRACT_ACTIVITY_INTELLIGENCE`

- Sender: `verificationWorker.js`
- Receiver: `content.js`
- Purpose: Request activity intelligence extraction
- Payload: none
- Expected response: `{ success: true }` plus asynchronous `ACTIVITY_INTELLIGENCE_EXTRACTED`

## `ACTIVITY_INTELLIGENCE_EXTRACTED`

- Sender: `content.js`
- Receiver: `verificationWorker.js`
- Purpose: Return serialized activity intelligence for the active profile
- Payload: `{ recentPosts, signals, analysis }`
- Expected response: none

## `CAPTURE_ACTIVITY_SNAPSHOT`

- Sender: `popup.js`
- Receiver: `background.js`
- Purpose: Capture raw HTML from the active LinkedIn activity page
- Payload: none
- Expected response: `{ success: boolean, html?: string, filename?: string, message: string }`

