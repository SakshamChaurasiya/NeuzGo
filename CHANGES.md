# Changes - NewsAPI to NewsData.io Replacement

## Phase 1: Environment & Config Configuration
- Removed `NEWS_API_KEY` from `backend/.env` and added `NEWSDATA_API_KEY` placeholder
- Created Axios client for NewsData.io at `backend/src/config/newsData.config.js`
- Removed obsolete NewsAPI Axios configuration at `backend/src/config/newsApi.config.js`

## Phase 2: Service Layer & Normalization
- Created `backend/src/service/newsdata.service.js` with `fetchTopHeadlines` implementation mapping parameters and mapping/normalizing response structure from NewsData.io to internal schema format.
- Removed obsolete NewsAPI service file `backend/src/service/newsapi.service.js`.

## Phase 3: Integration & Fallback Logic
- Modified `backend/src/service/newsProvider.service.js` to import and invoke the new NewsData.io service (`newsdata.service.js`) instead of NewsAPI, adapting all log statements and error messages to reflect the new provider.

## Phase 4: Testing & Verification
- Created test helper script `backend/test-newsdata.js` to verify raw API requests and normalization formatting of NewsData.io.
- Removed obsolete test script `backend/test-newsapi.js`.
- Verified error boundaries and configuration validations.
