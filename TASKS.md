# Tasks - NewsAPI to NewsData.io Replacement

- [x] **Phase 1: Environment & Config Configuration**
  - [x] Add `NEWSDATA_API_KEY` and remove `NEWS_API_KEY` in `backend/.env`
  - [x] Create `backend/src/config/newsData.config.js`
  - [x] Remove `backend/src/config/newsApi.config.js`
- [x] **Phase 2: Service Layer & Normalization**
  - [x] Create `backend/src/service/newsdata.service.js` with normalization mapping
  - [x] Remove `backend/src/service/newsapi.service.js`
- [x] **Phase 3: Integration & Fallback Logic**
  - [x] Update `backend/src/service/newsProvider.service.js` to use NewsData.io instead of NewsAPI
- [x] **Phase 4: Testing & Verification**
  - [x] Create `backend/test-newsdata.js`
  - [x] Remove `backend/test-newsapi.js`
  - [x] Test GNews rate limit fallback to NewsData.io
